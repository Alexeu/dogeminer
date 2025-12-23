import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FAUCETPAY_API_KEY = Deno.env.get('FAUCETPAY_API_KEY')!;
const FAUCETPAY_API_URL = 'https://faucetpay.io/api/v1/';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Get request type
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Handle manual check for pending deposits (called by polling)
    if (action === 'check-pending') {
      return await checkPendingDeposits(supabaseAdmin);
    }

    // Handle IPN callback from FaucetPay
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
      if (body) {
        const params = new URLSearchParams(body);
        for (const [key, value] of params.entries()) {
          ipnData[key] = value;
        }
      }
    }

    console.log('IPN received:', JSON.stringify(ipnData));

    // FaucetPay IPN fields
    const {
      transaction_id,
      payout_id,
      amount,
      currency,
      custom,
      ref,
      to_address,
      from_address,
      status: txStatus,
    } = ipnData;

    const verificationCode = custom || ref || '';
    
    // If no data, maybe it's a ping or we should check pending deposits
    if (!amount && !verificationCode) {
      console.log('No IPN data, checking pending deposits...');
      return await checkPendingDeposits(supabaseAdmin);
    }

    if (!amount || !currency) {
      console.error('Missing required fields');
      return new Response('Missing fields', { status: 400, headers: corsHeaders });
    }

    if (currency?.toUpperCase() !== 'DOGE') {
      console.log('Ignoring non-DOGE:', currency);
      return new Response('OK', { headers: corsHeaders });
    }

    const amountInDoge = parseInt(amount) / 100000000;
    console.log(`Processing IPN: ${amountInDoge} DOGE, code: ${verificationCode}, status: ${txStatus}`);

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

      // Verify amount matches (with 5% tolerance for fees)
      const minExpected = deposit.amount * 0.95;
      if (amountInDoge < minExpected) {
        console.log(`Amount mismatch: received ${amountInDoge}, expected ${deposit.amount}`);
        return new Response('OK - Amount mismatch', { headers: corsHeaders });
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
          message: `Se acreditaron ${amountInDoge.toFixed(4)} DOGE automáticamente vía FaucetPay.`,
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

// Function to check pending deposits using FaucetPay API
async function checkPendingDeposits(supabaseAdmin: any) {
  try {
    // Get all pending deposits not expired
    const { data: pendingDeposits, error } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());

    if (error || !pendingDeposits || pendingDeposits.length === 0) {
      console.log('No pending deposits to check');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No pending deposits',
        checked: 0 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`Checking ${pendingDeposits.length} pending deposits...`);

    let completed = 0;
    let failed = 0;

    // For each pending deposit, we check via FaucetPay API
    // Note: FaucetPay doesn't have a direct "list received payments" API,
    // but we can check our transaction history
    const formData = new FormData();
    formData.append('api_key', FAUCETPAY_API_KEY);
    formData.append('count', '50');

    const response = await fetch(`${FAUCETPAY_API_URL}payouts`, {
      method: 'POST',
      body: formData
    });

    const apiResult = await response.json();
    console.log('FaucetPay payouts result:', JSON.stringify(apiResult).substring(0, 500));

    // Check each pending deposit against recent activity
    for (const deposit of pendingDeposits) {
      // Check if expired
      if (new Date(deposit.expires_at) < new Date()) {
        await supabaseAdmin
          .from('deposits')
          .update({ status: 'expired' })
          .eq('id', deposit.id);
        failed++;
        continue;
      }

      // Look for matching transaction in payouts
      if (apiResult.status === 200 && apiResult.payouts) {
        const matchingTx = apiResult.payouts.find((tx: any) => {
          // Check if custom field or reference matches
          const customMatch = tx.custom === deposit.verification_code || 
                             tx.referral === deposit.verification_code ||
                             tx.ref === deposit.verification_code;
          
          // Also check amount (with tolerance)
          const amountDoge = parseInt(tx.amount || '0') / 100000000;
          const amountMatch = Math.abs(amountDoge - deposit.amount) < 0.01;
          
          return customMatch || (amountMatch && tx.currency === 'DOGE');
        });

        if (matchingTx) {
          console.log(`Found matching tx for deposit ${deposit.id}:`, matchingTx);
          
          // Complete the deposit
          const { error: completeError } = await supabaseAdmin.rpc('complete_deposit', {
            p_deposit_id: deposit.id,
            p_tx_hash: matchingTx.tx_id || matchingTx.id || `fp_${Date.now()}`
          });

          if (!completeError) {
            // Create notification
            await supabaseAdmin
              .from('notifications')
              .insert({
                user_id: deposit.user_id,
                type: 'deposit',
                title: '¡Depósito recibido!',
                message: `Se acreditaron ${deposit.amount.toFixed(4)} DOGE automáticamente.`,
                data: { amount: deposit.amount }
              });
            
            completed++;
            console.log(`Auto-completed deposit ${deposit.id}`);
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      checked: pendingDeposits.length,
      completed,
      failed
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Check pending deposits error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
}
