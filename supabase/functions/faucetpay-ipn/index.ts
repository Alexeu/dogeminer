import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FAUCETPAY_API_KEY = Deno.env.get('FAUCETPAY_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // FaucetPay sends IPN as form data or JSON
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
      // Try to parse as URL encoded from body
      const body = await req.text();
      const params = new URLSearchParams(body);
      for (const [key, value] of params.entries()) {
        ipnData[key] = value;
      }
    }

    console.log('Received IPN data:', JSON.stringify(ipnData));

    // Extract IPN fields
    const {
      transaction_id,
      payout_id,
      payout_user_hash,
      amount, // In satoshi
      currency,
      custom,
      status,
    } = ipnData;

    // Validate required fields
    if (!payout_user_hash || !amount || !currency) {
      console.error('Missing required IPN fields');
      return new Response('Missing required fields', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Only process DOGE
    if (currency?.toUpperCase() !== 'DOGE') {
      console.log('Ignoring non-DOGE currency:', currency);
      return new Response('OK', { headers: corsHeaders });
    }

    // Convert satoshi to DOGE
    const amountInDoge = parseInt(amount) / 100000000;
    
    console.log(`Processing deposit: ${amountInDoge} DOGE for hash ${payout_user_hash}`);

    // Find user by their FaucetPay hash stored in a previous transaction or profile
    // First, try to find a pending deposit with matching verification code (custom field)
    let userId: string | null = null;

    if (custom) {
      // Try to match with pending deposit verification code
      const { data: deposit } = await supabaseAdmin
        .from('deposits')
        .select('user_id')
        .eq('verification_code', custom)
        .eq('status', 'pending')
        .single();
      
      if (deposit) {
        userId = deposit.user_id;
        console.log(`Found user ${userId} via verification code`);
      }
    }

    // If not found, try to find by faucetpay email in transactions
    if (!userId) {
      // Look for completed transactions with this payout_user_hash
      const { data: transactions } = await supabaseAdmin
        .from('transactions')
        .select('user_id, faucetpay_address')
        .eq('status', 'completed')
        .not('faucetpay_address', 'is', null)
        .limit(100);

      if (transactions && transactions.length > 0) {
        // We need to verify which user this hash belongs to
        // For now, we'll check if any user has linked their FaucetPay
        for (const tx of transactions) {
          // Verify the hash matches the address
          const verifyResponse = await fetch('https://faucetpay.io/api/v1/checkaddress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              api_key: FAUCETPAY_API_KEY!,
              address: tx.faucetpay_address!,
              currency: 'DOGE',
            }),
          });
          
          const verifyData = await verifyResponse.json();
          if (verifyData.status === 200 && verifyData.payout_user_hash === payout_user_hash) {
            userId = tx.user_id;
            console.log(`Found user ${userId} via FaucetPay hash match`);
            break;
          }
        }
      }
    }

    if (!userId) {
      console.error('Could not identify user for payout_user_hash:', payout_user_hash);
      // Still return OK to FaucetPay to prevent retries
      return new Response('OK - User not found', { headers: corsHeaders });
    }

    // Check if this transaction was already processed
    const txIdentifier = transaction_id || payout_id || `ipn_${Date.now()}`;
    const { data: existingTx } = await supabaseAdmin
      .from('transactions')
      .select('id')
      .eq('tx_hash', txIdentifier)
      .eq('type', 'deposit')
      .single();

    if (existingTx) {
      console.log('Transaction already processed:', txIdentifier);
      return new Response('OK - Already processed', { headers: corsHeaders });
    }

    // Process the deposit
    // 1. Add balance to user
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('User profile not found:', profileError?.message);
      return new Response('OK - Profile not found', { headers: corsHeaders });
    }

    const newBalance = (profile.balance || 0) + amountInDoge;

    // 2. Update balance
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update balance:', updateError.message);
      return new Response('Error updating balance', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    // 3. Create transaction record
    const { error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'deposit',
        amount: amountInDoge,
        status: 'completed',
        tx_hash: txIdentifier,
        notes: `Auto-deposit via FaucetPay IPN`,
      });

    if (txError) {
      console.error('Failed to create transaction:', txError.message);
    }

    // 4. Update any pending deposit with matching code
    if (custom) {
      await supabaseAdmin
        .from('deposits')
        .update({ 
          status: 'completed',
          verified_at: new Date().toISOString()
        })
        .eq('verification_code', custom)
        .eq('status', 'pending');
    }

    // 5. Create notification
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'deposit',
        title: 'Deposit Received!',
        message: `Your deposit of ${amountInDoge.toFixed(4)} DOGE has been credited to your account.`,
        data: { amount: amountInDoge, tx_hash: txIdentifier }
      });

    console.log(`Successfully processed deposit of ${amountInDoge} DOGE for user ${userId}`);

    return new Response('OK', { headers: corsHeaders });

  } catch (error) {
    console.error('IPN processing error:', error);
    return new Response('Internal error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
