'use client';

import Link from 'next/link';
import { ShoppingBag, Package, Users, DollarSign, AlertTriangle, Clock, CheckCircle, Truck } from 'lucide-react';

const statusColors = {
  pending:            { bg: '#fffde7', color: '#f57f17', label: 'Pending'    },
  confirmed:          { bg: '#e3f2fd', color: '#1565c0', label: 'Confirmed'  },
  processing:         { bg: '#f3e5f5', color: '#6a1b9a', label: 'Processing' },
  ready_for_dispatch: { bg: '#e8eaf6', color: '#283593', label: 'Ready'      },
  dispatched:         { bg: '#fff3e0', color: '#e65100', label: 'Dispatched' },
  delivered:          { bg: '#e0f2f1', color: '#00695c', label: 'Delivered'  },
  completed:          { bg: '#e8f5e9', color: '#2e7d32', label: 'Completed'  },
  cancelled:          { bg: '#ffebee', color: '#c62828', label: 'Cancelled'  },
};

export default function DashboardClient({ stats }) {
  const {
    totalOrders, totalProducts, totalCustomers, revenue,
    pendingOrders, lowStock, outOfStock, recentOrders,
  } = stats;

  const statCards = [
    { label: 'Total Revenue',   value: `Rs. ${revenue.toLocaleString()}`, icon: DollarSign, color: '#e91e8c', bg: '#fce4ec', change: 'All time'    },
    { label: 'Total Orders',    value: totalOrders,                        icon: ShoppingBag, color: '#9c27b0', bg: '#f3e5f5', change: `${pendingOrders} pending` },
    { label: 'Total Products',  value: totalProducts,                      icon: Package,     color: '#1976d2', bg: '#e3f2fd', change: `${outOfStock} out of stock` },
    { label: 'Total Customers', value: totalCustomers,                     icon: Users,       color: '#2e7d32', bg: '#e8f5e9', change: 'Registered'  },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px' }}>
          Good day! 👋
        </h2>
        <p style={{ color: '#6b7280', margin: 0 }}>Here's what's happening with your store today.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 20, marginBottom: 32 }}>
        {statCards.map(({ label, value, icon: Icon, color, bg, change }) => (
          <div key={label} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} color={color} />
              </div>
            </div>
            <p style={{ margin: '0 0 4px', fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{label}</p>
            <p style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: '#1a1a2e' }}>{value}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{change}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(lowStock > 0 || outOfStock > 0) && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
          {outOfStock > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 18px', flex: 1, minWidth: 240 }}>
              <AlertTriangle size={18} color="#dc2626" />
              <span style={{ fontSize: 14, color: '#dc2626', fontWeight: 600 }}>{outOfStock} product{outOfStock > 1 ? 's' : ''} out of stock</span>
              <Link href="/admin/products?filter=out_of_stock" style={{ marginLeft: 'auto', fontSize: 13, color: '#dc2626', textDecoration: 'underline' }}>View</Link>
            </div>
          )}
          {lowStock > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fffde7', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 18px', flex: 1, minWidth: 240 }}>
              <AlertTriangle size={18} color="#d97706" />
              <span style={{ fontSize: 14, color: '#d97706', fontWeight: 600 }}>{lowStock} product{lowStock > 1 ? 's' : ''} low on stock</span>
              <Link href="/admin/products?filter=low_stock" style={{ marginLeft: 'auto', fontSize: 13, color: '#d97706', textDecoration: 'underline' }}>View</Link>
            </div>
          )}
        </div>
      )}

      {/* Recent Orders */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Recent Orders</h3>
          <Link href="/admin/orders" style={{ fontSize: 13, color: '#e91e8c', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9ca3af' }}>
            <ShoppingBag size={40} style={{ opacity: .3, marginBottom: 12 }} />
            <p>No orders yet. Share your store link!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  {['Order #', 'Customer', 'Total', 'Status', 'Date', ''].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => {
                  const sc = statusColors[order.status] ?? { bg: '#f5f5f5', color: '#666', label: order.status };
                  return (
                    <tr key={order.id} style={{ borderTop: '1px solid #f5f5f5', transition: 'background .15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: '#e91e8c' }}>#{order.orderNumber}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{order.customer?.name}</p>
                        <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{order.customer?.phone}</p>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700 }}>Rs. {order.total?.toLocaleString()}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600 }}>
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-LK') : '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <Link href={`/admin/orders/${order.id}`} style={{ fontSize: 13, color: '#e91e8c', textDecoration: 'none', fontWeight: 600 }}>View →</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
