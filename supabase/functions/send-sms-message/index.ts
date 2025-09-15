import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSMessageRequest {
  to: string;
  message: string;
  type?: 'emergency' | 'notification' | 'reminder' | 'info';
}

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = '+12345678901'; // Replace with your Twilio phone number

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error('Missing Twilio credentials');
    }

    const { to, message, type = 'notification' }: SMSMessageRequest = await req.json();

    if (!to || !message) {
      throw new Error('Phone number and message are required');
    }

    // Format phone number for SMS
    const formattedTo = to.startsWith('+') ? to : `+${to}`;

    // Add priority indicators for different message types
    let prefixedMessage = message;
    switch (type) {
      case 'emergency':
        prefixedMessage = `🚨 EMERGENCY: ${message}`;
        break;
      case 'reminder':
        prefixedMessage = `⏰ REMINDER: ${message}`;
        break;
      case 'info':
        prefixedMessage = `ℹ️ INFO: ${message}`;
        break;
      default:
        prefixedMessage = `📱 ${message}`;
    }

    // Create Twilio API URL
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    // Prepare form data for Twilio API
    const formData = new URLSearchParams();
    formData.append('From', TWILIO_PHONE_NUMBER);
    formData.append('To', formattedTo);
    formData.append('Body', prefixedMessage);

    // Create basic auth header
    const authHeader = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    console.log(`Sending SMS to ${formattedTo}: ${prefixedMessage}`);

    // Send message via Twilio API
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
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