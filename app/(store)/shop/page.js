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
        {/* Category Pills — clean text-only, no emojis */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
          <Link href="/shop" style={{
            textDecoration: 'none', padding: '8px 18px',
            borderRadius: 9999, fontSize: 13, fontWeight: 600,
            background: '#1e1a1d', color: '#fff',
            border: '1.5px solid #1e1a1d',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            boxShadow: '0 4px 12px rgba(30,26,29,.12)',
          }}>
            All
          </Link>

          {sortedCategories.map((cat) => {
            const label = cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name;
            return (
              <Link key={cat.id} href={`/shop/${cat.slug}`} style={{
                textDecoration: 'none', padding: '8px 18px',
                borderRadius: 9999, fontSize: 13, fontWeight: 500,
                background: '#fff', color: '#1e1a1d',
                border: '1.5px solid #eae3dc',
                display: 'inline-flex', alignItems: 'center', gap: 6,
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
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(197,168,128,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', color: '#c5a880',
            }}>
              {/* Shopping bag inline SVG (lucide Package) */}
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" x2="21" y1="6" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>No products yet</h2>
            <p style={{ color: '#6b7280' }}>Products will be added soon. Follow us on TikTok for updates!</p>
            <a href="https://www.tiktok.com/@cute.things516" target="_blank" rel="noreferrer"
               className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', marginTop: 24 }}>
              Follow on TikTok
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
