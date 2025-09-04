// app/api/unsubscribe-notify/route.ts
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: 'Digital ID <onboarding@trydigitalid.com>',
      to: ['mp@accessgrid.com'],
      subject: '${email} has Unsubscribed',
      text: `The following user has unsubscribed: ${email}`,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}