import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/firebase/server';
import ProductDetailClient from './ProductDetailClient';

export const revalidate = 30;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);
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
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);
  if (!product) notFound();

  const jsonLd = {
    '@context':      'https://schema.org',
    '@type':         'Product',
    name:            product.name,
    description:     product.description,
    image:           product.images,
    offers: {
      '@type':       'Offer',
      price:         product.compareAtPrice ?? product.price,
      priceCurrency: 'LKR',
      availability:  product.status === 'active'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Cute Things' },
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
