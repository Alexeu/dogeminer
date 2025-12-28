import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "Alexeu@hormail.es";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface DepositEmailRequest {
  user_id: string;
  user_email: string;
  amount: number;
  created_at: string;
  deposit_id: string;
  verification_code: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, user_email, amount, created_at, deposit_id, verification_code }: DepositEmailRequest = await req.json();

    console.log("Sending deposit notification email to admin:", ADMIN_EMAIL);
    console.log("Deposit details:", { user_id, user_email, amount, created_at, deposit_id });

    const formattedDate = new Date(created_at).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Madrid'
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f7931a, #ffb347); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .info-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee; }
          .info-row:last-child { border-bottom: none; }
          .label { color: #666; font-weight: bold; }
          .value { color: #333; }
          .amount { font-size: 32px; color: #f7931a; font-weight: bold; text-align: center; padding: 20px; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Nuevo Depósito Pendiente</h1>
          </div>
          <div class="content">
            <div class="amount">${amount} DOGE</div>
            
            <div class="info-row">
              <span class="label">📧 Email del usuario:</span>
              <span class="value">${user_email || 'No disponible'}</span>
            </div>
            
            <div class="info-row">
              <span class="label">🆔 ID de Usuario:</span>
              <span class="value">${user_id}</span>
            </div>
            
            <div class="info-row">
              <span class="label">🔑 Código de verificación:</span>
              <span class="value">${verification_code}</span>
            </div>
            
            <div class="info-row">
              <span class="label">📅 Fecha:</span>
              <span class="value">${formattedDate}</span>
            </div>
            
            <div class="info-row">
              <span class="label">🎫 ID del Depósito:</span>
              <span class="value">${deposit_id}</span>
            </div>
          </div>
          <div class="footer">
            Este es un mensaje automático del sistema DogeMiner.
            <br>Por favor, revisa el panel de administración para aprobar o rechazar este depósito.
          </div>
        </div>
      </body>
      </html>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "DogeMiner <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `🪙 Nuevo depósito pendiente - ${amount} DOGE`,
        html: emailHtml,
      }),
    });

    const result = await response.json();
    console.log("Email response:", result);

    if (!response.ok) {
      throw new Error(result.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending deposit email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
