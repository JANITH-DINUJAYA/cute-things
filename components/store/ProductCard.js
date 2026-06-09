'use client';

import Image from 'next/image';
import Link  from 'next/link';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const {
    id, name, slug, images = [], price, discountPrice,
    status, isFeatured,
  } = product;

  const displayImage = images[0] || null;
  const isOutOfStock = status === 'out_of_stock';
  const savings      = discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0;

  function handleAddToCart(e) {
    e.preventDefault();
    if (isOutOfStock) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);

    // Fire pixel events
    if (typeof window !== 'undefined') {
      window.fbq?.('track', 'AddToCart', { content_ids: [id], value: discountPrice ?? price, currency: 'LKR' });
      window.ttq?.track('AddToCart', { content_id: id, value: discountPrice ?? price, currency: 'LKR' });
    }
  }

  return (
    <Link href={`/product/${slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="card"
        style={{ overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
      >
        {/* Badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {isFeatured && (
            <span className="badge badge-pink" style={{ fontSize: 11 }}>⭐ Featured</span>
          )}
          {savings > 0 && (
            <span className="badge badge-green" style={{ fontSize: 11 }}>-{savings}%</span>
          )}
          {isOutOfStock && (
            <span className="badge badge-gray" style={{ fontSize: 11 }}>Out of Stock</span>
          )}
        </div>

        {/* Image */}
        <div style={{
          position: 'relative', aspectRatio: '1/1',
          background: '#faf8f6', overflow: 'hidden',
          borderBottom: '1px solid rgba(197, 168, 128, 0.08)',
        }}>
          {displayImage ? (
            <Image
              src={displayImage}
              alt={name}
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              style={{ objectFit: 'cover', transition: 'transform .4s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 48 }}>
              🌸
            </div>
          )}

          {/* Hover overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(197,168,128,.0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity .25s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(197,168,128,.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; e.currentTarget.style.background = 'rgba(197,168,128,.0)'; }}
          >
            <span className="badge badge-yellow" style={{ fontSize: 12, padding: '6px 14px', background: '#fff', border: '1px solid #c5a880' }}>
              <Eye size={12} style={{ marginRight: 4 }} /> Quick View
            </span>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '14px 16px 16px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 500, color: '#1e1a1d', margin: '0 0 8px', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {name}
          </h3>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1e1a1d' }}>
              Rs. {(discountPrice ?? price).toLocaleString()}
            </span>
            {discountPrice && (
              <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' }}>
                Rs. {price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <button
            id={`add-to-cart-${id}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="btn-primary"
            style={{
              width: '100%', padding: '10px', fontSize: 13,
              opacity: isOutOfStock ? 0.5 : 1,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              background: added ? 'linear-gradient(135deg,#10b981,#059669)' : undefined,
            }}
          >
            <ShoppingCart size={14} />
            {added ? '✓ Added!' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}
