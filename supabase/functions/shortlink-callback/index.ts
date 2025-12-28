import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REWARD_AMOUNT = 0.01;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to identify the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the user's JWT
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ success: false, error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { provider, verificationToken, completedUrl } = await req.json();

    console.log(`Processing shortlink completion for user ${user.id}, provider: ${provider}`);

    // Verify basic completion data
    if (!verificationToken) {
      console.log("Missing verification token");
      return new Response(JSON.stringify({ success: false, error: "Token de verificación faltante" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate provider
    if (!["adfly", "eazyurl", "shrink"].includes(provider)) {
      console.log("Invalid provider:", provider);
      return new Response(JSON.stringify({ success: false, error: "Proveedor inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user has completed this shortlink TODAY (daily limit of 1 per shortlink)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: existingCompletion } = await supabase
      .from("shortlink_completions")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider", provider)
      .gte("completed_at", today.toISOString())
      .maybeSingle();

    if (existingCompletion) {
      console.log("User already completed this shortlink today");
      return new Response(
        JSON.stringify({ success: false, error: "Ya has completado este shortlink hoy. Vuelve mañana." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("Verification passed for provider:", provider);

    // Insert completion record directly
    const { error: insertError } = await supabase.from("shortlink_completions").insert({
      user_id: user.id,
      provider: provider,
      reward_amount: REWARD_AMOUNT,
    });

    if (insertError) {
      console.error("Error inserting completion:", insertError);
      return new Response(JSON.stringify({ success: false, error: "Error al registrar completado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Add reward to mining balance using service role
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        mining_balance: supabase.rpc("internal_add_mining_balance", { amount: REWARD_AMOUNT }),
      })
      .eq("id", user.id);

    // Use raw SQL update for adding to mining balance
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("mining_balance, total_earned")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return new Response(JSON.stringify({ success: false, error: "Error al obtener perfil" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newMiningBalance = (profile.mining_balance || 0) + REWARD_AMOUNT;
    const newTotalEarned = (profile.total_earned || 0) + REWARD_AMOUNT;

    const { error: balanceError } = await supabase
      .from("profiles")
      .update({
        mining_balance: newMiningBalance,
        total_earned: newTotalEarned,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (balanceError) {
      console.error("Error updating balance:", balanceError);
      return new Response(JSON.stringify({ success: false, error: "Error al actualizar balance" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Shortlink completed successfully for user:", user.id, "reward:", REWARD_AMOUNT);

    return new Response(JSON.stringify({ success: true, reward: REWARD_AMOUNT, new_balance: newMiningBalance }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
