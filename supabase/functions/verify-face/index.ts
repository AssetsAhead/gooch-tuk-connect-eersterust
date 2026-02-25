import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { selfie_base64, clocking_type, latitude, longitude } = await req.json();

    if (!selfie_base64 || !clocking_type) {
      return new Response(
        JSON.stringify({ error: "selfie_base64 and clocking_type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate clocking_type
    const validTypes = ["shift_start", "shift_end", "trip_start", "trip_end"];
    if (!validTypes.includes(clocking_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid clocking_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate coordinates if provided
    if (latitude !== undefined && (latitude < -35 || latitude > -22)) {
      return new Response(
        JSON.stringify({ error: "Invalid latitude for South Africa" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (longitude !== undefined && (longitude < 16 || longitude > 33)) {
      return new Response(
        JSON.stringify({ error: "Invalid longitude for South Africa" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get driver's registered face photo
    const { data: registration } = await supabase
      .from("driver_face_registrations")
      .select("photo_path")
      .eq("driver_id", user.id)
      .eq("is_active", true)
      .order("registered_at", { ascending: false })
      .limit(1)
      .single();

    if (!registration) {
      return new Response(
        JSON.stringify({ error: "No face registered. Please register your face first.", needs_registration: true }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get signed URL for the registered photo
    const { data: signedUrlData } = await supabase.storage
      .from("face-photos")
      .createSignedUrl(registration.photo_path, 300);

    if (!signedUrlData?.signedUrl) {
      return new Response(
        JSON.stringify({ error: "Could not retrieve registered face photo" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the registered photo as base64
    const registeredPhotoRes = await fetch(signedUrlData.signedUrl);
    const registeredPhotoBlob = await registeredPhotoRes.arrayBuffer();
    const registeredBase64 = btoa(
      new Uint8Array(registeredPhotoBlob).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    // Use Lovable AI (Gemini) for face comparison
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
            content: `You are a facial verification system for a driver clocking app. Compare two face photos and determine if they are the same person. Respond ONLY with valid JSON in this exact format:
{"match": true/false, "confidence": 0.0-1.0, "reason": "brief explanation", "fraud_indicators": ["list of concerns if any"]}

Be strict about matching. Flag if: different person, photo of a photo, face obscured, sunglasses/mask hiding identity. A confidence above 0.75 means verified match.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Compare these two face photos. Image 1 is the registered reference. Image 2 is the current selfie taken for clocking. Are they the same person?" },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${registeredBase64}` } },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${selfie_base64}` } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "face_verification_result",
              description: "Return the face verification result",
              parameters: {
                type: "object",
                properties: {
                  match: { type: "boolean", description: "Whether the faces match" },
                  confidence: { type: "number", description: "Confidence score 0-1" },
                  reason: { type: "string", description: "Brief explanation" },
                  fraud_indicators: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of fraud concerns if any",
                  },
                },
                required: ["match", "confidence", "reason", "fraud_indicators"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "face_verification_result" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit exceeded, try again shortly" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI error:", status, await aiResponse.text());
      return new Response(JSON.stringify({ error: "AI verification failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    let verificationResult;

    // Extract from tool call response
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      verificationResult = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try to parse from content
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        verificationResult = JSON.parse(jsonMatch[0]);
      } else {
        verificationResult = { match: false, confidence: 0, reason: "Could not parse AI response", fraud_indicators: ["verification_error"] };
      }
    }

    const isVerified = verificationResult.match && verificationResult.confidence >= 0.75;
    const isFlagged = !verificationResult.match || verificationResult.fraud_indicators.length > 0;

    // Upload selfie as evidence
    const selfieBuffer = Uint8Array.from(atob(selfie_base64), (c) => c.charCodeAt(0));
    const selfieFileName = `${user.id}/clockings/${Date.now()}.jpg`;
    await supabase.storage.from("face-photos").upload(selfieFileName, selfieBuffer, {
      contentType: "image/jpeg",
    });

    // Record clocking
    const { data: clocking, error: clockingError } = await supabase
      .from("driver_clockings")
      .insert({
        driver_id: user.id,
        clocking_type,
        photo_path: selfieFileName,
        verification_result: verificationResult,
        confidence_score: verificationResult.confidence,
        is_verified: isVerified,
        is_flagged: isFlagged,
        flag_reason: isFlagged ? verificationResult.reason : null,
        latitude: latitude || null,
        longitude: longitude || null,
      })
      .select()
      .single();

    if (clockingError) {
      console.error("Clocking insert error:", clockingError);
      return new Response(JSON.stringify({ error: "Failed to record clocking" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If flagged, create notification for admins
    if (isFlagged) {
      console.log(`FRAUD ALERT: Driver ${user.id} flagged - ${verificationResult.reason}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        clocking,
        verification: {
          is_verified: isVerified,
          confidence: verificationResult.confidence,
          reason: verificationResult.reason,
          is_flagged: isFlagged,
          fraud_indicators: verificationResult.fraud_indicators,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("verify-face error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
