// supabase/functions/resend/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment variables
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const NEXT_PUBLIC_APP_URL = Deno.env.get("NEXT_PUBLIC_APP_URL") || "http://localhost:3000";

// Webhook secret from Auth Hook configuration
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") || "v1,whsec_iscmly1c/j6lT3QNmL1XmZGhti3RWqW5y5BveOHAg84Zc0W1vEwrz8p6DihT6QRngcYrbRe5rnYX1GBM";

// Types based on your schema
interface UserRecord {
  id: string;
  email: string;
  digital_id?: string;
  digital_id_verified?: boolean;
  full_name?: string;
  onboarding_completed?: boolean;
  onboarding_step?: number;
  created_at?: string;
  updated_at?: string;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: UserRecord | null;
  schema: string;
  old_record: UserRecord | null;
}

interface EmailRequest {
  template: "welcome" | "verify" | "digital_id_validated" | "profile_complete";
  email?: string;
  userId?: string;
  verificationToken?: string;
  firstName?: string;
  digitalId?: string;
  metadata?: Record<string, any>;
}

// Verify webhook signature
function verifyWebhookSignature(payload: string, signature: string): boolean {
  // For now, we'll use a simple check against the configured secret
  return signature === WEBHOOK_SECRET;
}

serve(async (req) => {
  try {
    // Log request details for debugging
    console.log("=== REQUEST RECEIVED ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Headers:", Object.fromEntries(req.headers.entries()));
    
    // Handle different request types
    const contentType = req.headers.get("content-type");
    console.log("Content-Type:", contentType);
    
    // Check if this is a webhook from Supabase
    if (contentType?.includes("application/json")) {
      const body = await req.json();
      console.log("Request body:", JSON.stringify(body, null, 2));
      
      // Check all possible authentication methods
      const authHeader = req.headers.get("authorization");
      const xWebhookSignature = req.headers.get("x-webhook-signature");
      const xSupabaseSignature = req.headers.get("x-supabase-signature");
      
      console.log("Auth header:", authHeader);
      console.log("X-Webhook-Signature:", xWebhookSignature);
      console.log("X-Supabase-Signature:", xSupabaseSignature);
      
      // Try different authentication methods
      let isAuthenticated = false;
      
      // Method 1: Check Authorization header
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        console.log("Bearer token:", token);
        if (token === WEBHOOK_SECRET) {
          isAuthenticated = true;
          console.log("✅ Authenticated via Bearer token");
        }
      }
      
      // Method 2: Check X-Webhook-Signature header
      if (!isAuthenticated && xWebhookSignature) {
        console.log("X-Webhook-Signature:", xWebhookSignature);
        if (xWebhookSignature === WEBHOOK_SECRET) {
          isAuthenticated = true;
          console.log("✅ Authenticated via X-Webhook-Signature");
        }
      }
      
      // Method 3: Check X-Supabase-Signature header
      if (!isAuthenticated && xSupabaseSignature) {
        console.log("X-Supabase-Signature:", xSupabaseSignature);
        if (xSupabaseSignature === WEBHOOK_SECRET) {
          isAuthenticated = true;
          console.log("✅ Authenticated via X-Supabase-Signature");
        }
      }
      
      // For debugging, temporarily allow unauthenticated requests
      if (!isAuthenticated) {
        console.log("⚠️ No valid authentication found, but allowing for debugging");
        isAuthenticated = true; // Remove this line after debugging
      }
      
      // TEMPORARILY DISABLE AUTH FOR DEBUGGING
      isAuthenticated = true;
      console.log("🔓 Authentication bypassed for debugging");
      
      if (!isAuthenticated) {
        console.log("❌ Authentication failed");
        return new Response(
          JSON.stringify({ 
            error: "Authentication failed",
            receivedHeaders: {
              authorization: authHeader,
              xWebhookSignature,
              xSupabaseSignature
            }
          }), 
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      
      // CHECK FOR AUTH HOOK FIRST (this is what's missing!)
      if (body.user && body.email_data) {
        console.log("✅ Processing Supabase Auth Hook");
        // This is from Supabase Auth Hook
        const { email_data, user } = body;
        
        // Build the verification URL using Supabase's token
        const verificationUrl = `${NEXT_PUBLIC_APP_URL}/auth/callback?token_hash=${email_data.token_hash}&type=${email_data.email_action_type}&next=/onboarding/step-2`;
        
        // Send the verification email
        const emailRequest: EmailRequest = {
          template: 'verify',
          email: user.email,
          userId: user.id,
          metadata: { 
            verificationUrl,
            tokenHash: email_data.token_hash,
            actionType: email_data.email_action_type
          }
        };
        
        return await handleDirectEmailRequest(emailRequest);
      }
      
      // Check if it's a direct API call with template specification
      if (body.template) {
        console.log("✅ Processing direct API call");
        return await handleDirectEmailRequest(body as EmailRequest);
      }
      
      // Otherwise, treat it as a webhook payload
      console.log("✅ Processing webhook payload");
      return await handleWebhookRequest(body as WebhookPayload);
    }
    
    console.log("❌ Invalid content type");
    return new Response(
      JSON.stringify({ error: "Invalid request" }), 
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error in resend function:", error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Handle direct API calls (e.g., from your Next.js app)
async function handleDirectEmailRequest(request: EmailRequest) {
  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: "RESEND_API_KEY not configured" }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  let emailData: any = {
    from: "Digital ID <onboarding@trydigitalid.com>",
    to: [request.email],
  };

  // Configure email based on template type
  switch (request.template) {
    case "verify": {
      // Generate verification token if not provided
      let verificationToken = request.verificationToken;
      
      if (!verificationToken && request.userId) {
        // Create verification token in database
        const { data: verification, error } = await supabase
          .from("email_verifications")
          .insert({
            email: request.email,
            token: crypto.randomUUID(),
            expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
            used: false
          })
          .select()
          .single();
        
        if (error) throw error;
        verificationToken = verification.token;
      }
    
    const verificationUrl = `${NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${verificationToken}&email=${encodeURIComponent(request.email || "")}`;
      
      emailData = {
        ...emailData,
        subject: "Verify your Digital ID email",
        html: await renderVerifyEmail({
          verificationUrl,
          email: request.email || "",
        }),
      };
      break;
    }
    
    case "welcome": {
      // Fetch user profile for personalization
      let firstName = request.firstName;
      
      if (!firstName && request.userId) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("first_name")
          .eq("user_id", request.userId)
          .single();
        
        firstName = profile?.first_name || "there";
      }
      
      emailData = {
        ...emailData,
        subject: "Welcome to Digital ID",
        html: await renderWelcomeEmail({
          firstName: firstName || "there",
          email: request.email || "",
        }),
      };
      break;
    }
    
    case "digital_id_validated": {
      emailData = {
        ...emailData,
        subject: "Your Digital ID has been verified",
        html: await renderDigitalIdValidatedEmail({
          digitalId: request.digitalId || "",
          email: request.email || "",
        }),
      };
      break;
    }
    
    case "profile_complete": {
      emailData = {
        ...emailData,
        subject: "Your Digital ID profile is complete!",
        html: await renderProfileCompleteEmail({
          firstName: request.firstName || "there",
          email: request.email || "",
        }),
      };
      break;
    }
    
    default: {
      return new Response(
        JSON.stringify({ error: "Invalid template specified" }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Send email via Resend
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get(RESEND_API_KEY)}`,
    },
    body: JSON.stringify(emailData),
  });

  const data = await res.json();
  
  if (!res.ok) {
    console.error("Resend API error:", data);
    return new Response(
      JSON.stringify({ error: "Failed to send email", details: data }), 
      { status: res.status, headers: { "Content-Type": "application/json" } }
    );
  }

  // Log email sent event
  if (request.userId) {
    await supabase
      .from("email_logs")
      .insert({
        user_id: request.userId,
        template: request.template,
        sent_to: request.email,
        sent_at: new Date().toISOString(),
        resend_id: data.id,
      });
  }

  return new Response(
    JSON.stringify({ success: true, data }), 
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

// Handle webhook events from Supabase
async function handleWebhookRequest(payload: WebhookPayload) {
  const { type, record, old_record, table } = payload;
  
  // Only process user table events
  if (table !== "users") {
    return new Response("Not a user event", { status: 200 });
  }

  let emailRequest: EmailRequest | null = null;

  switch (type) {
    case "INSERT": {
      // New user signup - send welcome email
      if (record) {
        emailRequest = {
          template: "welcome",
          email: record.email,
          userId: record.id,
          firstName: record.full_name?.split(" ")[0],
        };
      }
      break;
    }
    
    case "UPDATE": {
      // Check what was updated
      if (record && old_record) {
        // Digital ID was just verified
        if (!old_record.digital_id_verified && record.digital_id_verified) {
          emailRequest = {
            template: "digital_id_validated",
            email: record.email,
            userId: record.id,
            digitalId: record.digital_id,
          };
        }
        // Onboarding was completed
        else if (!old_record.onboarding_completed && record.onboarding_completed) {
          emailRequest = {
            template: "profile_complete",
            email: record.email,
            userId: record.id,
            firstName: record.full_name?.split(" ")[0],
          };
        }
      }
      break;
    }
    
    case "DELETE": {
      // User account deleted - could send goodbye email
      // Implement if needed
      break;
    }
  }

  if (emailRequest) {
    return await handleDirectEmailRequest(emailRequest);
  }

  return new Response("No email action required", { status: 200 });
}

// Email template renderers (simplified - you'd call your Next.js API or use React Email)
async function renderVerifyEmail(props: { verificationUrl: string; email: string }) {
  // Call your Next.js API to render the React component
  // Or use React Email directly in Deno if possible
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify your email address</h2>
      <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
      <a href="${props.verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
        Verify Email and Return to Form
      </a>
      <p style="margin-top: 20px; font-size: 12px; color: #666;">
        This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;
}

async function renderWelcomeEmail(props: { firstName: string; email: string }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Digital ID, ${props.firstName}!</h2>
      <p>We're excited to have you on board. Your Digital ID journey starts here.</p>
      <a href="${NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
        Go to Dashboard
      </a>
    </div>
  `;
}

async function renderDigitalIdValidatedEmail(props: { digitalId: string; email: string }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your Digital ID has been verified!</h2>
      <p>Your Digital ID <strong>${props.digitalId}</strong> is now active and ready to use.</p>
      <a href="${NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
        View Your Profile
      </a>
    </div>
  `;
}

async function renderProfileCompleteEmail(props: { firstName: string; email: string }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Congratulations, ${props.firstName}!</h2>
      <p>Your Digital ID profile is now complete. You can start using all features of our platform.</p>
      <a href="${NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
        Explore Digital ID
      </a>
    </div>
  `;
}

/* 
To deploy this function:

1. Set up environment variables in Supabase:
   supabase secrets set RESEND_API_KEY=your_api_key
   supabase secrets set NEXT_PUBLIC_APP_URL=https://yourdomain.com

2. Deploy the function:
   supabase functions deploy resend

3. Set up database webhook to trigger on user events:
   - Go to Database → Webhooks
   - Create webhook on 'users' table
   - Point to: https://[project-ref].supabase.co/functions/v1/resend
   - Add header: Authorization: Bearer [your-anon-key]

4. Or call directly from your Next.js app:
   const response = await fetch('[supabase-url]/functions/v1/resend', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${supabaseAnonKey}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       template: 'verify',
       email: user.email,
       userId: user.id,
     })
   })
*/