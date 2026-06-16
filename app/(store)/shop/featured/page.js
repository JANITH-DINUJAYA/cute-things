import { getFeaturedProducts } from '@/lib/firebase/server';
import ProductCard from '@/components/store/ProductCard';
import Link from 'next/link';

export const metadata = {
  title: 'Featured Products — Cute Things',
  description: 'Our hand-picked, most-loved cute plush toys, anime gifts & accessories. Curated collection with island-wide delivery.',
};

export const revalidate = 60;

export default async function FeaturedPage() {
  const featured = await getFeaturedProducts(24);

  return (
    <div style={{ minHeight: '70vh' }}>

      {/* Hero Header — distinct gold gradient for featured */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1a1d 0%, #2d2420 50%, #1e1a1d 100%)',
        padding: '56px 24px 48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative radial glow */}
        <div style={{
          position: 'absolute', top: '-30%', right: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(197,168,128,.18) 0%,transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-5%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(229,179,179,.1) 0%,transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Featured badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(197,168,128,0.15)', border: '1px solid rgba(197,168,128,0.3)',
            borderRadius: 9999, padding: '5px 14px', marginBottom: 16,
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#c5a880" stroke="#c5a880" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#c5a880', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Hand-Picked
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(30px,5vw,52px)',
            fontWeight: 300,
            fontFamily: 'var(--font-serif)',
            color: '#fff',
            margin: '0 0 12px',
            letterSpacing: '0.02em',
          }}>
            Featured{' '}
            <span style={{ background: 'linear-gradient(135deg,#c5a880,#e5b3b3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Products
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 15, margin: 0, fontWeight: 300 }}>
            Our most loved, hand-picked collection — {featured.length} item{featured.length !== 1 ? 's' : ''} curated just for you
          </p>
        </div>
      </div>

      {/* Gold accent divider */}
      <div style={{ height: 3, background: 'linear-gradient(90deg,transparent,#c5a880,#e5b3b3,#c5a880,transparent)' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>

        {featured.length > 0 ? (
          <>
            {/* Info strip */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 32, flexWrap: 'wrap', gap: 12,
            }}>
              <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
                Showing <strong style={{ color: '#1e1a1d' }}>{featured.length}</strong> featured products
              </p>
              <Link href="/shop" style={{
                fontSize: 13, fontWeight: 600, color: '#c5a880',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 9999,
                border: '1.5px solid rgba(197,168,128,0.3)',
                background: 'rgba(197,168,128,0.05)',
              }}>
                View All Products →
              </Link>
            </div>

            {/* Featured grid — slightly larger cards with gold shadow */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 28,
            }}>
              {featured.map((p) => (
                <div key={p.id} style={{
                  borderRadius: 16,
                  boxShadow: '0 0 0 2px rgba(197,168,128,0.15), 0 8px 32px rgba(197,168,128,0.08)',
                  transition: 'box-shadow 0.3s ease',
                }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(197,168,128,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', color: '#c5a880',
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>No featured products yet</h2>
            <p style={{ color: '#6b7280', marginBottom: 24 }}>
              Mark products as "Featured" in the admin panel to showcase them here.
            </p>
            <Link href="/shop" className="btn-gold" style={{ textDecoration: 'none' }}>
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
