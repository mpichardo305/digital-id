import { NextResponse } from 'next/server';
import { getOnboardingEmailUrl } from '../../../lib/utils.ts';
import { createClient } from '../../../utils/supabase/server.ts';
import process from "node:process"; // or your supabase server util

export async function POST(req: Request) {
  const supabase = await createClient();
  const { email } = await req.json();

  // 1. Check if user exists by email
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email, onboarding_step')
    .eq('email', email)
    .maybeSingle();

  // 2. Handle DB error
  if (userError) {
    console.error('Error fetching user data:', userError);
    return NextResponse.json({
      error: 'Failed to fetch user data',
      redirectTo: '/#signup'
    }, { status: 500 });
  }

  // 3. If user does not exist, mimic home page signup flow
  if (!userData) {
    const token_hash = crypto.randomUUID();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Insert into email_verifications
    await supabase
      .from('email_verifications')
      .insert({
        email,
        token_hash,
        expires_at: expiresAt,
        used: false,
        created_at: now,
      });

    // Insert into users table
    await supabase
      .from('users')
      .insert({
        email,
        onboarding_step: 1,
        created_at: now,
      });

    // Generate the verification URL
    const { url: redirectTo } = getOnboardingEmailUrl({
      onboarding_step: 1,
      token_hash,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    });

    return NextResponse.json({
      message: 'User not found, verification required',
      redirectTo,
    }, { status: 200 });
  }

  // 4. User exists, handle accordingly (e.g., return onboarding status or next step)
  // You can use getOnboardingEmailUrl here as well if you want to redirect existing users
  const token_hash = crypto.randomUUID();
  const { url: redirectTo } = getOnboardingEmailUrl({
    onboarding_step: userData.onboarding_step,
    token_hash,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  });

  return NextResponse.json({
    message: 'User found',
    redirectTo,
    onboarding_step: userData.onboarding_step,
  }, { status: 200 });
}
