import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const revalidate = 60; // Cache response for 1 minute

/**
 * GET /api/settings
 * Public endpoint to fetch general and shipping settings for the storefront.
 */
export async function GET() {
  try {
    const [generalSnap, shippingSnap] = await Promise.all([
      adminDb.collection('settings').doc('general').get(),
      adminDb.collection('settings').doc('shipping').get(),
    ]);

    return NextResponse.json({
      general:  generalSnap.exists  ? generalSnap.data()  : {},
      shipping: shippingSnap.exists ? shippingSnap.data() : {},
    });
  } catch (err) {
    console.error('[GET /api/settings]', err);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
