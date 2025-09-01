import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') || '/onboarding/step-2'
  const my_token = requestUrl.searchParams.get('my_token');

  if (token_hash && type) {
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) => 
                  cookieStore.set(name, value, options)
                )
              } catch {
                // The `setAll` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
              }
            },
          },
        }
      )
      
      // Verify the email token
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as 'signup' | 'magiclink',
      })

      if (error) {
        console.error('OTP verification error:', error)
        // Redirect to error page
        return NextResponse.redirect(new URL('/?error=verification_failed', request.url))
      }
      
      // Email verified successfully! The session will be established automatically
      // We'll let the client-side handle any additional user data updates
      console.log('Auth callback: inside try block, about to get user');
      // Get the user from the session (assume always present after verification)
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Auth callback: got user', user);

      const email = user?.email;
      const userId = user?.id;
      const now = new Date().toISOString();

      // Create a row in users table
      await supabase
        .from('users')
        .upsert({
          id: userId,
          email: email,
          updated_at: now,
          onboarding_step: 2,
        })

      // Update email_verifications table
      await supabase
        .from('email_verifications')
        .update({
          used: true,
          used_at: now,
          email: email,
        })
        .eq('email', email);
        console.log('Auth callback: finished updates');

    } catch (error) {
      console.error('Auth callback error:', error)
      // Redirect to error page or back to signup
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
    }
  }

  // Redirect to the next step
  return NextResponse.redirect(new URL(next, request.url))
}