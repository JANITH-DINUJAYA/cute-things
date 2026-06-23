import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { sendOrderConfirmation, sendAdminNewOrderAlert } from '@/lib/email';

/**
 * GET /api/orders
 * Returns all orders belonging to the logged-in customer.
 * Requires: Bearer token in Authorization header.
 */
export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing session token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let uid;
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      uid = decoded.uid;
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Query orders belonging to this user
    const snap = await adminDb.collection('orders')
      .where('userId', '==', uid)
      .get();

    const orders = snap.docs.map((d) => {
      const data = d.data();
      return {
        id:          d.id,
        orderNumber: data.orderNumber ?? '',
        customer:    data.customer   ?? {},
        items:       data.items      ?? [],
        subtotal:    data.subtotal   ?? 0,
        discount:    data.discount   ?? 0,
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

    // Sort by date descending
    orders.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return b.createdAt.localeCompare(a.createdAt);
    });

    return NextResponse.json({ orders });
  } catch (err) {
    console.error('[GET /api/orders] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/orders
 * Creates a new order in Firestore (via Admin SDK).
 * Requires: Bearer token in Authorization header.
 *
 * Body: {
 *   customer: { name, email, phone, address, city, postalCode, notes? },
 *   items:    [{ productId, name, price, qty, image }],
 *   shippingFee: number,
 * }
 */
export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Log in is required to place an order.' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let userId;
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      userId = decoded.uid;
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session. Please log in again.' }, { status: 401 });
    }

    const body = await request.json();
    const { customer, items, couponCode, paymentMethod = 'cod', paymentSlipUrl = null, isPaid = false } = body;

    // ── Basic validation ─────────────────────────────────────────────
    if (!customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json({ error: 'Customer details are required' }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }

    // ── Fetch shipping & coupon settings from Firestore ──────────────
    const [shippingSnap, couponsSnap] = await Promise.all([
      adminDb.collection('settings').doc('shipping').get(),
      adminDb.collection('settings').doc('coupons').get(),
    ]);

    const shippingSettings = shippingSnap.exists ? shippingSnap.data() : { defaultFee: 350, freeShippingThreshold: 5000 };
    const defaultFee = shippingSettings.defaultFee ?? 350;
    const freeShippingThreshold = shippingSettings.freeShippingThreshold ?? 5000;

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    // Calculate dynamic shipping fee
    const actualShippingFee = (freeShippingThreshold && subtotal >= freeShippingThreshold) ? 0 : defaultFee;

    // Calculate discount
    let discount = 0;
    if (couponCode) {
      const { list = [] } = couponsSnap.exists ? couponsSnap.data() : {};
      const coupon = list.find(
        (c) => c.code === couponCode.toUpperCase().trim() && c.active !== false
      );
      if (coupon && (!coupon.expiry || new Date(coupon.expiry) >= new Date())) {
        if (coupon.type === 'percentage') {
          discount = Math.round((subtotal * coupon.value) / 100);
        } else {
          discount = Math.min(coupon.value, subtotal);
        }
      }
    }

    const total = Math.max(0, subtotal - discount) + actualShippingFee;

    // ── Generate order number ────────────────────────────────────────
    const timestamp  = Date.now();
    const orderNumber = `CT-${timestamp.toString().slice(-8)}`;

    const order = {
      orderNumber,
      userId,
      customer,
      items,
      subtotal,
      discount,
      couponCode: couponCode || null,
      shippingFee: actualShippingFee,
      total,
      paymentMethod,
      paymentSlipUrl,
      isPaid: isPaid ?? false,
      status:         'pending',
      notes:          customer.notes || '',
      statusHistory: [
        {
          status:    'pending',
          changedAt: new Date(),
          changedBy: 'system',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // ── Write to Firestore ───────────────────────────────────────────
    const docRef = await adminDb.collection('orders').add(order);
    order.id = docRef.id;

    // ── Deduct stock for each item ───────────────────────────────────
    const { FieldValue } = await import('firebase-admin/firestore');
    const stockBatch = adminDb.batch();
    for (const item of items) {
      const ref = adminDb.collection('products').doc(item.productId);
      stockBatch.update(ref, { stock: FieldValue.increment(-item.qty) });
    }
    await stockBatch.commit();

    // ── Upsert customer record ───────────────────────────────────────
    const customerRef = adminDb.collection('customers').doc(userId);
    const customerSnap = await customerRef.get();
    if (customerSnap.exists) {
      await customerRef.update({
        orderCount:  FieldValue.increment(1),
        totalSpent:  FieldValue.increment(total),
        lastOrderAt: new Date(),
        updatedAt:   new Date(),
      });
    } else {
      await customerRef.set({
        name:        customer.name,
        email:       customer.email,
        phone:       customer.phone,
        orderCount:  1,
        totalSpent:  total,
        notes:       '',
        createdAt:   new Date(),
        lastOrderAt: new Date(),
        updatedAt:   new Date(),
      });
    }

    // ── Send emails ──────────────────────────────────────────────────
    await Promise.allSettled([
      sendOrderConfirmation(order),
      sendAdminNewOrderAlert(order),
    ]);

    return NextResponse.json(
      { success: true, orderId: docRef.id, orderNumber },
      { status: 201 }
    );
  } catch (err) {
    console.error('[/api/orders POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
