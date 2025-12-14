import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Parse IPN data from various formats
    let ipnData: Record<string, string> = {};
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        ipnData[key] = String(value);
      }
    } else if (contentType.includes('application/json')) {
      ipnData = await req.json();
    } else {
      const body = await req.text();
      const params = new URLSearchParams(body);
      for (const [key, value] of params.entries()) {
        ipnData[key] = value;
      }
    }

    console.log('IPN received:', JSON.stringify(ipnData));

    // FaucetPay IPN fields
    const {
      transaction_id,
      payout_id,
      amount, // In satoshi
      currency,
      custom,      // Our verification code
      ref,         // Also check ref field
      to_address,  // Recipient address
    } = ipnData;

    const verificationCode = custom || ref || '';
    
    if (!amount || !currency) {
      console.error('Missing required fields');
      return new Response('Missing fields', { status: 400, headers: corsHeaders });
    }

    if (currency?.toUpperCase() !== 'DOGE') {
      console.log('Ignoring non-DOGE:', currency);
      return new Response('OK', { headers: corsHeaders });
    }

    const amountInDoge = parseInt(amount) / 100000000;
    console.log(`Processing: ${amountInDoge} DOGE, code: ${verificationCode}`);

    // Find pending deposit by verification code
    if (verificationCode) {
      const { data: deposit, error: findError } = await supabaseAdmin
        .from('deposits')
        .select('*')
        .eq('verification_code', verificationCode)
        .eq('status', 'pending')
        .single();

      if (findError || !deposit) {
        console.log('Deposit not found for code:', verificationCode);
        return new Response('OK - No matching deposit', { headers: corsHeaders });
      }

      // Check if already processed
      const txId = transaction_id || payout_id || `ipn_${Date.now()}`;
      const { data: existingTx } = await supabaseAdmin
        .from('transactions')
        .select('id')
        .eq('tx_hash', txId)
        .eq('type', 'deposit')
        .single();

      if (existingTx) {
        console.log('Already processed:', txId);
        return new Response('OK - Already processed', { headers: corsHeaders });
      }

      // Complete the deposit
      const { data: result, error: completeError } = await supabaseAdmin.rpc('complete_deposit', {
        p_deposit_id: deposit.id,
        p_tx_hash: txId
      });

      if (completeError) {
        console.error('Complete error:', completeError);
        return new Response('Error', { status: 500, headers: corsHeaders });
      }

      // Create notification
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: deposit.user_id,
          type: 'deposit',
          title: '¡Depósito recibido!',
          message: `Se acreditaron ${amountInDoge.toFixed(4)} DOGE automáticamente.`,
          data: { amount: amountInDoge, tx_hash: txId }
        });

      console.log(`Deposit completed: ${amountInDoge} DOGE for user ${deposit.user_id}`);
    }

    return new Response('OK', { headers: corsHeaders });

  } catch (error) {
    console.error('IPN error:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
});