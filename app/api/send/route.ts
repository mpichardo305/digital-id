// app/api/send/route.ts
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import WelcomeEmail from '@/components/email/welcome-email';
import VerifyEmailAndReturn from '@/components/email/verify-email-and-return';
import type { ReactElement } from 'react';
type TemplateKey = 'welcome' | 'verify';

const templates: Record<TemplateKey, { subject: string; component: (props: { firstName: string }) => ReactElement }
> ={
welcome: {
    subject: 'Welcome to Digital ID',
    component: WelcomeEmail,
  },
  verify: {
    subject: 'Verify your Digital ID email',
    component: VerifyEmailAndReturn,
  },
};

export async function POST(req: Request) {
  const url = new URL(req.url);
  let key = (url.searchParams.get('template') || 'welcome') as TemplateKey;

  // also allow template in JSON body
  try {
    const body = await req.json().catch(() => null);
    if (body?.template) key = String(body.template).toLowerCase() as TemplateKey;
  } catch {}

  const entry = templates[key] ?? templates.welcome;

  const resend = new Resend(process.env.RESEND_API_KEY!);

  const { data, error } = await resend.emails.send({
    from: 'Digital ID <onboarding@resend.dev>',
    to: ['mpichardo305@gmail.com'],
    subject: entry.subject,
    // 👇 function-call style
    react: entry.component({ firstName: 'Michael' }),
  });

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}