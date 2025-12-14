import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FAUCETPAY_DEPOSIT_EMAIL = 'dogeminer@proton.me'; // Email donde recibimos depósitos

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

    const { amount } = await req.json();
    
    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0.1 || numAmount > 100) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Amount must be between 0.1 and 100 DOGE' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for existing pending deposit
    const { data: existingDeposit } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingDeposit) {
      // Return existing deposit info
      const paymentUrl = generateFaucetPayUrl(existingDeposit.amount, existingDeposit.verification_code);
      return new Response(JSON.stringify({
        success: true,
        deposit_id: existingDeposit.id,
        verification_code: existingDeposit.verification_code,
        amount: existingDeposit.amount,
        payment_url: paymentUrl,
        expires_at: existingDeposit.expires_at,
        recipient: FAUCETPAY_DEPOSIT_EMAIL
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate unique verification code
    const verificationCode = 'DM' + user.id.substring(0, 4).toUpperCase() + Date.now().toString(36).toUpperCase().slice(-4);
    
    // Create deposit record
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    
    const { data: deposit, error: insertError } = await supabaseAdmin
      .from('deposits')
      .insert({
        user_id: user.id,
        amount: numAmount,
        verification_code: verificationCode,
        faucetpay_email: user.email || 'user',
        status: 'pending',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to create deposit request' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate FaucetPay payment URL
    const paymentUrl = generateFaucetPayUrl(numAmount, verificationCode);

    console.log(`Created deposit ${deposit.id} for ${numAmount} DOGE, code: ${verificationCode}`);

    return new Response(JSON.stringify({
      success: true,
      deposit_id: deposit.id,
      verification_code: verificationCode,
      amount: numAmount,
      payment_url: paymentUrl,
      expires_at: expiresAt.toISOString(),
      recipient: FAUCETPAY_DEPOSIT_EMAIL
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Create deposit error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFaucetPayUrl(amount: number, reference: string): string {
  const amountSatoshi = Math.floor(amount * 100000000);
  const depositEmail = 'dogeminer@proton.me';
  
  // FaucetPay send-payment URL with custom field for IPN
  const params = new URLSearchParams({
    to: depositEmail,
    amount: amountSatoshi.toString(),
    currency: 'DOGE',
    custom: reference,  // Used for IPN callback
    ref: reference      // Also set ref as backup
  });
  
  return `https://faucetpay.io/page/send-payment?${params.toString()}`;
}
