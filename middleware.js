// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the 'USER_ID' cookie
  const userId = request.cookies.get('USER_ID')?.value;

  // If the user tries to access /upload but has no USER_ID, redirect to /form
  if (request.nextUrl.pathname.startsWith('/upload')) {
    if (!userId) {
      return NextResponse.redirect(new URL('/form', request.url));
    }
  }

  return NextResponse.next();
}

// Only run middleware on these paths
export const config = {
  matcher: ['/upload/:path*'],
};