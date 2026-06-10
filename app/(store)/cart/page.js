'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useCartStore from '@/store/cartStore';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function CartPage() {
  const router  = useRouter();
  const items   = useCartStore((s) => s.items);
  const remove  = useCartStore((s) => s.removeItem);
  const setQty  = useCartStore((s) => s.setQuantity);
  const subtotal   = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const totalQty   = items.reduce((s, i) => s + i.quantity, 0);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState(null); // null | 'loading' | 'valid' | 'invalid'
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount, type, value }

  const discount  = appliedCoupon?.discount ?? 0;
  const finalTotal = Math.max(0, subtotal - discount);

  useEffect(() => {
    // Fire pixel
    if (typeof window !== 'undefined' && items.length > 0) {
      window.fbq?.('track', 'InitiateCheckout', { value: subtotal, currency: 'LKR', num_items: items.length });
    }
  }, []);

  async function handleApplyCoupon(e) {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponStatus('loading');
    setCouponError('');
    setAppliedCoupon(null);

    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCouponStatus('invalid');
        setCouponError(data.error || 'Invalid coupon code.');
      } else {
        setCouponStatus('valid');
        setAppliedCoupon(data);
      }
    } catch {
      setCouponStatus('invalid');
      setCouponError('Could not validate coupon. Please try again.');
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponStatus(null);
    setCouponError('');
  }

  function handleCheckout() {
    // Store coupon info in sessionStorage for checkout to pick up
    if (appliedCoupon) {
      sessionStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    } else {
      sessionStorage.removeItem('appliedCoupon');
    }
    router.push('/checkout');
  }

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🛒</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Your cart is empty</h1>
        <p style={{ color: '#6b7280', marginBottom: 32 }}>Discover our cute collection and add something adorable!</p>
        <Link href="/shop" className="btn-primary" style={{ textDecoration: 'none', fontSize: 16, padding: '14px 32px' }}>
          <ShoppingBag size={18} /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px', minHeight: '70vh' }}>
      <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6b7280', textDecoration: 'none', fontSize: 14, marginBottom: 32 }}>
        <ArrowLeft size={16} /> Continue Shopping
      </Link>

      <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, marginBottom: 40 }}>
        Shopping Cart <span className="gradient-brand-text">({totalQty} {totalQty === 1 ? 'item' : 'items'})</span>
      </h1>

      <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 32, alignItems: 'start' }}>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', gap: 16, padding: 20, alignItems: 'center' }}>
              {/* Image */}
              <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', background: '#f9f0ff', flexShrink: 0 }}>
                {item.image ? (
                  <Image src={item.image} alt={item.name} width={80} height={80} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🌸</div>
                )}
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link href={`/product/${item.slug}`} style={{ textDecoration: 'none' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', marginBottom: 4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h3>
                </Link>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#e91e8c', margin: 0 }}>
                  Rs. {item.price.toLocaleString()}
                </p>
              </div>

              {/* Quantity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => item.quantity <= 1 ? remove(item.id) : setQty(item.id, item.quantity - 1)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ fontSize: 15, fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                <button
                  onClick={() => setQty(item.id, item.quantity + 1)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Subtotal & Remove */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </p>
                <button
                  id={`remove-${item.id}`}
                  onClick={() => remove(item.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, marginLeft: 'auto' }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card" style={{ padding: 28, position: 'sticky', top: 88 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Order Summary</h2>

          {/* Coupon Code Input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 8 }}>
              <Tag size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Promo / Coupon Code
            </label>

            {appliedCoupon ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={16} color="#10b981" />
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#065f46', fontFamily: 'monospace' }}>{appliedCoupon.code}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#10b981' }}>
                      {appliedCoupon.type === 'percentage'
                        ? `${appliedCoupon.value}% discount applied`
                        : `Rs. ${appliedCoupon.value.toLocaleString()} off applied`}
                    </p>
                  </div>
                </div>
                <button onClick={removeCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4 }}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: 8 }}>
                <input
                  id="coupon-code-input"
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value); setCouponStatus(null); setCouponError(''); }}
                  placeholder="Enter coupon code"
                  className="input"
                  style={{ flex: 1, textTransform: 'uppercase', fontSize: 13, padding: '10px 12px' }}
                />
                <button
                  type="submit"
                  disabled={couponStatus === 'loading' || !couponInput.trim()}
                  style={{
                    padding: '10px 16px', background: '#1a1a2e', color: '#fff',
                    border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor: couponStatus === 'loading' || !couponInput.trim() ? 'not-allowed' : 'pointer',
                    opacity: couponStatus === 'loading' || !couponInput.trim() ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {couponStatus === 'loading' ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Apply'}
                </button>
              </form>
            )}

            {couponStatus === 'invalid' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: '#dc2626', fontSize: 12 }}>
                <AlertCircle size={13} /> {couponError}
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b7280' }}>
              <span>Subtotal ({totalQty} {totalQty === 1 ? 'item' : 'items'})</span>
              <span style={{ color: '#1a1a2e', fontWeight: 600 }}>Rs. {subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#10b981' }}>
                <span>Coupon Discount</span>
                <span style={{ fontWeight: 600 }}>- Rs. {discount.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b7280' }}>
              <span>Shipping</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Calculated at checkout</span>
            </div>
          </div>

          <div style={{ borderTop: '1.5px solid #f0f0f0', paddingTop: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800 }}>
              <span>Total</span>
              <span style={{ color: '#e91e8c' }}>Rs. {finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            id="proceed-to-checkout"
            onClick={handleCheckout}
            className="btn-primary"
            style={{ width: '100%', fontSize: 16, padding: 14 }}
          >
            Proceed to Checkout →
          </button>

          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#9ca3af', fontSize: 12 }}>
            🔒 Secure checkout · Cash on Delivery
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .cart-layout { grid-template-columns: 1fr !important; }
          div[style*="position: sticky"] { position: static !important; }
        }
      `}</style>
    </div>
  );
}
