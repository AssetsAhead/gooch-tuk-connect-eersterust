import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  requestId: string;
  userEmail: string;
  userId: string;
  requestedRole: string;
  status: 'pending' | 'approved' | 'rejected';
  verificationNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { requestId, userEmail, userId, requestedRole, status, verificationNotes }: NotificationRequest = await req.json();

    console.log("Sending role request notifications:", { requestId, userEmail, userId, requestedRole, status });

    // Fetch user phone number for SMS
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: profile } = await supabaseServiceClient
      .from("profiles")
      .select("phone_number")
      .eq("user_id", userId)
      .single();

    const phoneNumber = profile?.phone_number;

    let subject = "";
    let html = "";
    let smsMessage = "";

    if (status === 'pending') {
      // New request notification
      subject = `New Role Request: ${requestedRole}`;
      html = `
        <h2>New Role Request Submitted</h2>
        <p>A user has requested the <strong>${requestedRole}</strong> role.</p>
        <p><strong>Request ID:</strong> ${requestId}</p>
        <p>Please review this request in the admin dashboard.</p>
      `;
      smsMessage = `TaxiConnect: Your ${requestedRole} role request has been submitted and is under review. Request ID: ${requestId.substring(0, 8)}`;
    } else if (status === 'approved') {
      // Approval notification to user
      subject = `Your ${requestedRole} Role Request Has Been Approved`;
      html = `
        <h2>Role Request Approved</h2>
        <p>Congratulations! Your request for the <strong>${requestedRole}</strong> role has been approved.</p>
        ${verificationNotes ? `<p><strong>Admin Notes:</strong> ${verificationNotes}</p>` : ''}
        <p>You can now access ${requestedRole} features in the application.</p>
      `;
      smsMessage = `TaxiConnect: Great news! Your ${requestedRole} role request has been APPROVED. You can now access ${requestedRole} features.`;
    } else if (status === 'rejected') {
      // Rejection notification to user
      subject = `Your ${requestedRole} Role Request Status`;
      html = `
        <h2>Role Request Update</h2>
        <p>Your request for the <strong>${requestedRole}</strong> role has been reviewed.</p>
        ${verificationNotes ? `<p><strong>Admin Feedback:</strong> ${verificationNotes}</p>` : ''}
        <p>If you have questions, please contact support.</p>
      `;
      smsMessage = `TaxiConnect: Your ${requestedRole} role request has been reviewed. ${verificationNotes ? 'Check your email for details.' : 'Please contact support for more information.'}`;
    }

    // Send email notification
    const emailPromise = resend.emails.send({
      from: "TaxiConnect <onboarding@resend.dev>",
      to: [userEmail],
      subject: subject,
      html: html,
    });

    // Send SMS notification if phone number is available
    const smsPromise = phoneNumber
      ? fetch(`${supabaseUrl}/functions/v1/send-sms-message`, {
          method: "POST",
          headers: {
            "Authorization": req.headers.get("Authorization") || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: phoneNumber,
            message: smsMessage,
            type: "role_request_notification",
          }),
        })
      : Promise.resolve(null);

    // Wait for both email and SMS to complete
    const [emailResult, smsResult] = await Promise.allSettled([emailPromise, smsPromise]);

    // Check email result
    if (emailResult.status === "rejected") {
      console.error("Email error:", emailResult.reason);
      throw new Error("Failed to send email notification");
    }

    if (emailResult.value.error) {
      console.error("Resend error:", emailResult.value.error);
      throw new Error("Failed to send email notification");
    }

    console.log("Email sent successfully:", emailResult.value.data);

    // Check SMS result (non-critical)
    if (phoneNumber) {
      if (smsResult.status === "rejected") {
        console.warn("SMS notification failed:", smsResult.reason);
      } else if (smsResult.value) {
        const smsResponse = await smsResult.value.json();
        if (smsResponse.error) {
          console.warn("SMS notification failed:", smsResponse.error);
        } else {
          console.log("SMS sent successfully");
        }
      }
    } else {
      console.log("No phone number available, SMS notification skipped");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email: emailResult.value.data,
        sms: phoneNumber ? "sent" : "skipped" 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-role-request-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
