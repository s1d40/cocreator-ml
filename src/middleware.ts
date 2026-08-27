import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractTokenFromRequest, decodeUnifiedSession } from './auth';

export function middleware(request: NextRequest) {
  const token = extractTokenFromRequest(request);
  const session = token ? decodeUnifiedSession(token) : null;

  // Check if valid session with client_id exists
  const isAuthenticated = !!(session && session.user && session.user.client_id);

  if (!isAuthenticated) {
    const pathname = request.nextUrl.pathname;

    // For API endpoints, return 401 Unauthorized JSON response
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required to access this resource.' },
        { status: 401 }
      );
    }

    // For page requests, redirect to NEXT_PUBLIC_HUB_URL/login?returnTo=...
    const hubUrl = process.env.NEXT_PUBLIC_HUB_URL || 'https://hub.cocreator.com';
    const cleanHubUrl = hubUrl.endsWith('/') ? hubUrl.slice(0, -1) : hubUrl;
    const returnTo = encodeURIComponent(request.url);
    const loginUrl = `${cleanHubUrl}/login?returnTo=${returnTo}`;

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, images, and fonts
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|.*\\.woff$|.*\\.woff2$).*)',
  ],
};
