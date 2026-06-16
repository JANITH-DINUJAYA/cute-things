import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';

export async function GET(request, { params }) {
  try {
    // Await params promise in Next.js 15
    const resolvedParams = await params;
    const { id: orderId } = resolvedParams;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

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

    const docRef = adminDb.collection('orders').doc(orderId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const data = docSnap.data();
    const order = {
      id:          docSnap.id,
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

    return NextResponse.json({ order });
  } catch (err) {
    console.error(`[GET /api/admin/orders/[id]]`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
