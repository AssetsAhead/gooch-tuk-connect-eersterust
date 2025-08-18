import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[YOCO-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const yocoSecretKey = Deno.env.get("YOCO_SECRET_KEY");
    if (!yocoSecretKey) throw new Error("YOCO_SECRET_KEY is not set");
    logStep("Yoco key verified");

    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { amount, rideId, description } = await req.json();
    if (!amount || amount <= 0) throw new Error("Invalid amount");
    logStep("Payment request validated", { amount, rideId });

    // Create Yoco checkout session
    const yocoResponse = await fetch("https://online.yoco.com/v1/charges/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${yocoSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "ZAR",
        metadata: {
          user_id: user.id,
          ride_id: rideId,
          user_email: user.email,
        },
        receipt_email: user.email,
        description: description || "TukTuk Ride Payment",
        // Use secure base URL instead of trusting origin header
        success_url: "https://iiompkhsodkztxllbvkm.supabase.co/payment-success",
        cancel_url: "https://iiompkhsodkztxllbvkm.supabase.co/payment-cancelled",
      }),
    });

    if (!yocoResponse.ok) {
      const errorText = await yocoResponse.text();
      logStep("Yoco API error", { status: yocoResponse.status, error: errorText });
      throw new Error(`Yoco API error: ${errorText}`);
    }

    const yocoData = await yocoResponse.json();
    logStep("Yoco checkout session created", { chargeId: yocoData.id });

    // Optional: Record pending transaction in database
    if (rideId) {
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      const { error: insertError } = await supabaseService.from("transactions").insert({
        ride_id: rideId,
        amount: amount,
        driver_share: amount * 0.7, // 70% to driver
        owner_share: amount * 0.2,  // 20% to owner
        platform_fee: amount * 0.1, // 10% platform fee
        payment_method: "yoco_card",
        status: "pending",
      });

      if (insertError) {
        logStep("Failed to record transaction", insertError);
      } else {
        logStep("Transaction recorded successfully");
      }
    }

    return new Response(JSON.stringify({ 
      redirect_url: yocoData.redirect_url,
      charge_id: yocoData.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-yoco-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});