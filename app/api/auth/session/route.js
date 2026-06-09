import { NextResponse } from 'next/server';
import { adminAuth, adminDb, _adminInitialized } from '@/lib/firebase/admin';

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
  // Always return JSON — never let this route throw an unhandled error
  try {
    // 0. Check if Admin SDK is actually initialized on this server
    if (!_adminInitialized) {
      console.error('[session] Admin SDK not initialized. Check FIREBASE_ADMIN_* env vars on Vercel.');
      return NextResponse.json(
        { error: 'Server configuration error: Firebase Admin SDK is not initialized. Check your Vercel environment variables.' },
        { status: 503 }
      );
    }

    // 1. Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { idToken } = body ?? {};

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken is required' }, { status: 400 });
    }

    // 2. Verify the token with Admin SDK
    let decoded;
    try {
      // checkRevoked=true verifies the token hasn't been revoked
      decoded = await adminAuth.verifyIdToken(idToken, true);
    } catch (verifyErr) {
      const code = verifyErr?.errorInfo?.code ?? verifyErr?.code ?? 'unknown';
      console.error('[session] verifyIdToken failed:', code, verifyErr.message);
      return NextResponse.json(
        { error: `Invalid or expired token: ${code}` },
        { status: 401 }
      );
    }

    const uid = decoded?.uid;
    if (!uid) {
      console.error('[session] Token decoded but UID is missing:', decoded);
      return NextResponse.json({ error: 'Token has no UID' }, { status: 401 });
    }

    // 3. Role — first from custom claims in token, then fall back to Firestore
    let role = decoded?.role ?? decoded?.['role'] ?? null;

    if (!role) {
      // Custom claim not yet in token. Check Firestore `users` collection.
      try {
        const userSnap = await adminDb.collection('users').doc(uid).get();
        if (userSnap.exists) {
          role = userSnap.data()?.role ?? null;
          console.log('[session] Role from Firestore fallback:', role, 'uid:', uid);
        } else {
          console.warn('[session] No user document found in Firestore for uid:', uid);
        }
      } catch (dbErr) {
        console.error('[session] Firestore fallback error:', dbErr.message);
      }
    } else {
      console.log('[session] Role from token claim:', role, 'uid:', uid);
    }

    if (!role) {
      return NextResponse.json(
        { error: 'Access denied: no admin role assigned. Make sure you ran the superadmin seed script.' },
        { status: 403 }
      );
    }

    // 4. Update lastLoginAt (fire-and-forget — don't await)
    adminDb.collection('users').doc(uid).update({
      lastLoginAt: new Date(),
    }).catch((e) => {
      console.warn('[session] lastLoginAt update failed (non-critical):', e.message);
    });

    // 5. Set the session cookie and respond
    const response = NextResponse.json({ success: true, role });
    response.cookies.set('session', idToken, SESSION_COOKIE_OPTIONS);
    return response;

  } catch (err) {
    // Catch-all — log full error and ALWAYS return JSON
    console.error('[/api/auth/session POST] Unexpected error:', err?.message, err?.stack);
    return NextResponse.json(
      { error: 'Unexpected server error. Check Vercel logs for details.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.set('session', '', { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });
    return response;
  } catch (err) {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
