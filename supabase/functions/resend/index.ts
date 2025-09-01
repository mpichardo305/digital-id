import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment variables
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const APP_URL = Deno.env.get("NEXT_PUBLIC_APP_URL") ?? "http://trydigitalid.com";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
serve(async (req) => {
  // --- AUTHORIZATION CHECK (must be inside the handler) ---
  const authz = req.headers.get("authorization") ?? "";
  if (authz !== `Bearer ${Deno.env.get("SEND_EMAIL_HOOK_SECRET")}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  // --- END AUTHORIZATION CHECK ---

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const body = await req.json();
    
    // Log the request for debugging
    console.log("Received webhook:", JSON.stringify(body, null, 2));
    
    // Check if this is an auth webhook with user and email_data
    if (body.user && body.email_data) {
      const { user, email_data } = body;
      
      // Build the verification URL using the token from Supabase
      const verificationUrl = `${APP_URL}/auth/callback?token_hash=${email_data.token_hash}&type=${email_data.email_action_type}&next=/onboarding/step-2`;
      
      console.log(`Sending verification email to ${user.email} with URL: ${verificationUrl}`);
      
      // Send email directly using Resend API with fetch
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: "Digital ID <onboarding@updates.trydigitalid.com>",
            to: [user.email],
            subject: "Verify your Digital ID email",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Verify your email address</h2>
                <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
                <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
                  Verify Email and Return to Form
                </a>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">
                  This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
                </p>
              </div>
            `
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error("Resend API error:", data);
          throw new Error(`Resend API error: ${JSON.stringify(data)}`);
        }
        
        console.log("✅ Email sent successfully:", data);
        
        // Log the email in Supabase if needed
        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
          await supabase
            .from("email_logs")
            .insert({
              user_id: user.id,
              template: "verify",
              sent_to: user.email,
              sent_at: new Date().toISOString(),
              resend_id: data.id,
            });
        } catch (logError) {
          // Don't fail if we can't log the email
          console.error("Failed to log email:", logError);
        }
        
        return new Response(
          JSON.stringify({ success: true, message: "Verification email sent successfully" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        return new Response(
          JSON.stringify({ error: "Failed to send verification email", details: emailError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // If we get here, it's not an auth webhook we recognize
    console.log("Received webhook but it was not a recognized auth event");
    return new Response(
      JSON.stringify({ success: true, message: "Webhook received but no action taken" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});