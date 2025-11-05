// Supabase Edge Function: verify-admin-master
// Verifies a master admin password stored as a secret
// SECURITY: Rate-limited and timing-attack resistant

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting: max 3 attempts per 5 minutes per IP
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const ipLimit = rateLimitStore.get(ip);

  if (!ipLimit || now > ipLimit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + 300000 }); // 5 min
    return true;
  }

  if (ipLimit.count >= 3) {
    return false;
  }

  ipLimit.count++;
  return true;
};

// Constant-time comparison to prevent timing attacks
const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get IP for rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                req.headers.get('x-real-ip') || 
                'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return new Response(JSON.stringify({ 
        valid: false,
        error: 'Too many attempts. Please try again later.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
      });
    }

    // Validate JWT first
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ valid: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ valid: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { password } = await req.json().catch(() => ({ password: '' }));
    const master = Deno.env.get('ADMIN_MASTER_PASSWORD') || '';

    // Validate input
    if (typeof password !== 'string' || password.length === 0 || password.length > 100) {
      return new Response(JSON.stringify({ valid: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Use constant-time comparison to prevent timing attacks
    const valid = secureCompare(password, master);

    // Log failed attempts
    if (!valid) {
      console.warn(`Failed admin verification attempt from user: ${user.id}, IP: ${ip}`);
    }

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
