import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { DEFAULT_PERMISSIONS } from '@/lib/constants';

/**
 * POST /api/admin/create-user
 * Creates a Firebase Auth user, sets custom claim, writes Firestore doc.
 * SuperAdmin only.
 */
export async function POST(request) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(sessionCookie);
    if (decoded.role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { email, password, displayName, role } = await request.json();
    if (!email || !password || !displayName || !role) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }
    if (!['admin', 'staff'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({ email, password, displayName, emailVerified: true });
    const uid = userRecord.uid;

    // Set custom claim
    await adminAuth.setCustomUserClaims(uid, { role });

    // Write Firestore user doc
    await adminDb.collection('users').doc(uid).set({
      email,
      displayName,
      role,
      isPermanent:  role === 'admin', // admin accounts are permanent
      permissions:  DEFAULT_PERMISSIONS[role] ?? {},
      createdAt:    new Date(),
      lastLoginAt:  null,
    });

    return NextResponse.json({ success: true, uid }, { status: 201 });
  } catch (err) {
    console.error('[/api/admin/create-user]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
