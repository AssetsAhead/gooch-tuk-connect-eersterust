import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Auto-categorise messages based on keywords
// Filter out political and religious banter — strictly business
const isPoliticalOrReligious = (body: string): boolean => {
  const lower = body.toLowerCase();
  return /\b(anc|da|eff|mk\s?party|action\s?sa|patriotic\s?alliance|zuma|ramaphosa|malema|steenhuisen|election|vote|ballot|parliament|politician|political|municipality\s?election|ward\s?councillor\s?election|campaign|rally|manifesto)\b/i.test(lower)
    || /\b(church|mosque|pastor|imam|pray|prayer|god\s?is|jesus|allah|bible|quran|scripture|sermon|congregation|worship|hallelujah|amen|blessed|prophec|prophet|apostle|ministry|gospel)\b/i.test(lower);
};

const categoriseMessage = (body: string): string => {
  const lower = body.toLowerCase();
  if (/accident|crash|hijack|robbery|attack|stab|shoot|gun|knife|dead|kill/i.test(lower)) return 'safety';
  if (/fight|argue|dispute|complain|kick|ban|block|chase|steal/i.test(lower)) return 'dispute';
  if (/license|permit|fine|impound|roadblock|traffic|cop|officer|inspect/i.test(lower)) return 'compliance';
  if (/route|rank|queue|load|full|passenger|fare|price|petrol|diesel/i.test(lower)) return 'operations';
  return 'general';
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Twilio sends webhooks as application/x-www-form-urlencoded
    const contentType = req.headers.get('content-type') || '';
    let from = '';
    let body = '';
    let messageSid = '';
    let mediaUrl = '';
    let numMedia = 0;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.text();
      const params = new URLSearchParams(formData);
      from = params.get('From') || '';
      body = params.get('Body') || '';
      messageSid = params.get('MessageSid') || '';
      numMedia = parseInt(params.get('NumMedia') || '0', 10);
      if (numMedia > 0) {
        mediaUrl = params.get('MediaUrl0') || '';
      }
    } else {
      // Also support JSON for testing
      const json = await req.json();
      from = json.From || json.from || '';
      body = json.Body || json.body || '';
      messageSid = json.MessageSid || json.messageSid || '';
      mediaUrl = json.MediaUrl0 || json.mediaUrl || '';
    }

    // Strip whatsapp: prefix for storage
    const cleanNumber = from.replace('whatsapp:', '');

    if (!cleanNumber) {
      return new Response(
        '<Response><Message>Invalid request.</Message></Response>',
        { status: 400, headers: { 'Content-Type': 'text/xml', ...corsHeaders } }
      );
    }

    // Filter out political/religious banter — strictly business
    if (isPoliticalOrReligious(body)) {
      console.log(`Filtered: political/religious content from ${cleanNumber.slice(-4)}`);
      return new Response('<Response></Response>', {
        status: 200,
        headers: { 'Content-Type': 'text/xml', ...corsHeaders },
      });
    }

    // Auto-categorise
    const category = categoriseMessage(body);

    // Check for forwarded message indicator
    const isForwarded = body.includes('⏩') || body.toLowerCase().startsWith('forwarded');
    const forwarded_from = isForwarded ? 'Forwarded message' : null;

    // Store in database using service role (bypasses RLS)
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await adminClient.from('whatsapp_intel_messages').insert({
      from_number: cleanNumber,
      message_body: body,
      media_url: mediaUrl || null,
      twilio_sid: messageSid || null,
      category,
      forwarded_from,
    });

    if (error) {
      console.error('Failed to store intel message:', error);
    } else {
      console.log(`Intel captured: [${category}] from ${cleanNumber.slice(-4)}`);
    }

    // Respond with TwiML (Twilio expects this)
    // Empty Response = no auto-reply, silent capture
    return new Response(
      '<Response></Response>',
      { status: 200, headers: { 'Content-Type': 'text/xml', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      '<Response></Response>',
      { status: 200, headers: { 'Content-Type': 'text/xml', ...corsHeaders } }
    );
  }
};

serve(handler);
