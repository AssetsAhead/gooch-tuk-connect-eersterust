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
  };
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

    console.log("Analyzing image for incidents:", imageUrl.substring(0, 100));

    // Call Lovable AI with vision capabilities
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
            content: `You are an AI security incident detection system for a township transport safety network in South Africa. 
Analyze images from cameras and dashcams to detect:
- Vehicle accidents or collisions
- Traffic violations (speeding signs, illegal parking, red light violations)
- Suspicious activities (break-ins, theft, vandalism)
- Safety hazards (road obstructions, fires, floods)
- License plates (for vehicle tracking)
- Crowd disturbances or fights

You MUST respond with valid JSON only, no markdown or explanation. Use this exact structure:
{
  "incident_detected": boolean,
  "incident_type": string or null (e.g., "accident", "traffic_violation", "suspicious_activity", "safety_hazard", "crowd_disturbance", null),
  "severity": "low" | "medium" | "high" | "critical",
  "confidence_score": number between 0 and 1,
  "description": "Brief description of what you see",
  "details": {
    "objects_detected": ["list of objects/vehicles/people detected"],
    "license_plates": ["any visible license plates"],
    "traffic_violations": ["any traffic violations observed"],
    "safety_concerns": ["any safety concerns"],
    "recommended_actions": ["suggested responses"]
  }
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image for security incidents, traffic violations, or safety concerns. Respond with JSON only."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000
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

    // Parse AI response (handle potential markdown wrapping)
    let analysis: IncidentAnalysis;
    try {
      let jsonStr = aiContent.trim();
      // Remove markdown code blocks if present
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith("```")) {
        jsonStr = jsonStr.slice(0, -3);
      }
      analysis = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return a safe default if parsing fails
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
          recommended_actions: []
        }
      };
    }

    // If capture ID provided, update the database using service role
    if (captureId) {
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Update camera_captures with analysis
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

      if (updateError) {
        console.error("Error updating capture:", updateError);
      }

      // If incident detected with high confidence, create ai_incidents record
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
              recommended_actions: analysis.details.recommended_actions
            }
          });

        if (incidentError) {
          console.error("Error creating incident:", incidentError);
        } else {
          console.log("AI incident created for capture:", captureId);
        }
      }
    }

    console.log("Analysis complete:", {
      incident_detected: analysis.incident_detected,
      type: analysis.incident_type,
      severity: analysis.severity,
      confidence: analysis.confidence_score
    });

    return new Response(
      JSON.stringify({ success: true, analysis }),
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
