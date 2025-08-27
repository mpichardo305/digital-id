import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ 
        error: 'Authentication error', 
        redirectTo: '/#signup' 
      }, { status: 401 });
    }
    
    if (!session?.user) {
      console.log('No active session found');
      return NextResponse.json({ 
        message: 'Not authenticated', 
        redirectTo: '/#signup' 
      }, { status: 200 });
    }
    
    // Get the user's onboarding status
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, onboarding_step, onboarding_completed')
      .eq('id', session.user.id)
      .single();
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json({ 
        error: 'Failed to fetch user data', 
        redirectTo: '/#signup' 
      }, { status: 500 });
    }
    
    if (!userData) {
      console.log('User not found in database');
      return NextResponse.json({ 
        message: 'User not found', 
        redirectTo: '/onboarding/step-2' 
      }, { status: 200 });
    }
    
    // Determine redirect based on onboarding step
    let redirectTo = '';
    
    if (userData.onboarding_completed) {
      redirectTo = '/';
    } else {
      switch (userData.onboarding_step) {
        case 0:
        case 1:
          redirectTo = '/onboarding/step-2';
          break;
        case 2:
          redirectTo = '/onboarding/step-3';
          break;
        case 3:
          redirectTo = '/onboarding/step-3';
          break;
        default:
          redirectTo = '/onboarding/step-2';
      }
    }
    
    return NextResponse.json({ 
      message: 'Status checked successfully', 
      userData: {
        email: userData.email,
        onboardingStep: userData.onboarding_step,
        onboardingCompleted: userData.onboarding_completed
      }, 
      redirectTo 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      redirectTo: '/#signup' 
    }, { status: 500 });
  }
}
