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

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// ---- Alerting (best effort, never blocks the user flow) ----
const alertOwner = async (subject: string, lines: string[]) => {
  const text = `${subject}\n\n${lines.join("\n")}`;

  const waTo = Deno.env.get("INVESTOR_ALERT_WHATSAPP");
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  const smsFrom = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (waTo && sid && token) {
    const sendTwilio = async (from: string, to: string) => {
      const form = new URLSearchParams();
      form.append("From", from);
      form.append("To", to);
      form.append("Body", text.slice(0, 1400));
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: form,
        },
      );
      if (!res.ok) console.error("twilio alert failed", from, res.status, await res.text());
      return res.ok;
    };

    const plain = waTo.replace(/^whatsapp:/, "");
    try {
      const waOk = await sendTwilio("whatsapp:+14155238886", `whatsapp:${plain}`);
      // WhatsApp needs a joined sandbox/approved sender; fall back to SMS so the alert always lands.
      if (!waOk && smsFrom) await sendTwilio(smsFrom, plain);
    } catch (e) {
      console.error("whatsapp alert error", e instanceof Error ? e.message : e);
    }
  }


  const mailTo = Deno.env.get("INVESTOR_ALERT_EMAIL");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (mailTo && resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Investor Room <onboarding@resend.dev>",
          to: [mailTo],
          subject,
          text,
        }),
      });
      if (!res.ok) console.error("email alert failed", res.status, await res.text());
    } catch (e) {
      console.error("email alert error", e instanceof Error ? e.message : e);
    }
  }
};

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

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("cf-connecting-ip") ??
      null;
    const userAgent = clean(req.headers.get("user-agent"), 400) || null;

    // ---------- Request access (no code required) ----------
    if (action === "request") {
      const fullName = clean(body.fullName, 120);
      const email = clean(body.email, 255).toLowerCase();
      const company = clean(body.company, 160);
      const phone = clean(body.phone, 40);
      const message = clean(body.message, 800);

      if (fullName.length < 2) return json({ error: "Please enter your full name" }, 400);
      if (!isEmail(email)) return json({ error: "Please enter a valid email address" }, 400);

      // light throttle: max 3 pending requests per email
      const { count } = await supabase
        .from("investor_access_requests")
        .select("id", { count: "exact", head: true })
        .eq("email", email)
        .eq("status", "pending");

      if ((count ?? 0) >= 3) {
        return json({ requested: true, throttled: true });
      }

      const { error: reqError } = await supabase
        .from("investor_access_requests")
        .insert({
          full_name: fullName,
          company: company || null,
          email,
          phone: phone || null,
          message: message || null,
          ip_address: ip,
          user_agent: userAgent,
        });

      if (reqError) {
        console.error("request insert failed", reqError.message);
        return json({ error: "Could not send your request right now" }, 500);
      }

      await alertOwner("New investor access request", [
        `Name: ${fullName}`,
        `Company: ${company || "-"}`,
        `Email: ${email}`,
        `Phone: ${phone || "-"}`,
        message ? `Message: ${message}` : "",
        "",
        "Approve and issue a code in the app: /investor-access",
      ].filter(Boolean));

      return json({ requested: true });
    }

    // ---------- Verify / accept a code ----------
    const code = clean(body.code, 64).toUpperCase();
    if (!code) return json({ error: "Access code is required" }, 400);

    const { data: codeRow, error: codeError } = await supabase
      .from("investor_access_codes")
      .select(
        "id, code, is_active, expires_at, investor_email, investor_name, max_uses, used_count",
      )
      .eq("code", code)
      .maybeSingle();

    if (codeError) {
      console.error("code lookup failed", codeError.message);
      return json({ error: "Could not check that code right now" }, 500);
    }

    const notExpired =
      !codeRow?.expires_at || new Date(codeRow.expires_at) > new Date();
    const usesLeft =
      !codeRow || (codeRow.max_uses ?? 1) > (codeRow.used_count ?? 0);

    const valid = !!codeRow && codeRow.is_active === true && notExpired && usesLeft;

    if (!valid) {
      if (codeRow && !usesLeft) {
        await alertOwner("Investor code reuse blocked", [
          `Code: ${code}`,
          `Issued to: ${codeRow.investor_name ?? "-"} (${codeRow.investor_email ?? "-"})`,
          "Someone tried to use it after its allowed uses were spent.",
        ]);
        return json(
          { valid: false, error: "This code has already been used. Please request access again." },
          403,
        );
      }
      return json({ valid: false, error: "That access code is not valid" }, 403);
    }

    if (action === "verify") return json({ valid: true });

    if (action === "accept") {
      const fullName = clean(body.fullName, 120);
      const email = clean(body.email, 255).toLowerCase();
      const company = clean(body.company, 160);

      if (fullName.length < 2) return json({ error: "Please enter your full name" }, 400);
      if (!isEmail(email)) return json({ error: "Please enter a valid email address" }, 400);

      // Personal codes are bound to the invited email address
      if (codeRow.investor_email && codeRow.investor_email.toLowerCase() !== email) {
        await alertOwner("Investor code used with the wrong email", [
          `Code: ${code}`,
          `Issued to: ${codeRow.investor_email}`,
          `Attempted by: ${fullName} <${email}>`,
        ]);
        return json(
          {
            valid: false,
            error: "This code was issued to a different email address.",
          },
          403,
        );
      }

      const { error: insertError } = await supabase
        .from("investor_nda_acceptances")
        .insert({
          full_name: fullName,
          company: company || null,
          email,
          access_code: code,
          ip_address: ip,
          user_agent: userAgent,
        });

      if (insertError) {
        console.error("acceptance insert failed", insertError.message);
        return json({ error: "Could not record your acceptance" }, 500);
      }

      const nextCount = (codeRow.used_count ?? 0) + 1;
      await supabase
        .from("investor_access_codes")
        .update({
          used_count: nextCount,
          last_used_at: new Date().toISOString(),
          is_active: nextCount >= (codeRow.max_uses ?? 1) ? false : true,
        })
        .eq("id", codeRow.id);

      await alertOwner("Investor entered the room", [
        `Name: ${fullName}`,
        `Company: ${company || "-"}`,
        `Email: ${email}`,
        `Code: ${code} (use ${nextCount} of ${codeRow.max_uses ?? 1})`,
      ]);

      return json({ valid: true, accepted: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("investor-access error", err instanceof Error ? err.message : err);
    return json({ error: "Unexpected error" }, 500);
  }
});
