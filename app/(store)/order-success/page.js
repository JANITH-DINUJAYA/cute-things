import Link from 'next/link';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';

export const metadata = { title: 'Order Confirmed! — Cute Things' };

export default function OrderSuccessPage({ searchParams }) {
  const orderNumber = searchParams?.order ?? '';

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        {/* Success animation */}
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
          boxShadow: '0 8px 32px rgba(16,185,129,.35)',
          animation: 'scaleIn .5s cubic-bezier(.175,.885,.32,1.275)',
        }}>
          <CheckCircle size={50} color="#fff" fill="rgba(255,255,255,.15)" />
        </div>

        <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, color: '#1a1a2e', marginBottom: 12 }}>
          🎉 Order Placed!
        </h1>

        {orderNumber && (
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #fce4ec, #f3e5f5)',
            border: '1.5px solid #f8bbd0',
            borderRadius: 12, padding: '10px 24px', marginBottom: 20,
          }}>
            <span style={{ fontSize: 14, color: '#6b7280' }}>Order Number: </span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#e91e8c' }}>#{orderNumber}</span>
          </div>
        )}

        <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.7, marginBottom: 12 }}>
          Thank you for shopping with <strong>Cute Things</strong>! 💖 <br />
          Your order has been received and our team will process it shortly.
        </p>
        <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 40 }}>
          A confirmation email has been sent to you. <br />
          You will receive updates on your order status.
        </p>

        {/* Steps */}
        <div style={{
          background: '#fafafa', border: '1px solid #f0f0f0',
          borderRadius: 16, padding: '24px', marginBottom: 36, textAlign: 'left',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 16 }}>What happens next?</h3>
          {[
            { step: '1', label: 'Order Confirmed',  desc: 'We\'ve received your order'          },
            { step: '2', label: 'Processing',       desc: 'We\'re preparing your cute items'    },
            { step: '3', label: 'Dispatched',       desc: 'Your package is on the way 🚚'       },
            { step: '4', label: 'Delivered',        desc: 'Pay with cash when it arrives'       },
          ].map((s, i) => (
            <div key={s.step} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: i < 3 ? 16 : 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #e91e8c, #9c27b0)',
                color: '#fff', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{s.step}</div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/shop" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 28px' }}>
            <ShoppingBag size={16} /> Shop More
          </Link>
          <Link href="/" className="btn-outline" style={{ textDecoration: 'none', padding: '12px 28px' }}>
            <Home size={16} /> Go Home
          </Link>
        </div>

        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0); opacity: 0; }
            to   { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
