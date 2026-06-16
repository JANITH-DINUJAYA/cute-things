'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import useCartStore from '@/store/cartStore';
import useSettingsStore from '@/store/settingsStore';
import { ArrowLeft, CheckCircle, Truck, User, Phone, MapPin, FileText, AlertCircle, Tag, Landmark, CreditCard, Upload, Package, LockKeyhole, ImageIcon } from 'lucide-react';

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
  
  // Payment States
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [slipFile, setSlipFile] = useState(null);
  const [slipUploading, setSlipUploading] = useState(false);
  const [slipUrl, setSlipUrl] = useState('');
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' });

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
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(197,168,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5a880' }}>
          <Package size={36} />
        </div>
        <h2 style={{ fontWeight: 800 }}>Your cart is empty</h2>
        <Link href="/shop" className="btn-gold" style={{ textDecoration: 'none' }}>Back to Shop</Link>
      </div>
    );
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleCardChange(e) {
    setCardForm((c) => ({ ...c, [e.target.name]: e.target.value }));
  }

  async function handleSlipUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setSlipFile(file);
    setSlipUploading(true);
    setError('');
    try {
      const reader = new FileReader();
      const base64 = await new Promise((res, rej) => {
        reader.onload = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      const resp = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, name: file.name }),
      });
      if (!resp.ok) throw new Error('Slip upload failed');
      const data = await resp.json();
      setSlipUrl(data.url);
    } catch (err) {
      setError('Failed to upload payment slip: ' + err.message);
    } finally {
      setSlipUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.phone || !form.address || !form.city) {
      setError('Please fill in all required fields.');
      return;
    }

    if (paymentMethod === 'bank_transfer' && !slipUrl) {
      setError('Please upload your bank transfer payment slip receipt.');
      return;
    }

    setLoading(true);
    
    // Mock processing for card payment
    if (paymentMethod === 'card') {
      await new Promise((r) => setTimeout(r, 1500));
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer:    form,
          items:       items.map((i) => ({ productId: i.id, name: i.name, price: i.price, qty: i.quantity, image: i.image })),
          couponCode:  appliedCoupon?.code || null,
          paymentMethod,
          paymentSlipUrl: paymentMethod === 'bank_transfer' ? slipUrl : null,
          isPaid: paymentMethod === 'card', // Card is instantly marked paid for showoff
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
        Checkout
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

            {/* Payment Method Selector */}
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CreditCard size={18} color="#e91e8c" /> Payment Method
              </h2>
              
              {/* Selector Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
                {/* COD Option */}
                <div
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  style={{
                    padding: '16px', borderRadius: 12, border: `2px solid ${paymentMethod === 'cod' ? '#c5a880' : '#f0f0f0'}`,
                    background: paymentMethod === 'cod' ? 'rgba(197,168,128,0.05)' : '#fff', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s'
                  }}
                >
                  <Truck size={24} color={paymentMethod === 'cod' ? '#c5a880' : '#9ca3af'} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1e1a1d', textAlign: 'center' }}>Cash on Delivery</span>
                </div>

                {/* Bank Transfer Option */}
                <div
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  style={{
                    padding: '16px', borderRadius: 12, border: `2px solid ${paymentMethod === 'bank_transfer' ? '#c5a880' : '#f0f0f0'}`,
                    background: paymentMethod === 'bank_transfer' ? 'rgba(197,168,128,0.05)' : '#fff', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s'
                  }}
                >
                  <Landmark size={24} color={paymentMethod === 'bank_transfer' ? '#c5a880' : '#9ca3af'} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1e1a1d', textAlign: 'center' }}>Bank Transfer</span>
                </div>

                {/* Card Payment (Showoff) */}
                <div
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  style={{
                    padding: '16px', borderRadius: 12, border: `2px solid ${paymentMethod === 'card' ? '#c5a880' : '#f0f0f0'}`,
                    background: paymentMethod === 'card' ? 'rgba(197,168,128,0.05)' : '#fff', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s'
                  }}
                >
                  <CreditCard size={24} color={paymentMethod === 'card' ? '#c5a880' : '#9ca3af'} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1e1a1d', textAlign: 'center' }}>Card Payment</span>
                </div>
              </div>

              {/* COD Form Details */}
              {paymentMethod === 'cod' && (
                <div style={{ background: '#fcfcfc', border: '1px solid #eaeaea', borderRadius: 12, padding: '20px' }}>
                  <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#1e1a1d', fontSize: 15 }}>Cash on Delivery Details</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                    Please note that we will call or WhatsApp you to verify your delivery details before dispatching your order. Make sure your phone number is active and reachable. You can pay cash to the courier once your package arrives at your door.
                  </p>
                </div>
              )}

              {/* Bank Transfer Form Details */}
              {paymentMethod === 'bank_transfer' && (
                <div style={{ background: '#fcfcfc', border: '1px solid #eaeaea', borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#1e1a1d', fontSize: 15 }}>Bank Account Information</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 13, background: '#fafafa', padding: 12, borderRadius: 8, border: '1px solid #f0f0f0' }}>
                      <div><strong>Bank:</strong> Sampath Bank</div>
                      <div><strong>Account Name:</strong> Cute Things Boutique</div>
                      <div><strong>Account Number:</strong> 0123 4567 8901</div>
                      <div><strong>Branch:</strong> Colombo Fort</div>
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                      Upload Payment Slip Screenshot <span style={{ color: '#e91e8c' }}>*</span>
                    </label>

                    {/* Upload button — hidden once slip is uploaded */}
                    {!slipUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <label style={{
                          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                          background: '#fff', border: '1.5px dashed #c5a880', borderRadius: 8,
                          cursor: slipUploading ? 'wait' : 'pointer', fontSize: 13, fontWeight: 600, color: '#c5a880'
                        }}>
                          <Upload size={16} /> {slipUploading ? 'Uploading...' : 'Choose File'}
                          <input type="file" accept="image/*" onChange={handleSlipUpload} disabled={slipUploading} style={{ display: 'none' }} />
                        </label>
                        {slipFile && !slipUrl && (
                          <span style={{ fontSize: 13, color: '#6b7280' }}>{slipFile.name.slice(0, 24)}</span>
                        )}
                      </div>
                    )}

                    {/* Receipt preview after upload */}
                    {slipUrl && (
                      <div style={{
                        marginTop: 12, borderRadius: 12, overflow: 'hidden',
                        border: '2px solid #10b981', background: '#f0fdf4'
                      }}>
                        {/* Success banner */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px', background: '#10b981'
                        }}>
                          <CheckCircle size={16} color="#fff" />
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Payment slip uploaded successfully!</span>
                        </div>
                        {/* Image preview */}
                        <div style={{ position: 'relative', width: '100%', maxHeight: 220, overflow: 'hidden', background: '#f9fafb' }}>
                          <img
                            src={slipUrl}
                            alt="Payment receipt"
                            style={{ width: '100%', height: 220, objectFit: 'contain', display: 'block' }}
                          />
                        </div>
                        {/* Footer */}
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 14px', background: '#fff'
                        }}>
                          <span style={{ fontSize: 12, color: '#6b7280' }}>
                            <ImageIcon size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                            {slipFile?.name?.slice(0, 28)}
                          </span>
                          <label style={{ fontSize: 12, color: '#c5a880', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Upload size={11} /> Change
                            <input type="file" accept="image/*" onChange={handleSlipUpload} style={{ display: 'none' }} />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Card Payment Form (Showoff) */}
              {paymentMethod === 'card' && (
                <div style={{ background: '#fcfcfc', border: '1px solid #eaeaea', borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#1e1a1d', fontSize: 15 }}>Enter Card Information</p>
                  <p style={{ margin: '0 0 12px', fontSize: 12, color: '#9ca3af' }}>Note: This payment portal is in sandbox/mock mode. Real transaction will not be made.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Cardholder Name</label>
                      <input name="name" value={cardForm.name} onChange={handleCardChange} placeholder="John Doe" className="input" style={{ padding: 10 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Card Number</label>
                      <input name="number" value={cardForm.number} onChange={handleCardChange} placeholder="4111 2222 3333 4444" className="input" style={{ padding: 10 }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Expiry Date</label>
                        <input name="expiry" value={cardForm.expiry} onChange={handleCardChange} placeholder="MM/YY" className="input" style={{ padding: 10 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>CVV</label>
                        <input name="cvv" type="password" maxLength={3} value={cardForm.cvv} onChange={handleCardChange} placeholder="•••" className="input" style={{ padding: 10 }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                      : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5a880' }}><Package size={20} /></div>
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
              disabled={loading || slipUploading}
              className="btn-gold"
              style={{ width: '100%', fontSize: 16, padding: 14, marginTop: 24, opacity: (loading || slipUploading) ? 0.7 : 1 }}
            >
              {loading ? 'Placing Order…' : slipUploading ? 'Uploading receipt...' : `Place Order (${paymentMethod.toUpperCase()})`}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <LockKeyhole size={11} /> Your information is safe and secure
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
