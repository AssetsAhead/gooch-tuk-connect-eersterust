import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OTPRequest {
  phone: string;
  action: 'send' | 'verify';
  code?: string;
}

// Format phone number to E.164 format for South Africa
function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '27' + cleaned.substring(1);
  }
  if (!cleaned.startsWith('27')) {
    cleaned = '27' + cleaned;
  }
  return '+' + cleaned;
}

// Validate phone number
function validatePhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  return /^\+27[0-9]{9}$/.test(formatted);
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, action, code }: OTPRequest = await req.json();
    console.log(`SMS OTP request: action=${action}, phone=${phone?.substring(0, 5)}***`);

    if (!phone) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!validatePhoneNumber(phone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format. Use South African format.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formattedPhone = formatPhoneNumber(phone);
    
    // Create Supabase client with service role for auth admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'send') {
      // Use Supabase's native phone OTP
      console.log('Sending OTP via Supabase native phone auth to:', formattedPhone);
      
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (otpError) {
        console.error('Supabase OTP send error:', otpError);
        return new Response(
          JSON.stringify({ error: otpError.message || 'Failed to send verification code' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('OTP sent successfully via Supabase to:', formattedPhone);
      return new Response(
        JSON.stringify({ success: true, message: 'Verification code sent' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'verify') {
      if (!code) {
        return new Response(
          JSON.stringify({ error: 'Verification code is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Verifying OTP via Supabase for:', formattedPhone);

      // Verify the OTP using Supabase's native method
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: code,
        type: 'sms',
      });

      if (verifyError) {
        console.error('Supabase OTP verify error:', verifyError);
        return new Response(
          JSON.stringify({ error: verifyError.message || 'Invalid or expired verification code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!verifyData?.user || !verifyData?.session) {
        console.error('No user or session returned from verifyOtp');
        return new Response(
          JSON.stringify({ error: 'Verification failed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const user = verifyData.user;
      const session = verifyData.session;
      const isNewUser = new Date(user.created_at).getTime() > Date.now() - 60000; // Created in last minute

      console.log('OTP verified successfully, user:', user.id, 'isNew:', isNewUser);

      // For new users, grant passenger role
      if (isNewUser) {
        console.log('New user - granting passenger role');
        
        await supabase.from('user_roles').insert({
          user_id: user.id,
          role: 'passenger',
          is_active: true,
        });

        await supabase.from('portal_access').insert({
          user_id: user.id,
          portal_type: 'passenger',
          access_granted: true,
        });
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          verified: true,
          userId: user.id,
          isNewUser,
          session: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_in: session.expires_in,
            expires_at: session.expires_at,
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('SMS OTP error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
