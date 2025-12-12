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
    // Verify JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Authentication required' 
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
        message: 'Invalid token' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { deposit_id } = await req.json();
    console.log(`Verifying deposit ${deposit_id} for user ${user.id}`);

    if (!deposit_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Deposit ID required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get deposit info
    const { data: deposit, error: depositError } = await supabaseAdmin
      .from('deposits')
      .select('*')
      .eq('id', deposit_id)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (depositError || !deposit) {
      console.error('Deposit not found:', depositError?.message);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Deposit not found or already processed' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if expired
    if (new Date(deposit.expires_at) < new Date()) {
      await supabaseAdmin
        .from('deposits')
        .update({ status: 'expired' })
        .eq('id', deposit_id);
      
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Deposit request has expired' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Auto-approve deposit (like pepeminer)
    // Complete the deposit immediately when user clicks verify
    console.log(`Auto-completing deposit for ${deposit.amount} DOGE`);
    
    const { data: result, error: completeError } = await supabaseAdmin.rpc('complete_deposit', {
      p_deposit_id: deposit_id,
      p_tx_hash: `manual_${Date.now()}`
    });

    if (completeError) {
      console.error('Complete deposit error:', completeError.message);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Failed to process deposit' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const depositResult = result as { success: boolean; error?: string; new_balance?: number; amount?: number };

    if (!depositResult?.success) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: depositResult?.error || 'Deposit verification failed' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create notification
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'deposit',
        title: '¡Depósito recibido!',
        message: `Se acreditaron ${deposit.amount} DOGE a tu cuenta.`,
        data: { amount: deposit.amount }
      });

    console.log(`Deposit ${deposit_id} completed successfully! New balance: ${depositResult.new_balance}`);

    return new Response(JSON.stringify({
      success: true,
      message: '¡Depósito verificado y acreditado!',
      amount: depositResult.amount,
      new_balance: depositResult.new_balance
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Verify deposit error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Internal error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
