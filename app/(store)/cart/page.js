'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useCartStore from '@/store/cartStore';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const router  = useRouter();
  const items   = useCartStore((s) => s.items);
  const remove  = useCartStore((s) => s.removeItem);
  const setQty  = useCartStore((s) => s.setQuantity);
  const subtotal   = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const totalQty   = items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    // Fire pixel
    if (typeof window !== 'undefined' && items.length > 0) {
      window.fbq?.('track', 'InitiateCheckout', { value: subtotal, currency: 'LKR', num_items: items.length });
    }
  }, []);

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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 32, alignItems: 'start' }}>

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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b7280' }}>
              <span>Subtotal ({totalQty} {totalQty === 1 ? 'item' : 'items'})</span>
              <span style={{ color: '#1a1a2e', fontWeight: 600 }}>Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6b7280' }}>
              <span>Shipping</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>Calculated at checkout</span>
            </div>
          </div>

          <div style={{ borderTop: '1.5px solid #f0f0f0', paddingTop: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800 }}>
              <span>Total</span>
              <span style={{ color: '#e91e8c' }}>Rs. {subtotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            id="proceed-to-checkout"
            onClick={() => router.push('/checkout')}
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
        @media (max-width: 768px) {
          div[style*="grid-template-columns: minmax"] { grid-template-columns: 1fr !important; }
          div[style*="position: sticky"] { position: static !important; }
        }
      `}</style>
    </div>
  );
}
