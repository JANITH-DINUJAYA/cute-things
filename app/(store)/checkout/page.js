'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import useCartStore from '@/store/cartStore';
import useSettingsStore from '@/store/settingsStore';
import { ArrowLeft, CheckCircle, Truck, User, Phone, MapPin, FileText, AlertCircle, Tag } from 'lucide-react';

export default function CheckoutPage() {
  const router   = useRouter();
  const items    = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const shippingSettings = useSettingsStore((s) => s.shipping);
  const defaultFee = shippingSettings?.defaultFee ?? 350;
  const freeShippingThreshold = shippingSettings?.freeShippingThreshold ?? 5000;

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('appliedCoupon');
      if (saved) {
        setAppliedCoupon(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error reading appliedCoupon from sessionStorage', e);
    }
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  // Calculate discount
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discount = Math.min(appliedCoupon.value, subtotal);
    }
  }

  // Calculate dynamic shipping fee
  const shippingFee = (freeShippingThreshold && subtotal >= freeShippingThreshold) ? 0 : defaultFee;
  const total = Math.max(0, subtotal - discount) + shippingFee;

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', postalCode: '', notes: '',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // Fire pixel on mount
  useEffect(() => {
    window.fbq?.('track', 'InitiateCheckout', { value: total, currency: 'LKR', num_items: items.length });
    window.ttq?.track('InitiateCheckout', { value: total, currency: 'LKR' });
  }, [total, items.length]);

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontSize: 64 }}>🛒</div>
        <h2 style={{ fontWeight: 800 }}>Your cart is empty</h2>
        <Link href="/shop" className="btn-primary" style={{ textDecoration: 'none' }}>Back to Shop</Link>
      </div>
    );
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.phone || !form.address || !form.city) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer:    form,
          items:       items.map((i) => ({ productId: i.id, name: i.name, price: i.price, qty: i.quantity, image: i.image })),
          couponCode:  appliedCoupon?.code || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order failed');

      // Fire Purchase pixel
      window.fbq?.('track', 'Purchase', { value: total, currency: 'LKR', content_ids: items.map((i) => i.id) });
      window.ttq?.track('CompletePayment', { value: total, currency: 'LKR' });

      sessionStorage.removeItem('appliedCoupon');
      clearCart();
      router.push(`/order-success?order=${data.orderNumber}`);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const Field = ({ label, name, type = 'text', placeholder, required, textarea }) => (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label} {required && <span style={{ color: '#e91e8c' }}>*</span>}
      </label>
      {textarea ? (
        <textarea name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} rows={3}
          className="input" style={{ resize: 'vertical', fontFamily: 'inherit' }} />
      ) : (
        <input name={name} type={type} value={form[name]} onChange={handleChange}
          placeholder={placeholder} required={required} className="input" />
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px', minHeight: '70vh' }}>
      <Link href="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6b7280', textDecoration: 'none', fontSize: 14, marginBottom: 32 }}>
        <ArrowLeft size={16} /> Back to Cart
      </Link>

      <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, marginBottom: 40 }}>
        Checkout <span className="gradient-brand-text">💖</span>
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="checkout-layout">

          {/* Customer form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Error */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', color: '#dc2626', fontSize: 14 }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Personal Info */}
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={18} color="#e91e8c" /> Personal Information
              </h2>
              <div className="checkout-form-grid">
                <Field label="Full Name"     name="name"  placeholder="Eg: Janith Perera" required />
                <Field label="Phone Number"  name="phone" placeholder="07X XXX XXXX"       required type="tel" />
              </div>
              <div style={{ marginTop: 16 }}>
                <Field label="Email Address" name="email" placeholder="your@email.com"     required type="email" />
              </div>
            </div>

            {/* Delivery address */}
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={18} color="#e91e8c" /> Delivery Address
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Street Address" name="address"    placeholder="No. 123, Main Street, Colombo 07" required />
                <div className="checkout-form-grid">
                  <Field label="City"        name="city"        placeholder="Colombo"  required />
                  <Field label="Postal Code" name="postalCode"  placeholder="00700"   />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color="#e91e8c" /> Order Notes (Optional)
              </h2>
              <Field label="Special instructions or notes" name="notes" placeholder="Any delivery notes, gift messages, etc." textarea />
            </div>

            {/* Payment Method */}
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Truck size={18} color="#e91e8c" /> Payment Method
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f0fdf4', border: '2px solid #10b981', borderRadius: 12, padding: '14px 18px' }}>
                <CheckCircle size={20} color="#10b981" fill="#10b981" />
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: '#065f46' }}>Cash on Delivery</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#047857' }}>Pay when your order arrives at your door</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="card checkout-summary-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Your Order</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: '#f9f0ff', flexShrink: 0 }}>
                    {item.image
                      ? <Image src={item.image} alt={item.name} width={48} height={48} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                      : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌸</div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>x{item.quantity}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', flexShrink: 0 }}>
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1.5px solid #f0f0f0', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b7280' }}>
                <span>Subtotal</span><span style={{ color: '#1a1a2e', fontWeight: 600 }}>Rs. {subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#10b981' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Tag size={12} /> Discount ({appliedCoupon.code})</span>
                  <span style={{ fontWeight: 600 }}>- Rs. {discount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b7280' }}>
                <span>Shipping</span>
                <span style={{ color: shippingFee === 0 ? '#10b981' : '#1a1a2e', fontWeight: 600 }}>
                  {shippingFee === 0 ? 'FREE' : `Rs. ${shippingFee.toLocaleString()}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, borderTop: '1.5px solid #f0f0f0', paddingTop: 12, marginTop: 4 }}>
                <span>Total</span><span style={{ color: '#e91e8c' }}>Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              id="place-order-btn"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', fontSize: 16, padding: 14, marginTop: 24, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Placing Order…' : '🛍️ Place Order (COD)'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 12 }}>
              🔒 Your information is safe and secure
            </p>
          </div>
        </div>
      </form>

      <style>{`
        .checkout-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 32px;
          align-items: start;
        }
        .checkout-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .checkout-summary-card {
          position: sticky;
          top: 88px;
        }
        @media (max-width: 768px) {
          .checkout-layout {
            grid-template-columns: 1fr !important;
          }
          .checkout-summary-card {
            position: static !important;
          }
          .checkout-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
