import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchRequest {
  pickupLocation: string;
  destination: string;
  userLocation?: { latitude: number; longitude: number };
  preferences?: {
    prioritizeRating?: boolean;
    prioritizeETA?: boolean;
    maxWaitTime?: number;
  };
}

interface DriverScore {
  driver: any;
  score: number;
  reasons: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
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

    const passengerId = claimsData.claims.sub;
    console.log("Authenticated passenger for smart match:", passengerId);

    const { pickupLocation, destination, userLocation, preferences } = 
      await req.json() as MatchRequest;

    console.log("Smart matching request:", { passengerId, pickupLocation, destination });

    // Use service role for querying drivers
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch available drivers
    const { data: drivers, error: driversError } = await supabase
      .from("drivers")
      .select(`
        *,
        driver_reputation (
          rating,
          total_rides,
          compliance_score,
          champion_acts,
          infringements
        )
      `)
      .eq("status", "online");

    if (driversError) {
      console.error("Error fetching drivers:", driversError);
      throw driversError;
    }

    if (!drivers || drivers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No drivers available",
          recommendation: "Try again in a few minutes"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Score each driver
    const scoredDrivers: DriverScore[] = drivers.map((driver) => {
      let score = 0;
      const reasons: string[] = [];
      const reputation = driver.driver_reputation?.[0];

      // Rating score (0-30 points)
      const rating = reputation?.rating || driver.rating || 4.0;
      const ratingScore = (rating / 5) * 30;
      score += ratingScore;
      if (rating >= 4.5) reasons.push("Highly rated driver");

      // Experience score (0-20 points)
      const totalRides = reputation?.total_rides || 0;
      const experienceScore = Math.min(totalRides / 100, 1) * 20;
      score += experienceScore;
      if (totalRides > 200) reasons.push("Experienced driver");

      // Compliance score (0-20 points)
      const compliance = reputation?.compliance_score || 80;
      const complianceScore = (compliance / 100) * 20;
      score += complianceScore;
      if (compliance >= 95) reasons.push("Excellent compliance record");

      // Champion acts bonus (0-15 points)
      const championActs = reputation?.champion_acts || 0;
      const championScore = Math.min(championActs / 10, 1) * 15;
      score += championScore;
      if (championActs >= 5) reasons.push("Community champion");

      // Infringement penalty (-10 points max)
      const infringements = reputation?.infringements || 0;
      const infringementPenalty = Math.min(infringements * 2, 10);
      score -= infringementPenalty;
      if (infringements > 0) reasons.push(`${infringements} infringement(s) on record`);

      // ETA bonus (0-15 points) - simulate for now
      const estimatedETA = Math.floor(Math.random() * 10 + 2);
      const etaScore = Math.max(15 - estimatedETA, 0);
      score += etaScore;
      if (estimatedETA <= 3) reasons.push("Very close by");

      // Location familiarity bonus (simulated)
      if (driver.location?.toLowerCase().includes("poortjie") || 
          pickupLocation?.toLowerCase().includes("poortjie")) {
        score += 5;
        reasons.push("Familiar with area");
      }

      return {
        driver: {
          ...driver,
          estimated_eta: estimatedETA,
          rating: rating,
          total_rides: totalRides,
        },
        score: Math.round(score * 10) / 10,
        reasons,
      };
    });

    // Sort by score (highest first)
    scoredDrivers.sort((a, b) => b.score - a.score);

    // Apply preferences
    if (preferences?.prioritizeRating) {
      scoredDrivers.sort((a, b) => 
        (b.driver.rating || 0) - (a.driver.rating || 0)
      );
    }
    if (preferences?.prioritizeETA) {
      scoredDrivers.sort((a, b) => 
        (a.driver.estimated_eta || 99) - (b.driver.estimated_eta || 99)
      );
    }

    const bestMatch = scoredDrivers[0];
    const alternatives = scoredDrivers.slice(1, 4);

    // Use AI to generate a personalized recommendation
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let aiRecommendation = "";

    if (LOVABLE_API_KEY && bestMatch) {
      try {
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
                content: "You are a friendly township taxi assistant. Give a very brief (1-2 sentences) recommendation for why this driver is a good match. Be warm and reassuring. Use South African township-friendly language."
              },
              {
                role: "user",
                content: `Recommend driver ${bestMatch.driver.name} with rating ${bestMatch.driver.rating}, ${bestMatch.driver.total_rides} rides, ETA ${bestMatch.driver.estimated_eta} min. Match reasons: ${bestMatch.reasons.join(", ")}`
              }
            ],
            max_tokens: 100
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiRecommendation = aiData.choices?.[0]?.message?.content || "";
        }
      } catch (aiError) {
        console.warn("AI recommendation failed:", aiError);
      }
    }

    console.log("Best match:", bestMatch.driver.name, "Score:", bestMatch.score);

    return new Response(
      JSON.stringify({
        success: true,
        bestMatch: {
          driver: bestMatch.driver,
          score: bestMatch.score,
          matchReasons: bestMatch.reasons,
          aiRecommendation,
        },
        alternatives: alternatives.map((a) => ({
          driver: a.driver,
          score: a.score,
          matchReasons: a.reasons,
        })),
        totalAvailable: drivers.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Smart match error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
