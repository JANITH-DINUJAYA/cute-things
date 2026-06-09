import { adminDb } from '@/lib/firebase/admin';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

async function getStats() {
  try {
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
          ...o,
          createdAt: parseDate(o.createdAt),
          updatedAt: parseDate(o.updatedAt),
        };
      });

    return {
      totalOrders:    orders.length,
      totalProducts:  products.length,
      totalCustomers: customersSnap.size,
      revenue,
      pendingOrders,
      lowStock,
      outOfStock,
      recentOrders,
    };
  } catch (err) {
    console.error('[dashboard]', err);
    return { totalOrders: 0, totalProducts: 0, totalCustomers: 0, revenue: 0, pendingOrders: 0, lowStock: 0, outOfStock: 0, recentOrders: [] };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();
  return <DashboardClient stats={stats} />;
}
