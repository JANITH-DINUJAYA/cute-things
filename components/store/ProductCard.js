'use client';

import Image from 'next/image';
import Link  from 'next/link';
import { ShoppingCart, Eye, Package } from 'lucide-react';
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
    <Link href={`/product/${slug}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        className="card"
        style={{ overflow: 'hidden', position: 'relative', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}
      >
        {/* Badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {isFeatured && (
            <span className="badge badge-pink product-card-badge" style={{ fontSize: 11 }}>⭐ Featured</span>
          )}
          {savings > 0 && (
            <span className="badge badge-green product-card-badge" style={{ fontSize: 11 }}>-{savings}%</span>
          )}
          {isOutOfStock && (
            <span className="badge badge-gray product-card-badge" style={{ fontSize: 11 }}>Out of Stock</span>
          )}
        </div>

        {/* Image container — touch-action prevents scroll jank */}
        <div style={{
          position: 'relative', aspectRatio: '1/1',
          background: '#faf8f6', overflow: 'hidden',
          borderBottom: '1px solid rgba(197, 168, 128, 0.08)',
          touchAction: 'pan-y',
        }}>
          {displayImage ? (
            <Image
              src={displayImage}
              alt={name}
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              className="product-card-img"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#c5a880' }}>
              <Package size={36} />
            </div>
          )}

          {/* Hover overlay — CSS-only, no JS handlers */}
          <div className="product-card-overlay" style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span className="badge badge-yellow" style={{ fontSize: 12, padding: '6px 14px', background: '#fff', border: '1px solid #c5a880', pointerEvents: 'none' }}>
              <Eye size={12} style={{ marginRight: 4 }} /> Quick View
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="product-card-info" style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <h3 className="product-card-title" style={{
            margin: '0 0 8px', minHeight: '40px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {name}
          </h3>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className="product-card-price">
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
            className="btn-primary product-card-btn"
            style={{
              width: '100%', padding: '10px', fontSize: 13,
              opacity: isOutOfStock ? 0.5 : 1,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              background: added ? 'linear-gradient(135deg,#10b981,#059669)' : undefined,
              marginTop: 'auto'
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
