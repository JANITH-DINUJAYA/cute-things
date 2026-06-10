import { getProducts, getCategories } from '@/lib/firebase/server';
import ProductCard from '@/components/store/ProductCard';
import Link from 'next/link';

export const revalidate = 30;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.category;

  // Fetch categories to get name/emoji dynamically
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug);

  return {
    title: cat ? `${cat.name} — Cute Things` : 'Shop by Category',
    description: `Shop cute ${cat?.name ?? 'products'} in Sri Lanka. Island-wide delivery.`,
  };
}

export async function generateStaticParams() {
  // Fetch dynamic slugs from Firestore for static generation
  try {
    const categories = await getCategories();
    return categories.map((c) => ({ category: c.slug }));
  } catch {
    // Fallback so build doesn't fail if Firestore unreachable at build time
    return [];
  }
}

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.category;

  const [products, categories] = await Promise.all([
    getProducts({ categorySlug: slug }),
    getCategories(),
  ]);

  // Sort categories by sortOrder if present, otherwise by name
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.sortOrder != null && b.sortOrder != null) return a.sortOrder - b.sortOrder;
    if (a.sortOrder != null) return -1;
    if (b.sortOrder != null) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  // Find current category info for the page header
  const currentCat = sortedCategories.find((c) => c.slug === slug);
  const pageTitle = currentCat
    ? (currentCat.emoji ? `${currentCat.emoji} ${currentCat.name}` : currentCat.name)
    : 'Products';

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
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
          {/* "All" pill */}
          <Link href="/shop" style={{
            textDecoration: 'none', padding: '8px 18px',
            borderRadius: 9999, fontSize: 14, fontWeight: 500,
            background: '#fff',
            color: '#1e1a1d',
            border: '1.5px solid #eae3dc',
            transition: 'all .2s',
            boxShadow: 'none',
          }}>
            All
          </Link>

          {sortedCategories.map((cat) => {
            const isActive = cat.slug === slug;
            const label = cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name;
            const href = `/shop/${cat.slug}`;
            return (
              <Link key={cat.id} href={href} style={{
                textDecoration: 'none', padding: '8px 18px',
                borderRadius: 9999, fontSize: 14, fontWeight: 500,
                background: isActive ? '#1e1a1d' : '#fff',
                color: isActive ? '#fff' : '#1e1a1d',
                border: `1.5px solid ${isActive ? '#1e1a1d' : '#eae3dc'}`,
                transition: 'all .2s',
                boxShadow: isActive ? '0 4px 12px rgba(30,26,29,.12)' : 'none',
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
