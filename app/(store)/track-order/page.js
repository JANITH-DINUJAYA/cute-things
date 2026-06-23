'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useAuthStore from '@/store/authStore';
import { Package, Lock, Calendar, Truck, CheckCircle2, ChevronRight, AlertCircle, ShoppingBag, Landmark, CreditCard, RefreshCw } from 'lucide-react';

const STATUS_MAP = {
  pending:            { label: 'Order Placed',      desc: 'We have received your order.', step: 1 },
  confirmed:          { label: 'Confirmed',         desc: 'Your order is confirmed.',     step: 2 },
  processing:         { label: 'Processing',        desc: 'Your items are being packed.',  step: 3 },
  ready_for_dispatch: { label: 'Ready to Ship',     desc: 'Handing over to courier.',     step: 3 },
  dispatched:         { label: 'Dispatched',        desc: 'On its way to you! 🚚',         step: 4 },
  delivered:          { label: 'Delivered',         desc: 'Enjoy your cute things! 💖',    step: 5 },
  completed:          { label: 'Completed',         desc: 'Order is finalized.',          step: 5 },
  cancelled:          { label: 'Cancelled',         desc: 'This order was cancelled.',    step: -1 },
};

const STEPS = [
  { step: 1, label: 'Placed' },
  { step: 2, label: 'Confirmed' },
  { step: 3, label: 'Processing' },
  { step: 4, label: 'Shipped' },
  { step: 5, label: 'Delivered' },
];

function StatusBadge({ status }) {
  const badgeColors = {
    pending:            { color: '#f57f17', bg: '#fffde7' },
    confirmed:          { color: '#1565c0', bg: '#e3f2fd' },
    processing:         { color: '#6a1b9a', bg: '#f3e5f5' },
    ready_for_dispatch: { color: '#283593', bg: '#e8eaf6' },
    dispatched:         { color: '#e65100', bg: '#fff3e0' },
    delivered:          { color: '#00695c', bg: '#e0f2f1' },
    completed:          { color: '#2e7d32', bg: '#e8f5e9' },
    cancelled:          { color: '#c62828', bg: '#ffebee' },
  };

  const c = badgeColors[status] ?? { color: '#666', bg: '#f5f5f5' };
  const label = STATUS_MAP[status]?.label ?? status;

  return (
    <span style={{
      background: c.bg,
      color: c.color,
      padding: '4px 12px',
      borderRadius: 9999,
      fontSize: 12,
      fontWeight: 600,
      display: 'inline-block',
      textTransform: 'capitalize',
    }}>
      {label}
    </span>
  );
}

