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
    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { action, amount, tx_hash, user_id, user_email, status } = body;

    // Handle user notification (from admin approval/rejection)
    if (action === 'notify_user') {
      console.log('Notifying user about deposit status:', { user_id, amount, status });
      
      const notification = {
        user_id: user_id,
        type: 'deposit',
        title: status === 'approved' ? '✅ Depósito aprobado' : '❌ Depósito rechazado',
        message: status === 'approved' 
          ? `Tu depósito de ${amount} DOGE ha sido acreditado a tu cuenta.`
          : `Tu depósito de ${amount} DOGE fue rechazado. Contacta soporte si crees que es un error.`,
        data: { amount, status }
      };

      const { error: notifyError } = await supabaseAdmin
        .from('notifications')
        .insert([notification]);

      if (notifyError) {
        console.error('Error notifying user:', notifyError);
        throw notifyError;
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Default: notify admins about new deposit
    console.log('Creating admin notification for deposit:', { amount, tx_hash, user_id });

    // Get all admin user IDs
    const { data: adminRoles, error: adminError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (adminError) {
      console.error('Error fetching admins:', adminError);
      throw adminError;
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.log('No admins found to notify');
      return new Response(JSON.stringify({ success: true, message: 'No admins to notify' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create notifications for all admins
    const notifications = adminRoles.map(admin => ({
      user_id: admin.user_id,
      type: 'admin_deposit',
      title: '💰 Nuevo depósito pendiente',
      message: `Usuario ${user_email || user_id} reportó depósito de ${amount} DOGE. TX: ${tx_hash?.slice(0, 20) || 'N/A'}...`,
      data: {
        deposit_amount: amount,
        tx_hash: tx_hash,
        reporter_id: user_id,
        reporter_email: user_email
      }
    }));

    const { error: notifyError } = await supabaseAdmin
      .from('notifications')
      .insert(notifications);

    if (notifyError) {
      console.error('Error creating notifications:', notifyError);
      throw notifyError;
    }

    console.log(`Created ${notifications.length} admin notifications`);

    return new Response(JSON.stringify({ 
      success: true, 
      notified_admins: adminRoles.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Notify admin error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
