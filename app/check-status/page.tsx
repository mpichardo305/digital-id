import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function CheckStatusPage() {
  const supabase = await createClient();

  // Get the current user's session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    redirect('/#signup');
  }

  // Get the user's onboarding status
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, onboarding_step, onboarding_completed')
    .eq('id', session.user.id)
    .single();

  if (userError || !userData) {
    redirect('/onboarding/step-2');
  }

  // Determine redirect based on onboarding step
  if (userData.onboarding_completed) {
    redirect('/');
  }

  switch (userData.onboarding_step) {
    case 0:
    case 1:
      redirect('/onboarding/step-2');
    case 2:
      redirect('/onboarding/step-3');
    case 3:
      redirect('/onboarding/step-3');
    default:
      redirect('/onboarding/step-2');
  }

  // Fallback (should never be reached)
  return null;
}
