import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSMessageRequest {
  to: string;
  message: string;
  type?: 'emergency' | 'notification' | 'reminder' | 'info';
}

// Rate limiting: max 10 SMS per minute per user
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (userLimit.count >= 10) {
    return false;
  }

  userLimit.count++;
  return true;
};

const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
};

const sanitizeMessage = (message: string): string => {
  // SMS limit is 160 chars for standard, 1600 for concatenated
  return message
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 160); // Enforce SMS length limit
};

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = '+12345678901'; // Replace with your Twilio phone number

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT and get user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check rate limit
    if (!checkRateLimit(user.id)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Max 10 SMS per minute.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error('Missing Twilio credentials');
    }

    const { to, message, type = 'notification' }: SMSMessageRequest = await req.json();

    // Validate inputs
    if (!to || !validatePhoneNumber(to)) {
      return new Response(JSON.stringify({ error: 'Invalid phone number format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!message || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Message content is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Format phone number for SMS
    const formattedTo = to.startsWith('+') ? to : `+${to}`;

    // Sanitize and add priority indicators
    const sanitized = sanitizeMessage(message);
    let prefixedMessage = sanitized;
    switch (type) {
      case 'emergency':
        prefixedMessage = `🚨 EMERGENCY: ${sanitized}`;
        break;
      case 'reminder':
        prefixedMessage = `⏰ REMINDER: ${sanitized}`;
        break;
      case 'info':
        prefixedMessage = `ℹ️ INFO: ${sanitized}`;
        break;
      default:
        prefixedMessage = `📱 ${sanitized}`;
    }

    // Create Twilio API URL
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    // Prepare form data for Twilio API
    const formData = new URLSearchParams();
    formData.append('From', TWILIO_PHONE_NUMBER);
    formData.append('To', formattedTo);
    formData.append('Body', prefixedMessage);

    // Create basic auth header for Twilio
    const twilioAuthHeader = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    console.log(`Sending SMS to ${formattedTo}: ${prefixedMessage}`);

    // Send message via Twilio API
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${twilioAuthHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Twilio SMS API error:', responseData);
      throw new Error(`Twilio SMS API error: ${responseData.message || 'Unknown error'}`);
    }

    console.log('SMS sent successfully:', responseData.sid);

    return new Response(JSON.stringify({
      success: true,
      messageSid: responseData.sid,
      status: responseData.status,
      to: formattedTo,
      type: type,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);