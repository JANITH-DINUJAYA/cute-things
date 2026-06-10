import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

/**
 * PATCH /api/admin/update-profile
 * Allows an authenticated admin to update their own display name, email, or password.
 * Body: { displayName?, email?, password? }
 */
export async function PATCH(request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(session);
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const uid = decoded.uid;
    const { displayName, email, password } = await request.json();

    // Build Firebase Auth update payload
    const authUpdate = {};
    if (email)       authUpdate.email       = email;
    if (password)    authUpdate.password    = password;
    if (displayName) authUpdate.displayName = displayName;

    if (Object.keys(authUpdate).length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 });
    }

    // Update Firebase Auth record
    await adminAuth.updateUser(uid, authUpdate);

    // Sync displayName to Firestore users doc if changed
    if (displayName) {
      await adminDb.collection('users').doc(uid).update({
        displayName,
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/admin/update-profile]', err);
    // Translate Firebase errors to friendlier messages
    const msg = err.code === 'auth/email-already-exists'
      ? 'That email is already in use by another account.'
      : err.code === 'auth/invalid-email'
      ? 'Please enter a valid email address.'
      : err.code === 'auth/weak-password'
      ? 'Password must be at least 6 characters.'
      : err.message;
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
