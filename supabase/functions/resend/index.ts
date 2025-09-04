// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore
import { render } from "https://esm.sh/@react-email/render@0.0.12";
// @ts-ignore
import VerifyEmailAndReturn from "../../../components/email/verify-email-and-return.tsx";
// @ts-ignore
import IncompleteProfileEmail from "../../../components/email/incomplete-profile.tsx";
// @ts-ignore
import { getOnboardingEmailUrl } from "../../../lib/utils.ts";
// Environment variables
const RESEND_API_KEY = (globalThis as any).Deno?.env?.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = (globalThis as any).Deno?.env?.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = (globalThis as any).Deno?.env?.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const APP_URL = (globalThis as any).Deno?.env?.get("NEXT_PUBLIC_APP_URL") ?? "http://trydigitalid.com";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
serve(async (req) => {
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
      const { user, email_data, type = "verify", onboarding_step = 1 } = body;

      const token_hash = email_data.token_hash;
      const { url } = getOnboardingEmailUrl({ onboarding_step, token_hash, appUrl: APP_URL });

      console.log(`Sending ${type} email to ${user.email} with URL: ${url}`);

      let emailHtml;
      if (type === "complete_profile") {
        emailHtml = await render(IncompleteProfileEmail({
          firstName: user.firstName,
          url,
          supportEmail: "contact@trydigitalid.com",
        }));
      } else {
        // Default to verify
        emailHtml = await render(VerifyEmailAndReturn({
          firstName: user.firstName,
          url,
          supportEmail: "contact@trydigitalid.com",
        }));
      }
      console.log("emailHtml type:", typeof emailHtml);
      console.log("emailHtml value:", emailHtml);

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
            subject: (() => {
              switch (type) {
                case "complete_profile":
                  return "Complete your Digital ID profile";
                // Add more cases here as you add more types
                case "verify":
                default:
                  return "Verify your Digital ID email";
              }
            })(),
            html: emailHtml, // <-- dynamic template
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
              template: type,
              sent_to: user.email,
              sent_at: new Date().toISOString(),
              resend_id: (data as any).id,
            });
        } catch (logError) {
          // Don't fail if we can't log the email
          console.error("Failed to log email:", logError);
        }
        
        return new Response(
          JSON.stringify({ success: true, message: `${type} email sent successfully` }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        return new Response(
          JSON.stringify({ error: `Failed to send ${type} email`,  details: emailError instanceof Error ? emailError.message : String(emailError), }),
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
      JSON.stringify({ error: "Internal server error",  details: error instanceof Error ? error.message : String(error), }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});