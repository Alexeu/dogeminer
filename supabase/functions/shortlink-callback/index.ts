import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REWARD_AMOUNT = 0.055;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to identify the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user's JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { provider, verificationToken } = await req.json();
    
    console.log(`Processing shortlink completion for user ${user.id}, provider: ${provider}`);

    // Verify the token based on provider
    let isValid = false;
    
    if (provider === 'adfly') {
      const adflyApiKey = Deno.env.get('ADFLY_API_KEY');
      // Adfly verification - in production you'd verify the callback token
      // For now, we trust the client-side completion
      isValid = !!verificationToken && !!adflyApiKey;
      console.log('Adfly verification:', isValid);
    } else if (provider === 'earnnow') {
      const earnnowApiKey = Deno.env.get('EARNNOW_API_KEY');
      // Earnnow verification
      isValid = !!verificationToken && !!earnnowApiKey;
      console.log('Earnnow verification:', isValid);
    }

    if (!isValid) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid verification' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already completed this shortlink today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: existingCompletion } = await supabase
      .from('shortlink_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .gte('completed_at', today.toISOString())
      .maybeSingle();

    if (existingCompletion) {
      return new Response(
        JSON.stringify({ success: false, error: 'Already completed this shortlink today' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Complete the shortlink and add reward using the database function
    const { data: result, error } = await supabase.rpc('complete_shortlink', {
      p_provider: provider,
      p_reward: REWARD_AMOUNT
    });

    if (error) {
      console.error('Error completing shortlink:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to complete shortlink' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Shortlink completed successfully:', result);

    return new Response(
      JSON.stringify({ success: true, reward: REWARD_AMOUNT }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
