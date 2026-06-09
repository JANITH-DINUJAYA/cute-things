'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import useCartStore from '@/store/cartStore';
import { ShoppingCart, ArrowLeft, Check, Minus, Plus, Share2, Heart } from 'lucide-react';
import { notFound } from 'next/navigation';

async function getProduct(slug) {
  const q = query(
    collection(db, 'products'),
    where('slug', '==', slug),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export default function ProductDetailClient({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty,     setQty]     = useState(1);
  const [imgIdx,  setImgIdx]  = useState(0);
  const [added,   setAdded]   = useState(false);

  const {
    id, name, description, price, discountPrice,
    images = [], stock, status, isFeatured,
  } = product;

  const displayPrice = discountPrice ?? price;
  const savings      = discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const isOutOfStock = status === 'out_of_stock' || stock === 0;

  useEffect(() => {
    // ViewContent pixel
    window.fbq?.('track', 'ViewContent', { content_ids: [id], content_type: 'product', value: displayPrice, currency: 'LKR' });
    window.ttq?.track('ViewContent', { content_id: id, value: displayPrice, currency: 'LKR' });
  }, []);

  function handleAddToCart() {
    if (isOutOfStock) return;
    for (let i = 0; i < qty; i++) addItem(product, i === 0 ? qty : 0);
    // Fire pixel
    window.fbq?.('track', 'AddToCart', { content_ids: [id], value: displayPrice * qty, currency: 'LKR' });
    window.ttq?.track('AddToCart', { content_id: id, value: displayPrice * qty, currency: 'LKR' });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, fontSize: 14, color: '#6b7280' }}>
        <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <Link href="/shop" style={{ color: '#6b7280', textDecoration: 'none' }}>Shop</Link>
        <span>/</span>
        <span style={{ color: '#e91e8c', fontWeight: 600 }}>{name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

        {/* Images */}
        <div>
          {/* Main image */}
          <div style={{
            borderRadius: 20, overflow: 'hidden',
            background: '#f9f0ff', aspectRatio: '1/1',
            position: 'relative', marginBottom: 12,
            boxShadow: '0 4px 24px rgba(233,30,140,.08)',
          }}>
            {images[imgIdx] ? (
              <Image src={images[imgIdx]} alt={name} fill
                style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 50vw" priority />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>🌸</div>
            )}
            {isFeatured && (
              <span className="badge badge-pink" style={{ position: 'absolute', top: 16, left: 16, fontSize: 12 }}>⭐ Featured</span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  style={{
                    width: 68, height: 68, borderRadius: 10, overflow: 'hidden',
                    border: `2px solid ${i === imgIdx ? '#e91e8c' : '#e5e7eb'}`,
                    cursor: 'pointer', background: '#f9f0ff', padding: 0,
                    transition: 'border-color .2s',
                  }}>
                  <Image src={img} alt={`${name} ${i + 1}`} width={68} height={68} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, color: '#1a1a2e', margin: '0 0 12px', lineHeight: 1.3 }}>{name}</h1>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: '#e91e8c' }}>Rs. {displayPrice.toLocaleString()}</span>
            {discountPrice && (
              <>
                <span style={{ fontSize: 18, color: '#9ca3af', textDecoration: 'line-through' }}>Rs. {price.toLocaleString()}</span>
                <span className="badge badge-green" style={{ fontSize: 13 }}>Save {savings}%</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div style={{ marginBottom: 24 }}>
            {isOutOfStock ? (
              <span className="badge badge-gray">Out of Stock</span>
            ) : stock <= 5 ? (
              <span className="badge badge-yellow">⚡ Only {stock} left!</span>
            ) : (
              <span className="badge badge-green">✓ In Stock</span>
            )}
          </div>

          {/* Description */}
          {description && (
            <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.8, marginBottom: 28 }}>
              {description}
            </p>
          )}

          {/* Quantity + Add to Cart */}
          {!isOutOfStock && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Quantity</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))}
                    style={{ width: 40, height: 40, background: '#f9fafb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={16} />
                  </button>
                  <span style={{ width: 48, textAlign: 'center', fontSize: 16, fontWeight: 700 }}>{qty}</span>
                  <button onClick={() => setQty(Math.min(stock || 99, qty + 1))}
                    style={{ width: 40, height: 40, background: '#f9fafb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={16} />
                  </button>
                </div>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>{stock} available</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
            <button
              id={`pdp-add-to-cart-${id}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="btn-primary"
              style={{
                flex: 1, minWidth: 160, fontSize: 16, padding: '14px 24px',
                opacity: isOutOfStock ? 0.5 : 1,
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                background: added ? 'linear-gradient(135deg,#10b981,#059669)' : undefined,
              }}
            >
              {added ? <><Check size={18} /> Added to Cart!</> : <><ShoppingCart size={18} /> Add to Cart</>}
            </button>

            <Link href="/checkout"
              onClick={() => { if (!isOutOfStock) addItem(product, qty); }}
              className="btn-outline"
              style={{ textDecoration: 'none', flex: 1, minWidth: 140, fontSize: 15, padding: '14px 24px', textAlign: 'center' }}>
              Buy Now →
            </Link>
          </div>

          {/* Trust badges */}
          <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 14, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['🚚 Cash on Delivery — Pay when you receive', '📦 Island-wide delivery across Sri Lanka', '💖 Carefully packaged with love'].map((b) => (
              <div key={b} style={{ fontSize: 13, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 8 }}>{b}</div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
