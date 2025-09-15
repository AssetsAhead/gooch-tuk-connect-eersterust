import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_WHATSAPP_FROM = 'whatsapp:+14155238886'; // Twilio Sandbox number

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error('Missing Twilio credentials');
    }

    const { to, templateName, templateParams, freeformMessage }: WhatsAppMessageRequest = await req.json();

    if (!to) {
      throw new Error('Phone number (to) is required');
    }

    // Format phone number for WhatsApp
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    let messageBody = '';
    
    if (templateName) {
      // For template messages, we'll use ContentSid once approved templates are available
      // For now, using basic message format
      switch (templateName) {
        case 'ride_confirmation':
          messageBody = `🚖 Ride Confirmed! Driver: ${templateParams?.[0] || 'Unknown'}, ETA: ${templateParams?.[1] || '5 mins'}. Track your ride in the app.`;
          break;
        case 'payment_reminder':
          messageBody = `💰 Payment Reminder: Your SASSA transport payment of R${templateParams?.[0] || '0'} is due on ${templateParams?.[1] || 'today'}. Discount available!`;
          break;
        case 'emergency_alert':
          messageBody = `🚨 Emergency Alert: ${templateParams?.[0] || 'Safety incident'} in your area. Stay safe and avoid ${templateParams?.[1] || 'the area'}.`;
          break;
        case 'driver_notification':
          messageBody = `🚗 New Ride Request: Pickup at ${templateParams?.[0] || 'Unknown location'}, Destination: ${templateParams?.[1] || 'Unknown'}. Accept in app.`;
          break;
        default:
          messageBody = freeformMessage || 'Transport update from your taxi service.';
      }
    } else {
      messageBody = freeformMessage || 'Transport update from your taxi service.';
    }

    // Create Twilio API URL
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    // Prepare form data for Twilio API
    const formData = new URLSearchParams();
    formData.append('From', TWILIO_WHATSAPP_FROM);
    formData.append('To', formattedTo);
    formData.append('Body', messageBody);

    // Create basic auth header
    const authHeader = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    console.log(`Sending WhatsApp message to ${formattedTo}: ${messageBody}`);

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
      console.error('Twilio API error:', responseData);
      throw new Error(`Twilio API error: ${responseData.message || 'Unknown error'}`);
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