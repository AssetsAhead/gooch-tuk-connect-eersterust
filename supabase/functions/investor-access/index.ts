import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const body = await req.json().catch(() => ({}));
    const action = clean(body.action, 20);
    const code = clean(body.code, 64).toUpperCase();

    if (!code) return json({ error: "Access code is required" }, 400);

    const { data: codeRow, error: codeError } = await supabase
      .from("investor_access_codes")
      .select("id, code, is_active, expires_at")
      .eq("code", code)
      .maybeSingle();

    if (codeError) {
      console.error("code lookup failed", codeError.message);
      return json({ error: "Could not check that code right now" }, 500);
    }

    const valid =
      !!codeRow &&
      codeRow.is_active === true &&
      (!codeRow.expires_at || new Date(codeRow.expires_at) > new Date());

    if (!valid) return json({ valid: false, error: "That access code is not valid" }, 403);

    if (action === "verify") return json({ valid: true });

    if (action === "accept") {
      const fullName = clean(body.fullName, 120);
      const email = clean(body.email, 255).toLowerCase();
      const company = clean(body.company, 160);

      if (fullName.length < 2) return json({ error: "Please enter your full name" }, 400);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: "Please enter a valid email address" }, 400);
      }

      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("cf-connecting-ip") ??
        null;

      const { error: insertError } = await supabase
        .from("investor_nda_acceptances")
        .insert({
          full_name: fullName,
          company: company || null,
          email,
          access_code: code,
          ip_address: ip,
          user_agent: clean(req.headers.get("user-agent"), 400) || null,
        });

      if (insertError) {
        console.error("acceptance insert failed", insertError.message);
        return json({ error: "Could not record your acceptance" }, 500);
      }

      return json({ valid: true, accepted: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("investor-access error", err instanceof Error ? err.message : err);
    return json({ error: "Unexpected error" }, 500);
  }
});
