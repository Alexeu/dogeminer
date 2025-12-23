import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FAUCETPAY_API_URL = 'https://faucetpay.io/api/v1';
const FAUCETPAY_API_KEY = Deno.env.get('FAUCETPAY_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Verify JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Authentication required' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid token' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { currency = 'DOGE' } = await req.json();

    if (!FAUCETPAY_API_KEY) {
      console.error('FaucetPay API key not configured');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'FaucetPay API not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call FaucetPay API to get deposit address
    const formData = new URLSearchParams();
    formData.append('api_key', FAUCETPAY_API_KEY);
    formData.append('currency', currency.toLowerCase());

    console.log(`Getting deposit address for user ${user.id}, currency: ${currency}`);

    const response = await fetch(`${FAUCETPAY_API_URL}/getdepositaddress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();
    console.log('FaucetPay get_deposit_address response:', data);

    if (data.status === 200) {
      return new Response(JSON.stringify({
        success: true,
        address: data.address,
        currency: currency.toUpperCase()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error('FaucetPay API error:', data);
      return new Response(JSON.stringify({
        success: false,
        error: data.message || 'Failed to get deposit address'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Get deposit address error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
