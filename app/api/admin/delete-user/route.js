import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

/**
 * POST /api/admin/delete-user
 * Deletes a Firebase Auth user and their Firestore doc.
 * SuperAdmin only. Cannot delete permanent accounts.
 */
export async function POST(request) {
  try {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(sessionCookie);
    if (decoded.role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { targetUid } = await request.json();
    if (!targetUid) return NextResponse.json({ error: 'targetUid required' }, { status: 400 });

    // Prevent self-deletion
    if (targetUid === decoded.uid) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Check Firestore for isPermanent flag
    const userDoc = await adminDb.collection('users').doc(targetUid).get();
    if (userDoc.exists && userDoc.data().isPermanent) {
      return NextResponse.json({ error: 'Cannot delete a permanent account' }, { status: 403 });
    }

    // Delete from Firebase Auth + Firestore
    await Promise.all([
      adminAuth.deleteUser(targetUid),
      adminDb.collection('users').doc(targetUid).delete(),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[/api/admin/delete-user]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
