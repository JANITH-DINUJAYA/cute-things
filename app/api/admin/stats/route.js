import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';

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

    const [ordersSnap, productsSnap, customersSnap] = await Promise.all([
      adminDb.collection('orders').get(),
      adminDb.collection('products').get(),
      adminDb.collection('customers').get(),
    ]);

    const orders   = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const revenue       = orders.filter((o) => o.status === 'completed').reduce((s, o) => s + (o.total || 0), 0);
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const lowStock      = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStock    = products.filter((p) => p.stock === 0).length;

    const recentOrders  = orders
      .sort((a, b) => {
        const timeA = a.createdAt?.seconds ?? (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.seconds ?? (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      })
      .slice(0, 8)
      .map((o) => {
        const parseDate = (val) => {
          if (!val) return null;
          if (typeof val.toDate === 'function') return val.toDate().toISOString();
          if (val instanceof Date) return val.toISOString();
          if (typeof val === 'string') return val;
          if (val.seconds) return new Date(val.seconds * 1000).toISOString();
          return null;
        };
        return {
          id: o.id,
          orderNumber: o.orderNumber ?? '',
          customer: o.customer ?? {},
          total: o.total ?? 0,
          status: o.status ?? 'pending',
          createdAt: parseDate(o.createdAt),
          updatedAt: parseDate(o.updatedAt),
        };
      });

    return NextResponse.json({
      stats: {
        totalOrders:    orders.length,
        totalProducts:  products.length,
        totalCustomers: customersSnap.size,
        revenue,
        pendingOrders,
        lowStock,
        outOfStock,
        recentOrders,
      }
    });
  } catch (err) {
    console.error('[GET /api/admin/stats]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
