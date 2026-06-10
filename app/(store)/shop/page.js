import { getProducts, getCategories } from '@/lib/firebase/server';
import ProductCard from '@/components/store/ProductCard';
import Link from 'next/link';

export const metadata = {
  title: 'Shop All Products',
  description: 'Browse all cute plush toys, anime gifts, keychains and accessories from Cute Things Sri Lanka.',
};

export const revalidate = 30;

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  // Sort categories by sortOrder if present, otherwise by name
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.sortOrder != null && b.sortOrder != null) return a.sortOrder - b.sortOrder;
    if (a.sortOrder != null) return -1;
    if (b.sortOrder != null) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <div style={{ minHeight: '70vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#f5f0eb 0%,#eae3dc 100%)', padding: '48px 24px 40px', borderBottom: '1px solid #eae3dc' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 400, fontFamily: 'var(--font-serif)', color: '#1e1a1d', margin: '0 0 8px', letterSpacing: '0.02em' }}>
            All Products
          </h1>
          <p style={{ color: '#888', margin: 0 }}>{products.length} products found</p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
          {/* "All" pill — always active on this page */}
          <Link href="/shop" style={{
            textDecoration: 'none', padding: '8px 18px',
            borderRadius: 9999, fontSize: 14, fontWeight: 500,
            background: '#1e1a1d',
            color: '#fff',
            border: '1.5px solid #1e1a1d',
            transition: 'all .2s',
            boxShadow: '0 4px 12px rgba(30,26,29,.12)',
          }}>
            All
          </Link>

          {sortedCategories.map((cat) => {
            const label = cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name;
            const href = `/shop/${cat.slug}`;
            return (
              <Link key={cat.id} href={href} style={{
                textDecoration: 'none', padding: '8px 18px',
                borderRadius: 9999, fontSize: 14, fontWeight: 500,
                background: '#fff',
                color: '#1e1a1d',
                border: '1.5px solid #eae3dc',
                transition: 'all .2s',
                boxShadow: 'none',
              }}>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Grid */}
        {products.length > 0 ? (
          <div className="product-grid">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🌸</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>No products yet</h2>
            <p style={{ color: '#6b7280' }}>Products will be added soon. Follow us on TikTok for updates!</p>
            <a href="https://www.tiktok.com/@cute.things516" target="_blank" rel="noreferrer"
               className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', marginTop: 24 }}>
              🎵 Follow on TikTok
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
