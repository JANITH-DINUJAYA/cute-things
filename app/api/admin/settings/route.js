import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

async function verifyAdmin(requireSuper = false) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) throw new Error('Unauthorized');
  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(session);
  } catch {
    throw new Error('Invalid session');
  }
  const role = decoded.role;
  if (!role || !['admin', 'superadmin'].includes(role)) throw new Error('Forbidden');
  if (requireSuper && role !== 'superadmin') throw new Error('Superadmin only');
  return decoded;
}

/**
 * GET /api/admin/settings
 * Returns all settings documents (general, shipping, pixels, coupons)
 * Requires: admin or superadmin role
 */
export async function GET() {
  try {
    await verifyAdmin(false);

    const [generalSnap, shippingSnap, pixelsSnap, couponsSnap] = await Promise.all([
      adminDb.collection('settings').doc('general').get(),
      adminDb.collection('settings').doc('shipping').get(),
      adminDb.collection('settings').doc('pixels').get(),
      adminDb.collection('settings').doc('coupons').get(),
    ]);

    return NextResponse.json({
      general:  generalSnap.exists  ? generalSnap.data()  : {},
      shipping: shippingSnap.exists ? shippingSnap.data() : {},
      pixels:   pixelsSnap.exists   ? pixelsSnap.data()   : {},
      coupons:  couponsSnap.exists  ? couponsSnap.data()  : { list: [] },
    });
  } catch (err) {
    const status = err.message === 'Unauthorized' || err.message === 'Invalid session' ? 401
      : err.message === 'Forbidden' || err.message === 'Superadmin only' ? 403
      : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

/**
 * PATCH /api/admin/settings
 * Saves a settings document. Only superadmin can write.
 * Body: { tab: 'general'|'shipping'|'pixels'|'coupons', data: {...} }
 */
export async function PATCH(request) {
  try {
    await verifyAdmin(true);

    const body = await request.json();
    const { tab, data } = body;

    const allowedTabs = ['general', 'shipping', 'pixels', 'coupons'];
    if (!tab || !allowedTabs.includes(tab) || !data) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    await adminDb.collection('settings').doc(tab).set(data, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    const status = err.message === 'Unauthorized' || err.message === 'Invalid session' ? 401
      : err.message === 'Forbidden' || err.message === 'Superadmin only' ? 403
      : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
