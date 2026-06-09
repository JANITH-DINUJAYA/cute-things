import { NextResponse } from 'next/server';
import { adminAuth }    from '@/lib/firebase/admin';

/**
 * POST /api/auth/session
 * Verifies Firebase ID token and sets a session cookie.
 *
 * DELETE /api/auth/session
 * Clears the session cookie (logout).
 */

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path:     '/',
  // 7 days (ms → s for maxAge)
  maxAge:   60 * 60 * 24 * 7,
};

export async function POST(request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: 'idToken required' }, { status: 400 });
    }

    // Verify token and check role
    const decoded = await adminAuth.verifyIdToken(idToken);
    if (!decoded.role) {
      return NextResponse.json({ error: 'No admin role assigned' }, { status: 403 });
    }

    // Update lastLoginAt in Firestore (fire and forget)
    const { adminDb } = await import('@/lib/firebase/admin');
    adminDb.collection('users').doc(decoded.uid).update({
      lastLoginAt: new Date(),
    }).catch(() => {});

    const response = NextResponse.json({ success: true });
    response.cookies.set('session', idToken, SESSION_COOKIE_OPTIONS);
    return response;
  } catch (err) {
    console.error('[/api/auth/session POST]', err.message);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('session', '', { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
