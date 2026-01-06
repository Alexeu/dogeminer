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
    
    // Create service role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { action, fingerprint, userAgent } = body;
    const clientIP = getClientIP(req);

    console.log(`[validate-fingerprint] Action: ${action}, User: ${user.id}, IP: ${clientIP}, Fingerprint: ${fingerprint}`);

    if (action === 'check') {
      // Check if fingerprint is associated with banned accounts
      const { data: isBanned, error: checkError } = await supabaseAdmin
        .rpc('check_fingerprint_banned', { fp: fingerprint });

      if (checkError) {
        console.error('[validate-fingerprint] Check error:', checkError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to check fingerprint' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (isBanned) {
        console.warn(`[validate-fingerprint] Banned fingerprint detected: ${fingerprint} for user ${user.id}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            banned: true, 
            error: 'This device is associated with a banned account' 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if this fingerprint already has accounts (limit: 2 accounts per device)
      const { data: fpAccounts, error: fpError } = await supabaseAdmin
        .from('device_fingerprints')
        .select('user_id')
        .eq('fingerprint', fingerprint);

      if (!fpError && fpAccounts) {
        const uniqueFpUsers = new Set(fpAccounts.map(a => a.user_id));
        if (uniqueFpUsers.size >= 2 && !uniqueFpUsers.has(user.id)) {
          console.warn(`[validate-fingerprint] Too many accounts from fingerprint: ${fingerprint}`);
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

      // Check if this IP has too many accounts (limit: 3 accounts per IP)
      const { data: ipAccounts, error: ipError } = await supabaseAdmin
        .from('device_fingerprints')
        .select('user_id')
        .eq('ip_address', clientIP);

      if (!ipError && ipAccounts) {
        const uniqueUsers = new Set(ipAccounts.map(a => a.user_id));
        if (uniqueUsers.size >= 3 && !uniqueUsers.has(user.id)) {
          console.warn(`[validate-fingerprint] Too many accounts from IP: ${clientIP}`);
          return new Response(
            JSON.stringify({ 
              success: false, 
              tooManyAccounts: true,
              error: 'Too many accounts associated with this IP address' 
            }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true, banned: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'register') {
      // Check if this exact fingerprint already exists for this user
      const { data: existing } = await supabaseAdmin
        .from('device_fingerprints')
        .select('id')
        .eq('user_id', user.id)
        .eq('fingerprint', fingerprint)
        .single();

      if (existing) {
        // Update IP if changed
        await supabaseAdmin
          .from('device_fingerprints')
          .update({ ip_address: clientIP, user_agent: userAgent })
          .eq('id', existing.id);

        console.log(`[validate-fingerprint] Updated existing fingerprint for user ${user.id}`);
        return new Response(
          JSON.stringify({ success: true, action: 'updated' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Register new fingerprint
      const { error: insertError } = await supabaseAdmin
        .from('device_fingerprints')
        .insert({
          user_id: user.id,
          fingerprint,
          ip_address: clientIP,
          user_agent: userAgent,
        });

      if (insertError) {
        console.error('[validate-fingerprint] Insert error:', insertError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to register fingerprint' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[validate-fingerprint] Registered new fingerprint for user ${user.id}`);
      return new Response(
        JSON.stringify({ success: true, action: 'registered' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[validate-fingerprint] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
