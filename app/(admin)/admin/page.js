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
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      .slice(0, 8)
      .map((o) => ({
        ...o,
        createdAt: o.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: o.updatedAt?.toDate?.()?.toISOString() ?? null,
      }));

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
