import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

/**
 * POST /api/admin/set-role
 *
 * Sets a Firebase Custom Claim { role } on a user.
 * Only callable by a SuperAdmin (verified server-side).
 *
 * Body: { targetUid: string, role: 'admin' | 'staff' }
 */
export async function POST(request) {
  try {
    // ── Verify caller is superadmin ──────────────────────────────────
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(sessionCookie);
    if (decoded.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ── Parse and validate body ──────────────────────────────────────
    const { targetUid, role } = await request.json();
    const allowedRoles = ['admin', 'staff'];

    if (!targetUid || !allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'targetUid and a valid role (admin|staff) are required' },
        { status: 400 }
      );
    }

    // Prevent changing superadmin's own role
    if (targetUid === decoded.uid) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    // ── Set Custom Claim ─────────────────────────────────────────────
    await adminAuth.setCustomUserClaims(targetUid, { role });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[/api/admin/set-role]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
