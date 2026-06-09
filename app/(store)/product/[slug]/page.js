import { notFound } from 'next/navigation';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import ProductDetailClient from './ProductDetailClient';

export const revalidate = 30;

async function getProduct(slug) {
  try {
    const q = query(collection(db, 'products'), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const doc = snap.docs[0];
    const data = doc.data();
    // Serialize Firestore timestamps
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toMillis?.() ?? null,
      updatedAt: data.updatedAt?.toMillis?.() ?? null,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.name,
    description: product.description?.slice(0, 160) || `Buy ${product.name} from Cute Things Sri Lanka.`,
    openGraph: {
      title:       product.name,
      description: product.description?.slice(0, 160),
      images:      product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  // JSON-LD structured data
  const jsonLd = {
    '@context':       'https://schema.org',
    '@type':          'Product',
    name:             product.name,
    description:      product.description,
    image:            product.images,
    sku:              product.sku,
    offers: {
      '@type':        'Offer',
      price:          product.discountPrice ?? product.price,
      priceCurrency:  'LKR',
      availability:   product.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller:         { '@type': 'Organization', name: 'Cute Things' },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
