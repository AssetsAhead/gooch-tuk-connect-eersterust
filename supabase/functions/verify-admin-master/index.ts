// Supabase Edge Function: verify-admin-master
// Verifies a master admin password stored as a secret

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { password } = await req.json().catch(() => ({ password: '' }));
    const master = Deno.env.get('ADMIN_MASTER_PASSWORD') || '';

    const valid = typeof password === 'string' && password.length > 0 && password === master;

    return new Response(JSON.stringify({ valid }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: valid ? 200 : 403,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
