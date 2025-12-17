import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const DEPOSIT_ADDRESS = "DFbsc22DdbvczjXJZfTu59Q7HdSFkeGUNv";

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

    const { tx_hash, expected_amount, user_id } = await req.json();
    console.log(`Verifying TX ${tx_hash} for user ${user_id}`);

    if (!tx_hash || !expected_amount || !user_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required parameters' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if this TX was already processed
    const { data: existingTx } = await supabaseAdmin
      .from('transactions')
      .select('id, status')
      .eq('tx_hash', tx_hash)
      .eq('status', 'completed')
      .maybeSingle();

    if (existingTx) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Transaction already processed' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify transaction on blockchain using dogechain.info API
    console.log(`Fetching TX from blockchain: ${tx_hash}`);
    const txResponse = await fetch(`https://dogechain.info/api/v1/transaction/${tx_hash}`);
    
    if (!txResponse.ok) {
      console.log(`TX not found on blockchain: ${txResponse.status}`);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Transaction not found on blockchain. Please check the TX hash.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const txData = await txResponse.json();
    console.log(`Blockchain response:`, JSON.stringify(txData).slice(0, 500));
    
    if (!txData.success || !txData.transaction) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid transaction data from blockchain' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tx = txData.transaction;

    // Check confirmations (require at least 1)
    if (!tx.confirmations || tx.confirmations < 1) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Transaction not confirmed yet. Confirmations: ${tx.confirmations || 0}. Please wait a few minutes.`,
        confirmations: tx.confirmations || 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find output to our deposit address
    let receivedAmount = 0;
    for (const output of tx.outputs || []) {
      if (output.address === DEPOSIT_ADDRESS) {
        receivedAmount += parseFloat(output.value);
      }
    }

    console.log(`Received amount to ${DEPOSIT_ADDRESS}: ${receivedAmount} DOGE`);

    if (receivedAmount <= 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `No payment found to deposit address ${DEPOSIT_ADDRESS}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify amount (allow small variance)
    if (receivedAmount < expected_amount * 0.95) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Amount mismatch. Expected ${expected_amount} DOGE, received ${receivedAmount} DOGE`,
        received: receivedAmount
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Transaction verified! Credit the user
    console.log(`TX verified! Crediting ${receivedAmount} DOGE to user ${user_id}`);

    // Update the transaction status
    await supabaseAdmin
      .from('transactions')
      .update({ 
        status: 'completed',
        amount: receivedAmount,
        notes: `Auto-verified. Confirmations: ${tx.confirmations}. Received: ${receivedAmount} DOGE`
      })
      .eq('tx_hash', tx_hash)
      .eq('user_id', user_id)
      .eq('status', 'pending');

    // Add balance to user using RPC for atomic update
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('internal_add_balance', {
      p_user_id: user_id,
      p_amount: receivedAmount
    });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to credit balance' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create notification for user
    await supabaseAdmin.from('notifications').insert({
      user_id: user_id,
      type: 'deposit_completed',
      title: '✅ ¡Depósito acreditado!',
      message: `Tu depósito de ${receivedAmount} DOGE ha sido verificado y acreditado. Much wow! 🐕`,
      data: {
        amount: receivedAmount,
        tx_hash: tx_hash,
        confirmations: tx.confirmations
      }
    });

    console.log(`Deposit completed successfully!`);

    return new Response(JSON.stringify({ 
      success: true, 
      credited_amount: receivedAmount,
      confirmations: tx.confirmations,
      message: 'Deposit verified and credited!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Verify deposit error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
