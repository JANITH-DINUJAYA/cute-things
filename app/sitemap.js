import { db }        from '@/lib/firebase/client';
import { collection, getDocs } from 'firebase/firestore';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cutethings.lk';
  const now = new Date();

  // Static pages
  const staticPages = [
    { url: `${baseUrl}/`,               lastModified: now, changeFrequency: 'daily',  priority: 1.0 },
    { url: `${baseUrl}/shop`,           lastModified: now, changeFrequency: 'daily',  priority: 0.9 },
    { url: `${baseUrl}/about`,          lastModified: now, changeFrequency: 'monthly',priority: 0.5 },
    { url: `${baseUrl}/contact`,        lastModified: now, changeFrequency: 'monthly',priority: 0.5 },
    { url: `${baseUrl}/faq`,            lastModified: now, changeFrequency: 'monthly',priority: 0.5 },
    { url: `${baseUrl}/shipping-policy`,lastModified: now, changeFrequency: 'monthly',priority: 0.4 },
    { url: `${baseUrl}/privacy-policy`, lastModified: now, changeFrequency: 'monthly',priority: 0.4 },
    { url: `${baseUrl}/terms`,          lastModified: now, changeFrequency: 'monthly',priority: 0.4 },
  ];

  // Category pages
  const categoryPages = [
    'plush-toys', 'accessories', 'gifts', 'anime-plushies',
  ].map((slug) => ({
    url:             `${baseUrl}/shop/${slug}`,
    lastModified:    now,
    changeFrequency: 'daily',
    priority:        0.8,
  }));

  // Dynamic product pages
  let productPages = [];
  try {
    const snap = await getDocs(collection(db, 'products'));
    productPages = snap.docs
      .filter((d) => d.data().status === 'active' && d.data().slug)
      .map((d) => ({
        url:             `${baseUrl}/product/${d.data().slug}`,
        lastModified:    d.data().updatedAt?.toDate?.() ?? now,
        changeFrequency: 'weekly',
        priority:        0.7,
      }));
  } catch {}

  return [...staticPages, ...categoryPages, ...productPages];
}