export default function TrackOrderPage() {
  const { user, loading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch order history');

      setOrders(data.orders || []);
      if (data.orders?.length > 0) {
        setSelectedOrder(data.orders[0]);
      }
    } catch (err) {
      console.error('[loadOrders]', err);
      setError(err.message || 'Failed to retrieve orders.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  if (authLoading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(197, 168, 128, 0.2)', borderTop: '3px solid #c5a880', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6b7280', fontSize: 14 }}>Connecting to account...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 500, margin: '0 auto', padding: 'clamp(48px, 8vh, 96px) 24px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(197,168,128,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#c5a880' }}>
          <Lock size={32} />
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12, fontFamily: 'var(--font-serif)' }}>Authentication Required</h2>
        <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
          You must log in to track your orders. Simply register or sign in with the email you used when ordering to check delivery details.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login?redirect=/track-order" className="btn-gold" style={{ textDecoration: 'none', padding: '14px 28px' }}>
            Sign In to Account
          </Link>
          <Link href="/" className="btn-outline" style={{ textDecoration: 'none', padding: '14px 28px', color: '#1e1a1d', borderColor: '#eae3dc' }}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = selectedOrder ? (STATUS_MAP[selectedOrder.status]?.step ?? 1) : 1;
  const isCancelled = selectedOrder?.status === 'cancelled';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px, 5vw, 48px) clamp(12px, 4vw, 24px)', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 'clamp(24px, 5vw, 40px)' }}>
        <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: 800, margin: '0 0 8px', fontFamily: 'var(--font-serif)' }}>
          Track Your <span className="gradient-brand-text">Orders</span>
        </h1>
        <p style={{ color: '#6b7280', fontSize: 16, margin: 0 }}>View your purchase history and live delivery tracking status.</p>
      </div>

      {loading && orders.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(197,168,128,.15)', borderTop: '3px solid #c5a880', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : error ? (
        <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 12, color: '#dc2626', background: '#fff5f5', border: '1px solid #fecaca' }}>
          <AlertCircle size={20} />
          <div>
            <p style={{ margin: 0, fontWeight: 700 }}>Error loading orders</p>
            <p style={{ margin: 0, fontSize: 13 }}>{error}</p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center', background: '#fff', border: '1px solid #eae3dc', borderRadius: 20 }}>
          <ShoppingBag size={48} style={{ opacity: .3, color: '#c5a880', marginBottom: 16 }} />
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No orders found</h3>
          <p style={{ color: '#6b7280', maxWidth: 440, margin: '0 auto 24px', fontSize: 14 }}>
            It looks like you haven't placed any orders yet. Check out our store page to browse cute plush toys and gifts!
          </p>
          <Link href="/shop" className="btn-gold" style={{ textDecoration: 'none' }}>Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 32 }} className="tracking-layout">
          {/* Left panel: Orders list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
              Your Orders ({orders.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '65vh', overflowY: 'auto', paddingRight: 4 }}>
              {orders.map((o) => {
                const isSelected = selectedOrder?.id === o.id;
                return (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    style={{
                      padding: 20,
                      background: '#fff',
                      border: isSelected ? '2.5px solid #c5a880' : '1px solid #eae3dc',
                      borderRadius: 16,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 8px 24px rgba(197,168,128,0.12)' : '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e1a1d' }}>#{o.orderNumber}</p>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} /> {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <StatusBadge status={o.status} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px dashed #f0eded' }}>
                      <span style={{ fontSize: 13, color: '#6b7280' }}>
                        {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#c5a880' }}>
                        Rs. {o.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel: Active order details & stepper */}
          {selectedOrder && (
            <div className="card tracking-details-card" style={{ background: '#fff', border: '1px solid #eae3dc', borderRadius: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
              
              {/* Stepper Timeline */}
              {!isCancelled ? (
                <div style={{ marginBottom: 40 }}>
                  <h4 style={{ margin: '0 0 24px', fontSize: 15, fontWeight: 700, color: '#88', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Delivery Progress
                  </h4>
                  {/* Stepper Line wrapper */}
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 500, margin: '0 auto 12px' }}>
                    {/* Stepper Bar background */}
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 3, background: '#e5e7eb', transform: 'translateY(-50%)', zIndex: 1 }} />
                    {/* Active Progress Bar */}
                    <div style={{
                      position: 'absolute', top: '50%', left: 0,
                      width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
                      height: 3, background: 'linear-gradient(90deg, #c5a880, #e5b3b3)',
                      transform: 'translateY(-50%)', zIndex: 1,
                      transition: 'width 0.4s ease'
                    }} />

                    {STEPS.map((step) => {
                      const isActive = step.step <= currentStep;
                      return (
                        <div key={step.step} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div
                            className="stepper-circle"
                            style={{
                              borderRadius: '50%',
                              background: '#fff',
                              borderStyle: 'solid',
                              borderColor: isActive ? '#c5a880' : '#e5e7eb',
                              boxShadow: isActive ? '0 4px 10px rgba(197, 168, 128, 0.3)' : 'none',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: isActive ? '#c5a880' : '#9ca3af',
                              fontWeight: 700, transition: 'all 0.3s ease'
                            }}
                          >
                            {isActive ? <CheckCircle2 className="stepper-check-icon" color="#c5a880" fill="#fff" /> : step.step}
                          </div>
                          <span
                            className="stepper-label"
                            style={{
                              fontWeight: isActive ? 700 : 500,
                              color: isActive ? '#c5a880' : '#9ca3af',
                            }}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div style={{ textAlign: 'center', background: '#faf8f6', border: '1px solid #f0eded', borderRadius: 12, padding: '12px 16px', marginTop: 24, fontSize: 14 }}>
                    <strong>Status:</strong> {STATUS_MAP[selectedOrder.status]?.desc}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '16px 20px', color: '#b91c1c', fontSize: 14, marginBottom: 32 }}>
                  <AlertCircle size={22} style={{ flexShrink: 0 }} />
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 700 }}>Order Cancelled</h4>
                    <p style={{ margin: '4px 0 0', color: '#991b1b', fontSize: 13 }}>This order has been cancelled by the admin. Please contact support if this was an error.</p>
                  </div>
                </div>
              )}

              {/* Order Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '24px 0', borderTop: '1px solid #eae3dc', borderBottom: '1px solid #eae3dc' }} className="details-grid-2">
                <div>
                  <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Delivery Address</h4>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1e1a1d' }}>{selectedOrder.customer.name}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                    {selectedOrder.customer.address}, {selectedOrder.customer.city}
                  </p>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Payment Method</h4>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1e1a1d', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {selectedOrder.paymentMethod === 'cod' ? (
                      <>💶 Cash on Delivery (COD)</>
                    ) : selectedOrder.paymentMethod === 'bank_transfer' ? (
                      <>🏛️ Bank Transfer</>
                    ) : (
                      <>💳 Card Payment</>
                    )}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 700, color: selectedOrder.isPaid ? '#00695c' : '#c62828' }}>
                    {selectedOrder.isPaid ? '✓ Paid' : '✗ Unpaid / Processing Slip'}
                  </p>
                </div>
              </div>

              {/* Order Items list */}
              <div style={{ padding: '24px 0 0' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#88', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Items Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f5f5f5', overflow: 'hidden', position: 'relative', border: '1px solid #f0f0f0', flexShrink: 0 }}>
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eae3dc', color: '#c5a880' }}><Package size={16} /></div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1e1a1d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>
                          Rs. {item.price.toLocaleString()} × {item.qty}
                        </p>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1e1a1d' }}>
                        Rs. {(item.price * item.qty).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals card */}
                <div style={{ background: '#faf8f6', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid #f0eded' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
                    <span>Subtotal</span>
                    <span>Rs. {selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#00695c', fontWeight: 500 }}>
                      <span>Discount</span>
                      <span>-Rs. {selectedOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
                    <span>Shipping Fee</span>
                    <span>{selectedOrder.shippingFee === 0 ? 'Free' : `Rs. ${selectedOrder.shippingFee.toLocaleString()}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#1e1a1d', borderTop: '1.5px solid #eae3dc', paddingTop: 10, marginTop: 4 }}>
                    <span>Total Amount</span>
                    <span className="gradient-brand-text">Rs. {selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Status history log details */}
                <div style={{ marginTop: 32 }}>
                  <h4 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status Logs</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderLeft: '2px solid #eae3dc', paddingLeft: 16, marginLeft: 8 }}>
                    {selectedOrder.statusHistory?.map((log, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: -21, top: 4, width: 8, height: 8, borderRadius: '50%', background: '#c5a880' }} />
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e1a1d', textTransform: 'capitalize' }}>
                          {STATUS_MAP[log.status]?.label ?? log.status}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>
                          {log.changedAt ? new Date(log.changedAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      )}

      <style>{`
        .tracking-details-card {
          padding: 32px 28px;
        }
        .stepper-circle {
          width: 32px;
          height: 32px;
          border-width: 3.5px;
          font-size: 12px;
        }
        .stepper-check-icon {
          width: 16px;
          height: 16px;
        }
        .stepper-label {
          font-size: 11px;
          margin-top: 8px;
          white-space: nowrap;
          text-align: center;
        }
        @media(max-width: 768px) {
          .tracking-layout {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .details-grid-2 {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
        @media(max-width: 640px) {
          .tracking-details-card {
            padding: 20px 16px !important;
          }
          .stepper-circle {
            width: 24px !important;
            height: 24px !important;
            border-width: 2.5px !important;
            font-size: 10px !important;
          }
          .stepper-check-icon {
            width: 12px !important;
            height: 12px !important;
          }
          .stepper-label {
            font-size: 9px !important;
            margin-top: 6px !important;
            white-space: normal !important;
            max-width: 55px !important;
            line-height: 1.1 !important;
          }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
