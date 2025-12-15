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
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle various input formats:
  // +27826370673 -> 27826370673 (11 digits)
  // 27826370673 -> 27826370673 (11 digits)  
  // 0826370673 -> 27826370673 (10 digits with leading 0)
  // 826370673 -> 27826370673 (9 digits - just the local part)
  
  // If starts with 27 and has 11 digits total, it's already in correct format
  if (cleaned.startsWith('27') && cleaned.length === 11) {
    return '+' + cleaned;
  }
  
  // If starts with 0 and has 10 digits, replace 0 with 27
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '+27' + cleaned.substring(1);
  }
  
  // If it's 9 digits (local number without 0 or country code), add +27
  if (cleaned.length === 9 && !cleaned.startsWith('27')) {
    return '+27' + cleaned;
  }
  
  // Fallback: just add + if it starts with 27, otherwise add +27
  if (cleaned.startsWith('27')) {
    return '+' + cleaned;
  }
  return '+27' + cleaned;
}

// Validate phone number - must be E.164 format with SA country code
function validatePhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  // SA mobile numbers: +27 followed by 9 digits (total 12 chars)
  // Valid mobile prefixes: 6x, 7x, 8x
  const isValid = /^\+27[6-8][0-9]{8}$/.test(formatted);
  console.log(`Phone validation: input="${phone}", formatted="${formatted}", valid=${isValid}`);
  return isValid;
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
        // Log failed SMS attempt
        await supabase.from('sms_usage_logs').insert({
          phone_number: formattedPhone,
          message_type: 'otp',
          status: 'failed',
          cost_estimate: 0,
        });
        return new Response(
          JSON.stringify({ error: otpError.message || 'Failed to send verification code' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log successful SMS send (Twilio SMS costs ~R0.50-R0.80 per SMS in SA)
      await supabase.from('sms_usage_logs').insert({
        phone_number: formattedPhone,
        message_type: 'otp',
        status: 'sent',
        cost_estimate: 0.75,
      });

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

      // Always ensure user has at least passenger role (handles new users and returning users without roles)
      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (!existingRoles || existingRoles.length === 0) {
        console.log('User has no active roles - granting passenger role');
        
        // Use upsert to avoid duplicate key errors
        await supabase.from('user_roles').upsert({
          user_id: user.id,
          role: 'passenger',
          is_active: true,
        }, { onConflict: 'user_id,role' });

        await supabase.from('portal_access').upsert({
          user_id: user.id,
          portal_type: 'passenger',
          access_granted: true,
        }, { onConflict: 'user_id,portal_type' });
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
