import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

/**
 * POST /api/validate-coupon
 * Public endpoint — validates a coupon code and returns discount info.
 * Body: { code: string, subtotal: number }
 */
export async function POST(request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json({ error: 'Missing code or subtotal' }, { status: 400 });
    }

    const couponsSnap = await adminDb.collection('settings').doc('coupons').get();
    if (!couponsSnap.exists) {
      return NextResponse.json({ error: 'Invalid coupon code.' }, { status: 404 });
    }

    const { list = [] } = couponsSnap.data();
    const coupon = list.find(
      (c) => c.code === code.toUpperCase().trim() && c.active !== false
    );

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or expired coupon code.' }, { status: 404 });
    }

    // Check expiry
    if (coupon.expiry && new Date(coupon.expiry) < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired.' }, { status: 400 });
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round((subtotal * coupon.value) / 100);
    } else {
      discount = Math.min(coupon.value, subtotal); // can't discount more than total
    }

    return NextResponse.json({
      valid:    true,
      code:     coupon.code,
      type:     coupon.type,
      value:    coupon.value,
      discount,
    });
  } catch (err) {
    console.error('[POST /api/validate-coupon]', err);
    return NextResponse.json({ error: 'Server error validating coupon.' }, { status: 500 });
  }
}
