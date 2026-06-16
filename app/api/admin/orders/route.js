import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';

/**
 * GET /api/admin/orders
 * Returns all orders sorted by createdAt desc.
 * Reads via Admin SDK — bypasses Firestore client security rules.
 * Requires valid session cookie.
 */
export async function GET() {
  try {
    // Verify session cookie
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      await adminAuth.verifyIdToken(session);
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const snap = await adminDb.collection('orders').orderBy('createdAt', 'desc').get();

    const orders = snap.docs.map((d) => {
      const data = d.data();
      return {
        id:          d.id,
        orderNumber: data.orderNumber ?? '',
        customer:    data.customer   ?? {},
        items:       data.items      ?? [],
        subtotal:    data.subtotal   ?? 0,
        shippingFee: data.shippingFee ?? 0,
        total:       data.total      ?? 0,
        status:      data.status     ?? 'pending',
        paymentMethod: data.paymentMethod ?? 'cod',
        paymentSlipUrl: data.paymentSlipUrl ?? null,
        isPaid:      data.isPaid     ?? false,
        notes:       data.notes      ?? '',
        statusHistory: (data.statusHistory ?? []).map((h) => ({
          ...h,
          changedAt: h.changedAt?.toDate?.()?.toISOString() ?? null,
        })),
        createdAt:   data.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt:   data.updatedAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    return NextResponse.json({ orders });
  } catch (err) {
    console.error('[GET /api/admin/orders]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/orders
 * Updates the status of an order.
 * Body: { orderId, status }
 */
export async function PATCH(request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { await adminAuth.verifyIdToken(session); } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { orderId, status, isPaid } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const { FieldValue } = await import('firebase-admin/firestore');
    const updateData = { updatedAt: new Date() };

    if (status !== undefined) {
      updateData.status = status;
      updateData.statusHistory = FieldValue.arrayUnion({
        status,
        changedAt: new Date(),
        changedBy: 'admin',
      });
    }

    if (isPaid !== undefined) {
      updateData.isPaid = isPaid;
    }

    await adminDb.collection('orders').doc(orderId).update(updateData);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/admin/orders]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
