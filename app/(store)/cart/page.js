'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useCartStore from '@/store/cartStore';
import useSettingsStore from '@/store/settingsStore';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function CartPage() {
  const router  = useRouter();
  const items   = useCartStore((s) => s.items);
  const remove  = useCartStore((s) => s.removeItem);
  const setQty  = useCartStore((s) => s.setQuantity);
  const subtotal   = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const totalQty   = items.reduce((s, i) => s + i.quantity, 0);

  const shippingSettings = useSettingsStore((s) => s.shipping);
  const defaultFee = shippingSettings?.defaultFee ?? 350;
  const freeShippingThreshold = shippingSettings?.freeShippingThreshold ?? 5000;

  const freeShippingTarget = freeShippingThreshold ? Math.max(0, freeShippingThreshold - subtotal) : 0;

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

      <div className="cart-layout">

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map((item) => (
            <div key={item.id} className="card cart-item-card">
              {/* Image */}
              <div className="cart-item-image-wrapper">
                {item.image ? (
                  <Image src={item.image} alt={item.name} width={80} height={80} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🌸</div>
                )}
              </div>

              {/* Details */}
              <div className="cart-item-details">
                <Link href={`/product/${item.slug}`} style={{ textDecoration: 'none' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', marginBottom: 4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h3>
                </Link>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#e91e8c', margin: 0 }}>
                  Rs. {item.price.toLocaleString()}
                </p>
              </div>

              {/* Quantity */}
              <div className="cart-item-quantity">
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
              <div className="cart-item-totals">
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
        <div className="card cart-summary-card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Order Summary</h2>

          {/* Free Shipping Indicator */}
          {freeShippingThreshold && (
            <div style={{
              background: freeShippingTarget > 0 ? 'rgba(197, 168, 128, 0.08)' : '#ecfdf5',
              border: `1px solid ${freeShippingTarget > 0 ? 'rgba(197, 168, 128, 0.2)' : '#a7f3d0'}`,
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 13,
              marginBottom: 20,
              color: freeShippingTarget > 0 ? '#1e1a1d' : '#065f46',
              fontWeight: 500,
            }}>
              {freeShippingTarget > 0 ? (
                <>🎉 Add <strong style={{ color: '#e91e8c' }}>Rs. {freeShippingTarget.toLocaleString()}</strong> more to get <strong>FREE shipping</strong>!</>
              ) : (
                <>🎉 You qualify for <strong>FREE shipping</strong>!</>
              )}
            </div>
          )}

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
              <span style={{ color: freeShippingTarget === 0 ? '#10b981' : '#1a1a2e', fontWeight: 600 }}>
                {freeShippingTarget === 0 ? 'FREE' : `Rs. ${defaultFee.toLocaleString()}`}
              </span>
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
        
        .cart-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 32px;
          align-items: start;
        }

        .cart-item-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          align-items: center;
        }

        .cart-item-image-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          overflow: hidden;
          background: #f9f0ff;
          flex-shrink: 0;
        }

        .cart-item-details {
          flex: 1;
          min-width: 0;
        }

        .cart-item-quantity {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .cart-item-totals {
          text-align: right;
          flex-shrink: 0;
        }

        .cart-summary-card {
          position: sticky;
          top: 88px;
        }

        @media (max-width: 768px) {
          .cart-layout {
            grid-template-columns: 1fr !important;
          }
          .cart-summary-card {
            position: static !important;
          }
          .cart-item-card {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            padding: 16px !important;
          }
          .cart-item-image-wrapper {
            width: 64px !important;
            height: 64px !important;
          }
          .cart-item-details {
            width: 100% !important;
          }
          .cart-item-quantity {
            width: 100% !important;
            justify-content: flex-start !important;
            margin-top: 4px;
          }
          .cart-item-totals {
            width: 100% !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            border-top: 1px dashed #eae3dc;
            padding-top: 10px;
            margin-top: 4px;
          }
          .cart-item-totals p {
            margin: 0 !important;
          }
          .cart-item-totals button {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
