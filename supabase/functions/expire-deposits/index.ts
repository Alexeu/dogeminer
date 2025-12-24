import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting deposit expiration check...');

    // Find all pending deposits that have expired
    const { data: expiredDeposits, error: fetchError } = await supabase
      .from('deposits')
      .select('id, user_id, amount, verification_code')
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching expired deposits:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredDeposits?.length || 0} expired deposits`);

    if (!expiredDeposits || expiredDeposits.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No expired deposits found',
          expired_count: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark all expired deposits
    const expiredIds = expiredDeposits.map(d => d.id);
    
    const { error: updateError } = await supabase
      .from('deposits')
      .update({ status: 'expired' })
      .in('id', expiredIds);

    if (updateError) {
      console.error('Error updating expired deposits:', updateError);
      throw updateError;
    }

    console.log(`Successfully marked ${expiredIds.length} deposits as expired`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Marked ${expiredIds.length} deposits as expired`,
        expired_count: expiredIds.length,
        expired_ids: expiredIds
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in expire-deposits function:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
