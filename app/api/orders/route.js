import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { sendOrderConfirmation, sendAdminNewOrderAlert } from '@/lib/email';

/**
 * POST /api/orders
 *
 * Creates a new order in Firestore (via Admin SDK — no client access).
 * Sends confirmation email to customer and alert to admin.
 *
 * Body: {
 *   customer: { name, email, phone, address, city, postalCode, notes? },
 *   items:    [{ productId, name, price, qty, image }],
 *   shippingFee: number,
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { customer, items, couponCode } = body;

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
      customer,
      items,
      subtotal,
      discount,
      couponCode: couponCode || null,
      shippingFee: actualShippingFee,
      total,
      paymentMethod:  'cod',
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
    const customerRef = adminDb.collection('customers').doc(
      customer.email.replace(/[.@]/g, '_')
    );
    const customerSnap = await customerRef.get();
    if (customerSnap.exists) {
      await customerRef.update({
        orderCount:  FieldValue.increment(1),
        totalSpent:  FieldValue.increment(total),
        lastOrderAt: new Date(),
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
