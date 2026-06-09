import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

/**
 * POST /api/auth/session
 * Verifies Firebase ID token, checks admin role, sets session cookie.
 *
 * DELETE /api/auth/session
 * Clears the session cookie (logout).
 */

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path:     '/',
  maxAge:   60 * 60 * 24 * 7, // 7 days
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: 'idToken required' }, { status: 400 });
    }

    // 1. Verify the token with Admin SDK (full cryptographic verification)
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken, true /* check revoked */);
    } catch (verifyErr) {
      console.error('[session] verifyIdToken failed:', verifyErr.message);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const uid = decoded.uid;
    if (!uid) {
      return NextResponse.json({ error: 'Invalid user session payload: missing UID' }, { status: 401 });
    }

    // 2. Check the role — it can be in decoded directly (custom claim)
    //    or we fall back to Firestore if token hasn't refreshed yet
    let role = decoded.role ?? decoded['role'] ?? null;

    if (!role) {
      // Token may not have the freshly-set custom claim yet.
      // Fall back: check Firestore users collection directly.
      try {
        const userSnap = await adminDb.collection('users').doc(uid).get();
        if (userSnap.exists) {
          role = userSnap.data()?.role ?? null;
        }
      } catch (dbErr) {
        console.error('[session] Firestore fallback error:', dbErr.message);
      }
    }

    if (!role) {
      return NextResponse.json(
        { error: 'No admin role. Contact your administrator.' },
        { status: 403 }
      );
    }

    // 3. Update lastLoginAt (fire-and-forget)
    adminDb.collection('users').doc(uid).update({
      lastLoginAt: new Date(),
    }).catch(() => {});

    // 4. Set session cookie
    const response = NextResponse.json({ success: true, role });
    response.cookies.set('session', idToken, SESSION_COOKIE_OPTIONS);
    return response;

  } catch (err) {
    console.error('[/api/auth/session POST] Unexpected error:', err.message);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('session', '', { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
