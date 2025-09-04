import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define your redirects map
// Format: 'source-path': 'destination-path'
const redirects: Record<string, string> = {
  '/onboarding/congrats': '/onboarding/step-3',
  '/signup': '/#signup',
  '/login': '/#signup',
  '/step-2': '/onboarding/step-2',
  '/step-3': '/onboarding/step-3',
  // Add more redirects here as needed
  // '/path-to-redirect-from': '/path-to-redirect-to',
};

export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;
  
  // Check if this path should be redirected
  for (const [source, destination] of Object.entries(redirects)) {
    if (pathname === source || pathname === `${source}/`) {
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }
  
  // Continue with the request if no redirect is needed
  return NextResponse.next();
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: [
    // Add paths that should be checked for redirects
    '/onboarding/congrats',
    '/onboarding/congrats/',
    '/signup',
    '/signup/',
    '/login',
    '/login/',
    '/step-2',
    '/step-2/',
    '/step-3',
    '/step-3/',
    // Add more paths as needed, or use patterns like:
    // '/prefix/:path*',
  ],
};
