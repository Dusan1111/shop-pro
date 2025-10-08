import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Retrieve the authentication token from cookies
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Check if user is accessing admin routes
  if (pathname.startsWith('/admin')) {
    // If the token is not present, redirect to the /products page
    if (!token) {
      return NextResponse.redirect(new URL('/products', request.url));
    }
  }
  // Check if logged-in user is trying to access non-admin routes (except API routes and login)
  else if (token && !pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.startsWith('/login')) {
    // Redirect logged-in users to admin panel
    return NextResponse.redirect(new URL('/admin/manage-orders', request.url));
  }

  // Proceed to the next middleware or route handler
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets).*)'], // Apply to all routes except static files
};