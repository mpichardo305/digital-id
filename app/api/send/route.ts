// app/api/send/route.ts
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';
import WelcomeEmail from '../../../components/email/welcome-email';
import IncompleteProfileEmail from '../../../components/email/incomplete-profile';
import VerifyEmailAndReturn from '../../../components/email/verify-email-and-return'
import type { ReactElement } from 'react';

const resend = new Resend(process.env.RESEND_API_KEY!);

type TemplateKey = 'welcome' | 'verify' | 'digital_id_validated' | 'profile_completed' | 'complete_profile';

interface EmailTemplateProps {
  firstName?: string;
  email?: string;
  url?: string;
  digitalId?: string;
  onboarding_step?: string;
  completeProfileUrl?: string;
}

const templates: Record<TemplateKey, { 
  subject: string; 
  component: (props: EmailTemplateProps) => ReactElement 
}> = {
  welcome: {
    subject: 'Welcome to Digital ID',
    component: WelcomeEmail as any,
  },
  verify: {
    subject: 'Verify your Digital ID email',
    component: VerifyEmailAndReturn as any,
  },
  digital_id_validated: {
    subject: 'Your Digital ID has been verified',
    component: WelcomeEmail as any, // You might want to create a specific component for this
  },
  profile_completed: {
    subject: 'Your Digital ID profile is complete!',
    component: WelcomeEmail as any, // You might want to create a specific component for this
  },
  complete_profile: {
    subject: 'Your Digital ID profile is incomplete!',
    component: IncompleteProfileEmail as any, // You might want to create a specific component for this
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      template = 'welcome', 
      email, 
      userId,
      firstName,
      verificationToken,
      digitalId,
      onboarding_step,
      completeProfileUrl,
      metadata = {}
    } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const templateKey = template as TemplateKey;
    const entry = templates[templateKey];
    
    if (!entry) {
      return NextResponse.json({ error: 'Invalid template' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Handle verification email
    let url = '';
    if (templateKey === 'verify') {
      // Generate verification token if not provided
      let token = verificationToken;
      
      if (!token) {
        // Create verification record
        const { data: verification, error } = await supabase
          .from('email_verifications')
          .insert({
            email,            
            expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
            used: false,
            ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
            user_agent: req.headers.get('user-agent'),
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating verification:', error);
          return NextResponse.json({ error: 'Failed to create verification' }, { status: 500 });
        }
        
        token = verification.token;
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`;
      url = `${baseUrl}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
    }

    // Fetch additional user data if needed
    let userFirstName = firstName;
    if (!userFirstName && userId) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('first_name')
        .eq('user_id', userId)
        .single();
      
      userFirstName = profile?.first_name;
    }

    // Prepare props for email component
    const emailProps: EmailTemplateProps = {
      firstName: userFirstName || 'there',
      email,
      url,
      digitalId,
      onboarding_step,
      completeProfileUrl,
      ...metadata,
    };

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Digital ID <onboarding@updates.trydigitalid.com>',
      to: [email],
      subject: entry.subject,
      react: entry.component(emailProps),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error }, { status: 500 } satisfies ResponseInit);
    }

    // Log email sent (optional)
    if (userId) {
      await supabase
        .from('email_logs')
        .insert({
          user_id: userId,
          template: templateKey,
          sent_to: email,
          sent_at: new Date().toISOString(),
          resend_id: data?.id,
          metadata,
        });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      ...(url && { url }) // Include URL in response for testing
    });
    
  } catch (error) {
    console.error('Error in send route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Optional: GET endpoint for testing
export async function GET(req: Request) {
  return NextResponse.json({ 
    status: 'Email service is running',
    templates: Object.keys(templates),
  });
}