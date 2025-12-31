import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find characters expiring in the next 3 days that haven't been notified yet
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const now = new Date();

    const { data: expiringCharacters, error: fetchError } = await supabase
      .from("user_characters")
      .select("id, user_id, character_name, character_rarity, mining_expires_at")
      .gt("mining_expires_at", now.toISOString())
      .lte("mining_expires_at", threeDaysFromNow.toISOString());

    if (fetchError) {
      console.error("Error fetching expiring characters:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiringCharacters?.length || 0} characters expiring soon`);

    let notificationsSent = 0;

    for (const character of expiringCharacters || []) {
      // Check if we already sent a notification for this character
      const { data: existingNotification } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", character.user_id)
        .eq("type", "character_expiring")
        .contains("data", { character_id: character.id })
        .single();

      if (existingNotification) {
        console.log(`Notification already sent for character ${character.id}`);
        continue;
      }

      // Calculate days remaining
      const expiresAt = new Date(character.mining_expires_at);
      const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Create notification
      const { error: notifyError } = await supabase
        .from("notifications")
        .insert({
          user_id: character.user_id,
          type: "character_expiring",
          title: "¡Personaje por expirar!",
          message: `Tu ${character.character_name} (${character.character_rarity}) dejará de minar en ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''}. ¡Renuévalo para seguir ganando!`,
          data: {
            character_id: character.id,
            character_name: character.character_name,
            character_rarity: character.character_rarity,
            expires_at: character.mining_expires_at,
          },
        });

      if (notifyError) {
        console.error(`Error creating notification for character ${character.id}:`, notifyError);
      } else {
        notificationsSent++;
        console.log(`Notification sent for character ${character.id}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${expiringCharacters?.length || 0} expiring characters, sent ${notificationsSent} notifications` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in check-expiring-characters:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
