import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/approvalform',
    '/approvalformforhod',
    '/approvalformforhrhod',
    '/approvalformhos'
  ];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Check if user is logged in by checking the cookie
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';

  // If trying to access protected route and not logged in, redirect to login page with redirect param
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', pathname); // Save intended destination
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - assets folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|assets).*)',
  ],
};