import { getProducts, getCategories } from '@/lib/firebase/server';
import ProductCard from '@/components/store/ProductCard';
import Link from 'next/link';
import { getCategoryIcon } from '@/components/store/CategoryGrid';

export const revalidate = 30;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.category;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug);
  return {
    title: cat ? `${cat.name} — Cute Things` : 'Shop by Category',
    description: `Shop cute ${cat?.name ?? 'products'} in Sri Lanka. Island-wide delivery.`,
  };
}

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.map((c) => ({ category: c.slug }));
  } catch {
    return [];
  }
}

// Icon map (server-safe — returns the icon name string, rendered client-side via CategoryGrid)
function getCatIconName(slug = '') {
  const n = slug.toLowerCase().trim();
  if (n === 'plush-toys' || n === 'plushtoys') return '🧸';
  if (n === 'accessories' || n === 'accesories') return '💎';
  if (n === 'gifts' || n === 'gift' || n === 'gidt') return '🎁';
  if (n === 'anime-plushies' || n === 'anime' || n === 'animes') return '✨';
  return '🏷️';
}

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.category;

  const [products, categories] = await Promise.all([
    getProducts({ categorySlug: slug }),
    getCategories(),
  ]);

  // Client-safe sort that handles missing sortOrder
  const sortedCategories = [...categories].sort((a, b) => {
    const aO = a.sortOrder ?? 999;
    const bO = b.sortOrder ?? 999;
    if (aO !== bO) return aO - bO;
    return (a.name || '').localeCompare(b.name || '');
  });

  const currentCat = sortedCategories.find((c) => c.slug === slug);
  // No emojis in page title — clean name only
  const pageTitle = currentCat?.name ?? 'Products';

  return (
    <div style={{ minHeight: '70vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#f5f0eb 0%,#eae3dc 100%)', padding: '48px 24px 40px', borderBottom: '1px solid #eae3dc' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 400, fontFamily: 'var(--font-serif)', color: '#1e1a1d', margin: '0 0 8px', letterSpacing: '0.02em' }}>
            {pageTitle}
          </h1>
          <p style={{ color: '#888', margin: 0 }}>{products.length} products found</p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Category Pills — identical style to /shop page */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
          <Link href="/shop" style={{
            textDecoration: 'none', padding: '8px 18px',
            borderRadius: 9999, fontSize: 13, fontWeight: 500,
            background: '#fff', color: '#1e1a1d',
            border: '1.5px solid #eae3dc',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            All
          </Link>

          {sortedCategories.map((cat) => {
            const isActive = cat.slug === slug;
            return (
              <Link key={cat.id || cat.slug} href={`/shop/${cat.slug}`} style={{
                textDecoration: 'none', padding: '8px 18px',
                borderRadius: 9999, fontSize: 13, fontWeight: isActive ? 600 : 500,
                background: isActive ? '#1e1a1d' : '#fff',
                color: isActive ? '#fff' : '#1e1a1d',
                border: `1.5px solid ${isActive ? '#1e1a1d' : '#eae3dc'}`,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                boxShadow: isActive ? '0 4px 12px rgba(30,26,29,.12)' : 'none',
              }}>
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Featured badge strip (if category has featured products) */}
        {products.some((p) => p.isFeatured) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 32, padding: '10px 16px',
            background: 'rgba(197,168,128,0.08)',
            borderRadius: 10, border: '1px solid rgba(197,168,128,0.2)',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#c5a880" stroke="#c5a880" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#c5a880' }}>
              {products.filter((p) => p.isFeatured).length} featured item{products.filter((p) => p.isFeatured).length > 1 ? 's' : ''} in this category
            </span>
          </div>
        )}

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
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" x2="21" y1="6" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>No products in this category yet</h2>
            <p style={{ color: '#6b7280' }}>Check other categories or follow us on TikTok for updates!</p>
            <Link href="/shop" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', marginTop: 24 }}>
              View All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
