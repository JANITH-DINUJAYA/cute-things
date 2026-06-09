import { getProducts } from '@/lib/firebase/server';
import ProductCard from '@/components/store/ProductCard';
import Link from 'next/link';

const categoryMap = {
  'plush-toys':     { name: 'Plush Toys',       emoji: '🧸' },
  'accessories':    { name: 'Accessories',       emoji: '🔑' },
  'gifts':          { name: 'Gifts',             emoji: '🎁' },
  'anime-plushies': { name: 'Anime Plushies',    emoji: '⭐' },
};

export async function generateMetadata({ params }) {
  const cat = categoryMap[params.category];
  return {
    title: cat ? `${cat.name} — Cute Things` : 'Shop by Category',
    description: `Shop cute ${cat?.name ?? 'products'} in Sri Lanka. Island-wide delivery.`,
  };
}

const categoryLinks = [
  { label: 'All',           href: '/shop',                slug: null             },
  { label: '🧸 Plush Toys', href: '/shop/plush-toys',     slug: 'plush-toys'     },
  { label: '🔑 Accessories',href: '/shop/accessories',    slug: 'accessories'    },
  { label: '🎁 Gifts',      href: '/shop/gifts',          slug: 'gifts'          },
  { label: '⭐ Anime',      href: '/shop/anime-plushies', slug: 'anime-plushies' },
];

export const revalidate = 30;

export async function generateStaticParams() {
  return [
    { category: 'plush-toys'     },
    { category: 'accessories'    },
    { category: 'gifts'          },
    { category: 'anime-plushies' },
  ];
}

export default async function CategoryPage({ params }) {
  const slug     = params.category;
  const catInfo  = categoryMap[slug];
  const products = await getProducts({ categorySlug: slug });

  const pageTitle = catInfo ? `${catInfo.emoji} ${catInfo.name}` : 'Products';

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
          {categoryLinks.map((c) => {
            const isActive = c.slug === slug;
            return (
              <Link key={c.href} href={c.href} style={{
                textDecoration: 'none', padding: '8px 18px',
                borderRadius: 9999, fontSize: 14, fontWeight: 500,
                background: isActive ? '#1e1a1d' : '#fff',
                color: isActive ? '#fff' : '#1e1a1d',
                border: `1.5px solid ${isActive ? '#1e1a1d' : '#eae3dc'}`,
                transition: 'all .2s',
                boxShadow: isActive ? '0 4px 12px rgba(30,26,29,.12)' : 'none',
              }}>
                {c.label}
              </Link>
            );
          })}
        </div>

        {/* Grid */}
        {products.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 24 }}>
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
