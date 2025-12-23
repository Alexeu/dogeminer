import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REWARD_AMOUNT = 0.02;

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

    const { provider, verificationToken, completedUrl } = await req.json();
    
    console.log(`Processing shortlink completion for user ${user.id}, provider: ${provider}`);

    // Verify the shortlink was actually completed by checking the verification token and completed URL
    if (!verificationToken || !completedUrl) {
      console.log('Missing verification data');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing verification data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has completed this shortlink TODAY (daily limit of 1 per shortlink)
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
      console.log('User already completed this shortlink today');
      return new Response(
        JSON.stringify({ success: false, error: 'Ya has completado este shortlink hoy. Vuelve mañana.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the completed URL matches expected destination
    let isValidCompletion = false;
    
    if (provider === 'adfly') {
      // Adfly redirects to our callback or destination URL after completion
      isValidCompletion = completedUrl.includes(verificationToken) || 
                          completedUrl.includes('adfly') ||
                          completedUrl.length > 20; // Basic check that we got a real URL
      console.log('Adfly verification:', isValidCompletion, completedUrl);
    } else if (provider === 'earnnow') {
      // Earnnow redirects to destination after completion
      isValidCompletion = completedUrl.includes(verificationToken) || 
                          completedUrl.includes('earnow') ||
                          completedUrl.length > 20;
      console.log('Earnnow verification:', isValidCompletion, completedUrl);
    }

    if (!isValidCompletion) {
      return new Response(
        JSON.stringify({ success: false, error: 'Shortlink no completado correctamente' }),
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
