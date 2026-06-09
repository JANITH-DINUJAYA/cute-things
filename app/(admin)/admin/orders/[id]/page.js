'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Clock, ShoppingBag, CreditCard, FileText } from 'lucide-react';

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
    <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: 9999, fontSize: 13, fontWeight: 600, display: 'inline-block' }}>
      {s.label}
    </span>
  );
}

export default function OrderDetailPage({ params }) {
  const resolvedParams = React.use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/admin/orders/${orderId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch order details');
        }
        setOrder(data.order);
      } catch (err) {
        console.error('[order-detail]', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId]);

  async function updateStatus(newStatus) {
    try {
      setUpdating(true);
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }
      
      // Reload order details to show new history
      const reloadRes = await fetch(`/api/admin/orders/${orderId}`);
      const reloadData = await reloadRes.json();
      if (reloadRes.ok) {
        setOrder(reloadData.order);
      }
    } catch (err) {
      console.error('[updateStatus]', err);
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton" style={{ height: 40, width: 150 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div className="skeleton" style={{ height: 400, borderRadius: 12 }} />
          <div className="skeleton" style={{ height: 400, borderRadius: 12 }} />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <Link href="/admin/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#e91e8c', textDecoration: 'none', fontWeight: 600, marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <div className="card" style={{ padding: 32, textAlign: 'center', color: '#dc2626' }}>
          <p style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Order Not Found</p>
          <p style={{ margin: 0, color: '#6b7280' }}>{error || 'The requested order details could not be retrieved.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Top action header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Link href="/admin/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1e1a1d', textDecoration: 'none', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
            <ArrowLeft size={16} /> Back to Orders
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Order #{order.orderNumber}</h2>
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Change status dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#6b7280' }}>Update Status:</span>
          <select
            value={order.status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={updating}
            className="input"
            style={{ width: 'auto', minWidth: 160, padding: '10px 14px' }}
          >
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28, alignItems: 'start' }}>
        {/* Main Content: items & notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Order items */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={18} color="#c5a880" /> Items Summary
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f5f5f5', textAlign: 'left' }}>
                    <th style={{ padding: '10px 8px', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Product</th>
                    <th style={{ padding: '10px 8px', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: '10px 8px', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '10px 8px', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#faf8f6', border: '1px solid #eae3dc', position: 'relative', flexShrink: 0 }}>
                            {item.image ? (
                              <Image src={item.image} alt={item.name} width={44} height={44} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 20 }}>🌸</div>
                            )}
                          </div>
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#1e1a1d', display: 'block', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: 14, textAlign: 'right' }}>
                        Rs. {item.price.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: 14, textAlign: 'center', fontWeight: 600 }}>
                        {item.qty}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: 14, fontWeight: 700, textAlign: 'right' }}>
                        Rs. {(item.price * item.qty).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations */}
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10, alignSelf: 'flex-end', marginLeft: 'auto', maxWidth: 300, width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#6b7280' }}>Subtotal</span>
                <span>Rs. {order.subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: '#6b7280' }}>Shipping Fee</span>
                <span>Rs. {order.shippingFee.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, borderTop: '1px solid #f5f5f5', paddingTop: 12, marginTop: 4 }}>
                <span>Grand Total</span>
                <span style={{ color: '#e91e8c' }}>Rs. {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Customer notes */}
          {order.notes && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color="#c5a880" /> Customer Notes
              </h3>
              <p style={{ margin: 0, fontSize: 14, background: '#faf8f6', border: '1px solid #eae3dc', padding: 14, borderRadius: 8, color: '#374151', fontStyle: 'italic' }}>
                "{order.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Sidebar details: customer info, status history */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Customer details */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={18} color="#c5a880" /> Customer Details
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Name</p>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{order.customer.name}</p>
              </div>

              <div style={{ borderTop: '1px solid #fcf9f6', paddingTop: 12 }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Email</p>
                <a href={`mailto:${order.customer.email}`} style={{ margin: 0, fontSize: 14, color: '#e91e8c', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} /> {order.customer.email}
                </a>
              </div>

              <div style={{ borderTop: '1px solid #fcf9f6', paddingTop: 12 }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Phone</p>
                <a href={`tel:${order.customer.phone}`} style={{ margin: 0, fontSize: 14, color: '#1e1a1d', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <Phone size={14} /> {order.customer.phone}
                </a>
              </div>

              <div style={{ borderTop: '1px solid #fcf9f6', paddingTop: 12 }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Shipping Address</p>
                <div style={{ margin: 0, fontSize: 14, display: 'flex', gap: 6, alignItems: 'flex-start', lineHeight: 1.5 }}>
                  <MapPin size={14} style={{ marginTop: 3, flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0 }}>{order.customer.address}</p>
                    <p style={{ margin: 0 }}>{order.customer.city}, {order.customer.postalCode}</p>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #fcf9f6', paddingTop: 12 }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Payment Method</p>
                <span style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CreditCard size={14} color="#6b7280" /> Cash on Delivery (COD)
                </span>
              </div>
            </div>
          </div>

          {/* Timeline / Status History */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="#c5a880" /> Order History
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Created Date */}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c5a880' }} />
                  <div style={{ flex: 1, width: 2, background: '#eae3dc' }} />
                </div>
                <div style={{ fontSize: 13 }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>Order Placed</p>
                  <p style={{ margin: 0, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Calendar size={12} /> {order.createdAt ? new Date(order.createdAt).toLocaleString('en-LK') : '—'}
                  </p>
                </div>
              </div>

              {/* Status History Logs */}
              {order.statusHistory && order.statusHistory.map((h, index) => {
                const s = STATUS_OPTIONS.find((o) => o.value === h.status) ?? { label: h.status, color: '#666' };
                const isLast = index === order.statusHistory.length - 1;
                return (
                  <div key={index} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color ?? '#c5a880' }} />
                      {!isLast && <div style={{ flex: 1, width: 2, background: '#eae3dc' }} />}
                    </div>
                    <div style={{ fontSize: 13 }}>
                      <p style={{ margin: 0, fontWeight: 700 }}>Status updated to <span style={{ color: s.color }}>{s.label}</span></p>
                      <p style={{ margin: 0, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Calendar size={12} /> {h.changedAt ? new Date(h.changedAt).toLocaleString('en-LK') : '—'}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>By: {h.changedBy ?? 'system'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
