import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get client IP from request headers
const getClientIP = (req: Request): string => {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { fingerprint, userAgent } = body;
    const clientIP = getClientIP(req);

    console.log(`[validate-fingerprint-public] IP: ${clientIP}, Fingerprint: ${fingerprint}`);

    if (!fingerprint) {
      return new Response(
        JSON.stringify({ success: false, error: 'Fingerprint required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if fingerprint is associated with banned accounts
    const { data: isBanned, error: checkError } = await supabaseAdmin
      .rpc('check_fingerprint_banned', { fp: fingerprint });

    if (checkError) {
      console.error('[validate-fingerprint-public] Check error:', checkError);
      return new Response(
        JSON.stringify({ success: true }), // Allow on error
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (isBanned) {
      console.warn(`[validate-fingerprint-public] Banned fingerprint: ${fingerprint}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          banned: true, 
          error: 'This device is associated with a banned account' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check how many accounts this fingerprint has (limit: 2)
    const { data: fpAccounts, error: fpError } = await supabaseAdmin
      .from('device_fingerprints')
      .select('user_id')
      .eq('fingerprint', fingerprint);

    if (!fpError && fpAccounts) {
      const uniqueFpUsers = new Set(fpAccounts.map(a => a.user_id));
      if (uniqueFpUsers.size >= 2) {
        console.warn(`[validate-fingerprint-public] Too many accounts from fingerprint: ${fingerprint} (${uniqueFpUsers.size})`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            tooManyAccounts: true,
            error: 'Too many accounts from this device' 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check how many accounts this IP has (limit: 3)
    const { data: ipAccounts, error: ipError } = await supabaseAdmin
      .from('device_fingerprints')
      .select('user_id')
      .eq('ip_address', clientIP);

    if (!ipError && ipAccounts) {
      const uniqueIpUsers = new Set(ipAccounts.map(a => a.user_id));
      if (uniqueIpUsers.size >= 3) {
        console.warn(`[validate-fingerprint-public] Too many accounts from IP: ${clientIP} (${uniqueIpUsers.size})`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            tooManyAccounts: true,
            error: 'Too many accounts from this IP' 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, banned: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[validate-fingerprint-public] Error:', error);
    return new Response(
      JSON.stringify({ success: true }), // Allow on error
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
