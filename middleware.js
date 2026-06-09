import { NextResponse } from 'next/server';

/**
 * Next.js Edge Middleware — Auth + RBAC Route Guard
 *
 * Runs at the edge on every request matching the config below.
 * Reads the 'session' cookie (a Firebase ID token) and verifies
 * the user's role before allowing access to /admin/* routes.
 *
 * NOTE: Full token verification with the Admin SDK cannot run at
 * the edge. We do a lightweight JWT payload decode here for speed,
 * and re-verify with the Admin SDK inside every Server Action /
 * API Route that performs mutations.
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ── Protect /admin/* routes ──────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      return redirectToLogin(request);
    }

    // Decode JWT payload (base64) — no signature verification here.
    // Full verification happens server-side in each route/action.
    try {
      const payload = decodeJwtPayload(sessionCookie);

      // Check expiry
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        return redirectToLogin(request);
      }

      const role = payload.role ?? null;

      // Must have at least a valid role
      if (!role) {
        return redirectToLogin(request);
      }

      // ── Fine-grained path guards ──────────────────────────────────
      // Only superadmin can access /admin/users and /admin/settings
      if (
        (pathname.startsWith('/admin/users') ||
          pathname.startsWith('/admin/settings')) &&
        role !== 'superadmin'
      ) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      // Inject role into request header for Server Components to read
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-role', role);
      requestHeaders.set('x-user-uid', payload.user_id ?? payload.sub ?? '');

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      return redirectToLogin(request);
    }
  }

  // ── Redirect logged-in users away from login page ────────────────
  if (pathname === '/auth/login') {
    const sessionCookie = request.cookies.get('session')?.value;
    if (sessionCookie) {
      try {
        const payload = decodeJwtPayload(sessionCookie);
        if (payload.role && Date.now() / 1000 < payload.exp) {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      } catch {
        // ignore — let them stay on login
      }
    }
  }

  return NextResponse.next();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function redirectToLogin(request) {
  const url = request.nextUrl.clone();
  url.pathname = '/auth/login';
  url.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function decodeJwtPayload(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT');
  // atob is available in Edge runtime
  const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(json);
}

// ─── Matcher ─────────────────────────────────────────────────────────────────
export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/login',
  ],
};
