import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await supabaseAuth.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    const { reportType, periodStart, periodEnd } = await req.json();

    if (!periodStart || !periodEnd) {
      return new Response(
        JSON.stringify({ error: "Period start and end dates are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch infringements for the period
    const { data: infringements, error: infError } = await supabase
      .from("road_infringements")
      .select("*")
      .gte("occurred_at", periodStart)
      .lte("occurred_at", periodEnd)
      .order("occurred_at", { ascending: true });

    if (infError) {
      console.error("Error fetching infringements:", infError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch infringement data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch incidents for the period
    const { data: incidents, error: incError } = await supabase
      .from("ai_incidents")
      .select("*")
      .gte("created_at", periodStart)
      .lte("created_at", periodEnd);

    if (incError) console.error("Error fetching incidents:", incError);

    // Count monitored vehicles and drivers
    const { count: vehicleCount } = await supabase
      .from("vehicles")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    const { count: driverCount } = await supabase
      .from("drivers")
      .select("id", { count: "exact", head: true });

    // Aggregate data
    const allInfringements = infringements || [];
    const allIncidents = incidents || [];

    const severityCounts = {
      minor: allInfringements.filter(i => i.severity === "minor").length,
      moderate: allInfringements.filter(i => i.severity === "moderate").length,
      serious: allInfringements.filter(i => i.severity === "serious").length,
      major: allInfringements.filter(i => i.severity === "major").length,
    };

    // Type breakdown
    const typeBreakdown: Record<string, number> = {};
    allInfringements.forEach(inf => {
      typeBreakdown[inf.infringement_type] = (typeBreakdown[inf.infringement_type] || 0) + 1;
    });

    // Repeat offenders (plates with 3+ infringements)
    const plateCounts: Record<string, number> = {};
    allInfringements.forEach(inf => {
      if (inf.license_plate) {
        plateCounts[inf.license_plate] = (plateCounts[inf.license_plate] || 0) + 1;
      }
    });
    const repeatOffenders = Object.values(plateCounts).filter(c => c >= 3).length;

    // Compliance score (100 - weighted penalty)
    const totalWeight = severityCounts.minor * 1 + severityCounts.moderate * 3 + severityCounts.serious * 7 + severityCounts.major * 15;
    const maxPenalty = Math.max(vehicleCount || 1, 1) * 30; // normalize
    const complianceScore = Math.max(0, Math.min(100, 100 - (totalWeight / maxPenalty * 100)));

    // Average response time for responded incidents
    const respondedIncidents = allIncidents.filter(i => i.responded_at);
    let avgResponseTime = null;
    if (respondedIncidents.length > 0) {
      const totalMs = respondedIncidents.reduce((sum, i) => {
        return sum + (new Date(i.responded_at).getTime() - new Date(i.created_at).getTime());
      }, 0);
      avgResponseTime = (totalMs / respondedIncidents.length) / 60000; // minutes
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (severityCounts.major > 0) {
      recommendations.push(`${severityCounts.major} major infringement(s) require immediate disciplinary action and driver retraining.`);
    }
    if (severityCounts.serious > 2) {
      recommendations.push("Multiple serious violations detected. Recommend mandatory safety refresher courses for all drivers.");
    }
    if (repeatOffenders > 0) {
      recommendations.push(`${repeatOffenders} repeat offender(s) identified. Consider suspension pending investigation.`);
    }
    if (typeBreakdown["overloading"] > 0) {
      recommendations.push("Overloading violations detected. Enforce loading zone marshals and weight checks.");
    }
    if (complianceScore >= 90) {
      recommendations.push("Fleet compliance score is excellent. Maintain current monitoring standards.");
    } else if (complianceScore >= 70) {
      recommendations.push("Fleet compliance is acceptable but improvement areas exist. Review violation patterns.");
    } else {
      recommendations.push("Fleet compliance is below acceptable levels. Urgent intervention required.");
    }

    const summary = `DOT Compliance Report for ${periodStart} to ${periodEnd}. ` +
      `Monitored ${vehicleCount || 0} vehicles and ${driverCount || 0} drivers. ` +
      `Recorded ${allInfringements.length} infringement(s) and ${allIncidents.length} incident(s). ` +
      `Fleet compliance score: ${complianceScore.toFixed(1)}%.`;

    // Save the report
    const { data: report, error: reportError } = await supabase
      .from("dot_compliance_reports")
      .insert({
        report_type: reportType || "monthly",
        report_period_start: periodStart,
        report_period_end: periodEnd,
        generated_by: userId,
        total_infringements: allInfringements.length,
        total_incidents: allIncidents.length,
        total_vehicles_monitored: vehicleCount || 0,
        total_drivers_monitored: driverCount || 0,
        minor_count: severityCounts.minor,
        moderate_count: severityCounts.moderate,
        serious_count: severityCounts.serious,
        major_count: severityCounts.major,
        infringement_breakdown: typeBreakdown,
        compliance_score: complianceScore,
        repeat_offender_count: repeatOffenders,
        average_response_time_minutes: avgResponseTime,
        summary,
        recommendations,
        report_data: {
          infringements: allInfringements,
          incidents: allIncidents,
          plateCounts,
          typeBreakdown,
          severityCounts
        },
        status: "final"
      })
      .select()
      .single();

    if (reportError) {
      console.error("Error saving report:", reportError);
      return new Response(
        JSON.stringify({ error: "Failed to save report" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("DOT compliance report generated:", report.id);

    return new Response(
      JSON.stringify({ success: true, report }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating DOT report:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
