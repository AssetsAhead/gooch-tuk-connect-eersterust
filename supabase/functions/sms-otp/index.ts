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

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
    
    // Create Supabase client with service role for database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'send') {
      // Generate OTP and store it
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

      // Delete any existing codes for this phone
      await supabase
        .from('sms_verification_codes')
        .delete()
        .eq('phone_number', formattedPhone);

      // Insert new code
      const { error: insertError } = await supabase
        .from('sms_verification_codes')
        .insert({
          phone_number: formattedPhone,
          code: otp,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        console.error('Failed to store OTP:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate verification code' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Send SMS via Twilio
      const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

      if (!twilioSid || !twilioToken || !twilioPhone) {
        console.error('Twilio credentials not fully configured');
        console.log('TWILIO_ACCOUNT_SID:', twilioSid ? 'set' : 'missing');
        console.log('TWILIO_AUTH_TOKEN:', twilioToken ? 'set' : 'missing');
        console.log('TWILIO_PHONE_NUMBER:', twilioPhone ? 'set' : 'missing');
        
        // In development, return the OTP for testing
        console.log(`DEV MODE - OTP for ${formattedPhone}: ${otp}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Verification code sent (dev mode)',
            devCode: otp 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const twilioAuth = btoa(`${twilioSid}:${twilioToken}`);

      console.log(`Sending SMS to ${formattedPhone} from ${twilioPhone}`);

      const smsResponse = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${twilioAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: formattedPhone,
          From: twilioPhone,
          Body: `Your TukConnect verification code is: ${otp}. Valid for 5 minutes.`,
        }),
      });

      const smsResult = await smsResponse.text();
      
      if (!smsResponse.ok) {
        console.error('Twilio error response:', smsResult);
        return new Response(
          JSON.stringify({ error: 'Failed to send SMS. Please check your phone number and try again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`OTP sent successfully to ${formattedPhone}`, smsResult);
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

      // Look up the code
      const { data: verification, error: lookupError } = await supabase
        .from('sms_verification_codes')
        .select('*')
        .eq('phone_number', formattedPhone)
        .eq('code', code)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (lookupError || !verification) {
        console.log('Invalid or expired OTP attempt:', formattedPhone);
        return new Response(
          JSON.stringify({ error: 'Invalid or expired verification code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Mark as verified
      await supabase
        .from('sms_verification_codes')
        .update({ verified: true })
        .eq('id', verification.id);

      // Check if user exists by phone OR by temp email
      const tempEmail = `${formattedPhone.replace('+', '')}@phone.tukconnect.app`;
      const tempPassword = `TC_${formattedPhone}_${Date.now()}`;
      
      // Helper function to find user by phone across all pages
      // Check multiple phone formats: +27..., 27..., 0...
      async function findUserByPhone(phone: string, email: string): Promise<any> {
        const phoneVariants = [
          phone,                                    // +27826370673
          phone.replace('+', ''),                   // 27826370673  
          '0' + phone.slice(3),                     // 0826370673 (if +27...)
        ];
        
        console.log('Searching for phone variants:', phoneVariants);
        
        let page = 1;
        const perPage = 1000;
        
        while (true) {
          const { data, error } = await supabase.auth.admin.listUsers({
            page,
            perPage,
          });
          
          if (error) {
            console.error('listUsers error:', error);
            break;
          }
          
          if (!data?.users?.length) {
            console.log('No users found on page', page);
            break;
          }
          
          console.log(`Checking ${data.users.length} users on page ${page}`);
          
          const found = data.users.find(u => {
            const userPhone = u.phone || '';
            const metaPhone = u.user_metadata?.phone || '';
            
            return phoneVariants.some(variant => 
              userPhone === variant || 
              metaPhone === variant ||
              u.email === email
            );
          });
          
          if (found) {
            console.log('Found matching user:', found.id, 'phone:', found.phone, 'email:', found.email);
            return found;
          }
          
          if (data.users.length < perPage) break;
          page++;
        }
        
        console.log('No user found after searching all pages');
        return null;
      }
      
      const existingUser = await findUserByPhone(formattedPhone, tempEmail);

      if (existingUser) {
        console.log('Existing user found:', existingUser.id, 'email:', existingUser.email);
        
        // Use existing email or set the temp email if user has no email
        const userEmail = existingUser.email || tempEmail;
        
        // Update user's password AND email (if missing) for this session
        const updateData: { password: string; email?: string } = {
          password: tempPassword,
        };
        
        // If user has no email, set it so signInWithPassword works
        if (!existingUser.email) {
          console.log('User has no email, setting temp email:', tempEmail);
          updateData.email = tempEmail;
        }
        
        const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, updateData);

        if (updateError) {
          console.error('Failed to update user:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to authenticate' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log('User updated successfully, returning email:', userEmail);

        return new Response(
          JSON.stringify({ 
            success: true, 
            verified: true,
            userId: existingUser.id,
            isNewUser: false,
            email: userEmail,
            tempPassword: tempPassword,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Create new user with phone
        console.log('Creating new user for phone:', formattedPhone);
        
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          phone: formattedPhone,
          email: tempEmail,
          password: tempPassword,
          phone_confirm: true,
          email_confirm: true,
          user_metadata: {
            phone: formattedPhone,
            signup_method: 'sms_otp',
          },
        });

        if (createError) {
          console.error('User creation error:', createError);
          
          // If phone exists error, try harder to find the user
          if (createError.message?.includes('Phone number already registered') || 
              createError.message?.includes('phone_exists')) {
            console.log('Phone exists, searching all users...');
            
            // Search with pagination again
            const phoneUser = await findUserByPhone(formattedPhone, tempEmail);
            
            if (phoneUser) {
              console.log('Found user on retry:', phoneUser.id);
              const { error: updateErr } = await supabase.auth.admin.updateUserById(phoneUser.id, {
                password: tempPassword,
              });
              
              if (!updateErr) {
                return new Response(
                  JSON.stringify({ 
                    success: true, 
                    verified: true,
                    userId: phoneUser.id,
                    isNewUser: false,
                    email: phoneUser.email || tempEmail,
                    tempPassword: tempPassword,
                  }),
                  { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
              }
            }
          }
          
          return new Response(
            JSON.stringify({ error: 'Failed to create account' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Grant passenger role
        if (newUser?.user) {
          await supabase.from('user_roles').insert({
            user_id: newUser.user.id,
            role: 'passenger',
            is_active: true,
          });

          await supabase.from('portal_access').insert({
            user_id: newUser.user.id,
            portal_type: 'passenger',
            access_granted: true,
          });
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            verified: true,
            userId: newUser?.user?.id,
            isNewUser: true,
            email: tempEmail,
            tempPassword: tempPassword,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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
