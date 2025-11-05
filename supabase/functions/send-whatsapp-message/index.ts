import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppMessageRequest {
  to: string;
  templateName?: string;
  templateParams?: string[];
  freeformMessage?: string;
}

// Rate limiting: max 5 requests per minute per user
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (userLimit.count >= 5) {
    return false;
  }

  userLimit.count++;
  return true;
};

const validatePhoneNumber = (phone: string): boolean => {
  // E.164 format: +[country code][subscriber number]
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
};

const sanitizeMessage = (message: string): string => {
  // Remove potential malicious content and limit length
  return message
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML/script tags
    .substring(0, 1000); // Limit to 1000 chars
};

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_WHATSAPP_FROM = 'whatsapp:+14155238886'; // Twilio Sandbox number

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
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Max 5 messages per minute.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error('Missing Twilio credentials');
    }

    const { to, templateName, templateParams, freeformMessage }: WhatsAppMessageRequest = await req.json();

    // Validate phone number
    if (!to || !validatePhoneNumber(to)) {
      return new Response(JSON.stringify({ error: 'Invalid phone number format. Use E.164 format (+country code + number)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Validate message content
    if (!freeformMessage && !templateName) {
      return new Response(JSON.stringify({ error: 'Either freeformMessage or templateName is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Format phone number for WhatsApp
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    let messageBody = '';
    
    if (templateName) {
      // Sanitize template parameters
      const sanitizedParams = templateParams?.map(p => sanitizeMessage(p)) || [];
      
      switch (templateName) {
        case 'ride_confirmation':
          messageBody = `🚖 Ride Confirmed! Driver: ${sanitizedParams[0] || 'Unknown'}, ETA: ${sanitizedParams[1] || '5 mins'}. Track your ride in the app.`;
          break;
        case 'payment_reminder':
          messageBody = `💰 Payment Reminder: Your SASSA transport payment of R${sanitizedParams[0] || '0'} is due on ${sanitizedParams[1] || 'today'}. Discount available!`;
          break;
        case 'emergency_alert':
          messageBody = `🚨 Emergency Alert: ${sanitizedParams[0] || 'Safety incident'} in your area. Stay safe and avoid ${sanitizedParams[1] || 'the area'}.`;
          break;
        case 'driver_notification':
          messageBody = `🚗 New Ride Request: Pickup at ${sanitizedParams[0] || 'Unknown location'}, Destination: ${sanitizedParams[1] || 'Unknown'}. Accept in app.`;
          break;
        default:
          messageBody = sanitizeMessage(freeformMessage || 'Transport update from your taxi service.');
      }
    } else {
      messageBody = sanitizeMessage(freeformMessage || 'Transport update from your taxi service.');
    }

    // Create Twilio API URL
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    // Prepare form data for Twilio API
    const formData = new URLSearchParams();
    formData.append('From', TWILIO_WHATSAPP_FROM);
    formData.append('To', formattedTo);
    formData.append('Body', messageBody);

    // Create basic auth header for Twilio
    const twilioAuthHeader = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    console.log(`Sending WhatsApp message to ${formattedTo}: ${messageBody}`);

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
      // Log detailed error server-side only
      console.error('Twilio API error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData
      });
      
      // Return generic error message to client based on status code
      const clientMessage = response.status === 401 || response.status === 403
        ? 'Service authentication error. Please try again later.'
        : response.status === 400
        ? 'Invalid message request. Please check your input.'
        : response.status === 429
        ? 'Too many requests. Please wait and try again.'
        : 'Message delivery failed. Please try again later.';
      
      throw new Error(clientMessage);
    }

    console.log('WhatsApp message sent successfully:', responseData.sid);

    return new Response(JSON.stringify({
      success: true,
      messageSid: responseData.sid,
      status: responseData.status,
      to: formattedTo,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
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