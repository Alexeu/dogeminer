import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FAUCETPAY_API_URL = 'https://faucetpay.io/api/v1';
const API_KEY = Deno.env.get('FAUCETPAY_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, address, amount, currency = 'BONK' } = await req.json();
    console.log(`FaucetPay action: ${action}, address: ${address}, amount: ${amount}, currency: ${currency}`);

    if (!API_KEY) {
      throw new Error('FaucetPay API key not configured');
    }

    let endpoint = '';
    let body: Record<string, string> = {
      api_key: API_KEY,
    };

    switch (action) {
      case 'getBalance':
        endpoint = '/balance';
        body.currency = currency;
        break;
      
      case 'checkAddress':
        endpoint = '/checkaddress';
        body.address = address;
        body.currency = currency;
        break;
      
      case 'send':
        endpoint = '/send';
        body.to = address;
        body.amount = String(amount);
        body.currency = currency;
        break;
      
      case 'getFaucetList':
        endpoint = '/faucetlist';
        body.currency = currency;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`Calling FaucetPay API: ${FAUCETPAY_API_URL}${endpoint}`);

    const formData = new URLSearchParams();
    Object.entries(body).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetch(`${FAUCETPAY_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();
    console.log('FaucetPay response:', JSON.stringify(data));

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('FaucetPay error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error processing request';
    return new Response(JSON.stringify({ 
      status: 400, 
      message: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
