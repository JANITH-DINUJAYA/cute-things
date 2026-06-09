'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, ChevronRight, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'pending',            label: 'Pending',            color: '#f57f17', bg: '#fffde7' },
  { value: 'confirmed',          label: 'Confirmed',          color: '#1565c0', bg: '#e3f2fd' },
  { value: 'processing',         label: 'Processing',         color: '#6a1b9a', bg: '#f3e5f5' },
  { value: 'ready_for_dispatch', label: 'Ready for Dispatch', color: '#283593', bg: '#e8eaf6' },
  { value: 'dispatched',         label: 'Dispatched',         color: '#e65100', bg: '#fff3e0' },
  { value: 'delivered',          label: 'Delivered',          color: '#00695c', bg: '#e0f2f1' },
  { value: 'completed',          label: 'Completed',          color: '#2e7d32', bg: '#e8f5e9' },
  { value: 'cancelled',          label: 'Cancelled',          color: '#c62828', bg: '#ffebee' },
];

function StatusBadge({ status }) {
  const s = STATUS_OPTIONS.find((o) => o.value === status) ?? { label: status, color: '#666', bg: '#f5f5f5' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

export default function OrdersPage() {
  const [orders,   setOrders]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }
      setOrders(data.orders ?? []);
      setFiltered(data.orders ?? []);
    } catch (err) {
      console.error('[load orders]', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let result = orders;
    if (filter !== 'all') result = result.filter((o) => o.status === filter);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((o) =>
        o.orderNumber?.toLowerCase().includes(s) ||
        o.customer?.name?.toLowerCase().includes(s) ||
        o.customer?.phone?.includes(s)
      );
    }
    setFiltered(result);
  }, [search, filter, orders]);

  async function updateStatus(orderId, newStatus) {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }
      // Optimistically update status in state or reload
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      console.error('[updateStatus]', err);
      alert(err.message);
    }
  }

  if (error) {
    return (
      <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 12, color: '#dc2626', background: '#fff5f5' }}>
        <AlertCircle size={20} />
        <div>
          <p style={{ margin: 0, fontWeight: 700 }}>Error loading orders</p>
          <p style={{ margin: 0, fontSize: 13 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 12 }} />)}
    </div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Orders</h2>
        <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input id="order-search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer name or phone…"
            className="input" style={{ paddingLeft: 42 }} />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="input" style={{ width: 'auto', minWidth: 160 }}>
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', color: '#9ca3af' }}>
            <ShoppingBag size={40} style={{ opacity: .3, marginBottom: 12 }} />
            <p style={{ margin: 0 }}>No orders found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Update Status', 'Date', ''].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} style={{ borderTop: '1px solid #f5f5f5' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: '#e91e8c' }}>#{order.orderNumber}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{order.customer?.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{order.customer?.phone}</p>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{order.items?.length ?? 0} item(s)</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700 }}>Rs. {order.total?.toLocaleString()}</td>
                    <td style={{ padding: '14px 16px' }}><StatusBadge status={order.status} /></td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="input"
                        style={{ width: 'auto', fontSize: 13, padding: '6px 10px' }}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-LK') : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Link href={`/admin/orders/${order.id}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#e91e8c', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        Details <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
