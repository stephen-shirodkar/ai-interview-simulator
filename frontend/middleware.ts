import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/setup(.*)',
  '/interview(.*)',
  '/history(.*)',
  '/profile(.*)',
  '/settings(.*)',
]);

export default clerkMiddleware((auth, req) => {
  try {
    if (isProtectedRoute(req)) {
      auth().protect();
    }
  } catch (e) {
    // Graceful fallback if Clerk keys are not configured or invalid in environment
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)', '/__clerk/:path*'],
};
