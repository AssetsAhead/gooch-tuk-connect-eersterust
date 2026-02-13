import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IncidentAnalysis {
  incident_detected: boolean;
  incident_type: string | null;
  severity: "low" | "medium" | "high" | "critical";
  confidence_score: number;
  description: string;
  details: {
    objects_detected: string[];
    license_plates: string[];
    traffic_violations: string[];
    safety_concerns: string[];
    recommended_actions: string[];
    infringements: InfringementDetail[];
  };
}

interface InfringementDetail {
  type: string; // speeding, red_light, illegal_parking, overloading, unroadworthy, no_license, reckless_driving
  severity: "minor" | "moderate" | "serious" | "major";
  description: string;
  demerit_points: number;
  estimated_fine: number;
  license_plate?: string;
}

// AARTO demerit points mapping for SA traffic violations
const AARTO_DEMERITS: Record<string, { points: number; fine: number; severity: string }> = {
  speeding: { points: 1, fine: 500, severity: "minor" },
  red_light: { points: 4, fine: 2000, severity: "serious" },
  illegal_parking: { points: 1, fine: 300, severity: "minor" },
  overloading: { points: 3, fine: 1500, severity: "moderate" },
  unroadworthy: { points: 3, fine: 2500, severity: "serious" },
  no_license: { points: 6, fine: 5000, severity: "major" },
  reckless_driving: { points: 6, fine: 5000, severity: "major" },
  no_seatbelt: { points: 1, fine: 500, severity: "minor" },
  cellphone_use: { points: 1, fine: 750, severity: "minor" },
  illegal_overtaking: { points: 4, fine: 2000, severity: "serious" },
  stop_sign: { points: 2, fine: 1000, severity: "moderate" },
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
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    const { imageUrl, captureId, location } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Image URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing image for incidents and infringements:", imageUrl.substring(0, 100));

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an AI security and traffic enforcement system for a township transport safety network in South Africa. 
Analyze images from cameras and dashcams to detect:
- Vehicle accidents or collisions
- Traffic violations (speeding signs, illegal parking, red light violations, overloading)
- Unroadworthy vehicles (bald tyres, broken lights, missing mirrors)
- Suspicious activities (break-ins, theft, vandalism)
- Safety hazards (road obstructions, fires, floods)
- License plates (for vehicle tracking and infringement linking)
- Crowd disturbances or fights
- Seatbelt/cellphone violations
- Illegal overtaking or stop sign violations

You MUST respond with valid JSON only, no markdown or explanation. Use this exact structure:
{
  "incident_detected": boolean,
  "incident_type": string or null,
  "severity": "low" | "medium" | "high" | "critical",
  "confidence_score": number between 0 and 1,
  "description": "Brief description of what you see",
  "details": {
    "objects_detected": ["list of objects/vehicles/people detected"],
    "license_plates": ["any visible license plates"],
    "traffic_violations": ["any traffic violations observed"],
    "safety_concerns": ["any safety concerns"],
    "recommended_actions": ["suggested responses"],
    "infringements": [
      {
        "type": "speeding|red_light|illegal_parking|overloading|unroadworthy|no_license|reckless_driving|no_seatbelt|cellphone_use|illegal_overtaking|stop_sign",
        "severity": "minor|moderate|serious|major",
        "description": "specific description of the violation",
        "demerit_points": number (AARTO points),
        "estimated_fine": number (in Rands),
        "license_plate": "plate if visible, null otherwise"
      }
    ]
  }
}

For the infringements array, include every distinct violation you can identify. If no infringements are detected, return an empty array.
Use South African AARTO (Administrative Adjudication of Road Traffic Offences) demerit point values.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image for security incidents, traffic violations, infringements, and safety concerns. Detect all visible license plates. Respond with JSON only."
              },
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 1500
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      console.error("No AI response content");
      return new Response(
        JSON.stringify({ error: "No analysis result from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI raw response:", aiContent);

    let analysis: IncidentAnalysis;
    try {
      let jsonStr = aiContent.trim();
      if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
      else if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);
      analysis = JSON.parse(jsonStr.trim());
      // Ensure infringements array exists
      if (!analysis.details.infringements) {
        analysis.details.infringements = [];
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      analysis = {
        incident_detected: false,
        incident_type: null,
        severity: "low",
        confidence_score: 0,
        description: "Unable to analyze image",
        details: {
          objects_detected: [],
          license_plates: [],
          traffic_violations: [],
          safety_concerns: [],
          recommended_actions: [],
          infringements: []
        }
      };
    }

    // Use service role for DB writes
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update camera_captures if captureId provided
    if (captureId) {
      const { error: updateError } = await supabase
        .from("camera_captures")
        .update({
          ai_analysis: analysis,
          incident_detected: analysis.incident_detected,
          incident_type: analysis.incident_type,
          confidence_score: analysis.confidence_score,
          license_plates: analysis.details.license_plates,
          traffic_violations: analysis.details.traffic_violations
        })
        .eq("id", captureId);

      if (updateError) console.error("Error updating capture:", updateError);

      // Create ai_incidents record for high-confidence incidents
      if (analysis.incident_detected && analysis.confidence_score >= 0.7) {
        const { error: incidentError } = await supabase
          .from("ai_incidents")
          .insert({
            capture_id: captureId,
            incident_type: analysis.incident_type || "unknown",
            severity: analysis.severity,
            description: analysis.description,
            auto_detected: true,
            location: location || null,
            response_required: analysis.severity === "high" || analysis.severity === "critical",
            metadata: {
              confidence_score: analysis.confidence_score,
              objects_detected: analysis.details.objects_detected,
              recommended_actions: analysis.details.recommended_actions,
              infringement_count: analysis.details.infringements.length
            }
          });

        if (incidentError) console.error("Error creating incident:", incidentError);
        else console.log("AI incident created for capture:", captureId);
      }
    }

    // Process infringements - create road_infringements records
    const infringementResults = [];
    for (const infringement of analysis.details.infringements) {
      // Look up AARTO data or use AI-provided values
      const aartoData = AARTO_DEMERITS[infringement.type] || {
        points: infringement.demerit_points || 1,
        fine: infringement.estimated_fine || 500,
        severity: infringement.severity || "minor"
      };

      // Try to match license plate to a driver
      let driverId = null;
      let vehicleId = null;
      const plate = infringement.license_plate || (analysis.details.license_plates.length > 0 ? analysis.details.license_plates[0] : null);
      
      if (plate) {
        // Check vehicles table for plate match
        const { data: vehicleMatch } = await supabase
          .from("vehicles")
          .select("id")
          .ilike("registration_number", plate)
          .maybeSingle();
        
        if (vehicleMatch) {
          vehicleId = vehicleMatch.id;
        }

        // Also check fleet_vehicles
        const { data: fleetMatch } = await supabase
          .from("fleet_vehicles")
          .select("id, driver_name")
          .ilike("registration", plate)
          .maybeSingle();

        if (fleetMatch) {
          console.log("Matched infringement to fleet vehicle:", plate);
        }
      }

      // Reputation impact scales with severity
      const reputationImpact = {
        minor: 2,
        moderate: 5,
        serious: 10,
        major: 20
      }[aartoData.severity] || 2;

      const { data: infringementRecord, error: infringementError } = await supabase
        .from("road_infringements")
        .insert({
          driver_id: driverId,
          vehicle_id: vehicleId,
          capture_id: captureId || null,
          infringement_type: infringement.type,
          severity: aartoData.severity,
          description: infringement.description,
          location: location || null,
          evidence_urls: imageUrl ? [imageUrl] : [],
          license_plate: plate,
          detected_by: "ai",
          confidence_score: analysis.confidence_score,
          status: analysis.confidence_score >= 0.85 ? "confirmed" : "pending",
          demerit_points: aartoData.points,
          reputation_impact: reputationImpact,
          fine_amount: aartoData.fine,
          occurred_at: new Date().toISOString()
        })
        .select("id")
        .single();

      if (infringementError) {
        console.error("Error creating infringement:", infringementError);
      } else {
        infringementResults.push({
          id: infringementRecord.id,
          type: infringement.type,
          severity: aartoData.severity,
          demerit_points: aartoData.points,
          fine: aartoData.fine
        });
        console.log("Infringement recorded:", infringement.type, plate);
      }
    }

    console.log("Analysis complete:", {
      incident_detected: analysis.incident_detected,
      type: analysis.incident_type,
      severity: analysis.severity,
      confidence: analysis.confidence_score,
      infringements_recorded: infringementResults.length
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        infringements: infringementResults
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-incident:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
