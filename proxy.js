import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function proxy(request) {
  const token = request.cookies.get('token')?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');
  const isSignupPage = request.nextUrl.pathname.startsWith('/signup');

  if (!token) {
    if (isLoginPage || isSignupPage) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    // Invalid or expired token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  if (isLoginPage || isSignupPage) {
    // If logged in and trying to access login/signup, redirect to home
    return NextResponse.redirect(new URL('/', request.url));
  }


  // Pass user details to headers so we know who is logged in
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-username', payload.username);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
