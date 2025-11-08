import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  requestId: string;
  userEmail: string;
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

    const { requestId, userEmail, requestedRole, status, verificationNotes }: EmailRequest = await req.json();

    console.log("Sending role request email:", { requestId, userEmail, requestedRole, status });

    let subject = "";
    let html = "";

    if (status === 'pending') {
      // New request notification
      subject = `New Role Request: ${requestedRole}`;
      html = `
        <h2>New Role Request Submitted</h2>
        <p>A user has requested the <strong>${requestedRole}</strong> role.</p>
        <p><strong>Request ID:</strong> ${requestId}</p>
        <p>Please review this request in the admin dashboard.</p>
      `;
    } else if (status === 'approved') {
      // Approval notification to user
      subject = `Your ${requestedRole} Role Request Has Been Approved`;
      html = `
        <h2>Role Request Approved</h2>
        <p>Congratulations! Your request for the <strong>${requestedRole}</strong> role has been approved.</p>
        ${verificationNotes ? `<p><strong>Admin Notes:</strong> ${verificationNotes}</p>` : ''}
        <p>You can now access ${requestedRole} features in the application.</p>
      `;
    } else if (status === 'rejected') {
      // Rejection notification to user
      subject = `Your ${requestedRole} Role Request Status`;
      html = `
        <h2>Role Request Update</h2>
        <p>Your request for the <strong>${requestedRole}</strong> role has been reviewed.</p>
        ${verificationNotes ? `<p><strong>Admin Feedback:</strong> ${verificationNotes}</p>` : ''}
        <p>If you have questions, please contact support.</p>
      `;
    }

    const { data, error } = await resend.emails.send({
      from: "TaxiConnect <onboarding@resend.dev>",
      to: [userEmail],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
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
