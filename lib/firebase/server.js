/**
 * lib/firebase/server.js
 *
 * Server-side Firestore helpers using Firebase ADMIN SDK.
 * Use this in ALL Server Components and API Routes for data fetching.
 *
 * ⚠️  We intentionally avoid compound where+orderBy queries to prevent
 *     the need for Firestore composite indexes. All filtering and sorting
 *     is done in JavaScript after a simple collection fetch.
 */
import 'server-only';
import { adminDb } from './admin';

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Serialize Firestore Timestamps → ISO strings so Next.js can pass props */
function serializeDoc(data) {
  if (!data) return {};
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (v && typeof v.toDate === 'function') {
      out[k] = v.toDate().toISOString();
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = serializeDoc(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

/** Fetch the full products collection, serialize, return as array */
async function fetchAllProducts() {
  const snap = await adminDb.collection('products').get();
  return snap.docs.map((d) => ({ id: d.id, ...serializeDoc(d.data()) }));
}

/** Sort by createdAt descending (ISO strings sort lexicographically) */
function sortByDate(arr) {
  return [...arr].sort((a, b) => {
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Get active featured products (for home page)
 */
export async function getFeaturedProducts(limitCount = 8) {
  try {
    const all = await fetchAllProducts();
    return sortByDate(all.filter((p) => p.status === 'active' && p.isFeatured === true))
      .slice(0, limitCount);
  } catch (err) {
    console.error('[getFeaturedProducts]', err.message);
    return [];
  }
}

/**
 * Get newest active products (for home page new arrivals)
 */
export async function getNewArrivals(limitCount = 8) {
  try {
    const all = await fetchAllProducts();
    return sortByDate(all.filter((p) => p.status === 'active')).slice(0, limitCount);
  } catch (err) {
    console.error('[getNewArrivals]', err.message);
    return [];
  }
}

/**
 * Get all active products, optionally filtered by category slug
 */
export async function getProducts({ categorySlug } = {}) {
  try {
    const all    = await fetchAllProducts();
    const active = all.filter((p) => p.status === 'active');
    const sorted = sortByDate(active);

    if (!categorySlug) return sorted;

    // Filter by category field or slug prefix
    return sorted.filter(
      (p) => p.category === categorySlug ||
             p.categorySlug === categorySlug ||
             p.slug?.startsWith(categorySlug)
    );
  } catch (err) {
    console.error('[getProducts]', err.message);
    return [];
  }
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug) {
  try {
    const snap = await adminDb
      .collection('products')
      .where('slug', '==', slug)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...serializeDoc(d.data()) };
  } catch (err) {
    console.error('[getProductBySlug]', err.message);
    return null;
  }
}

/**
 * Get all categories
 */
export async function getCategories() {
  try {
    const snap = await adminDb.collection('categories').get();
    return snap.docs.map((d) => ({ id: d.id, ...serializeDoc(d.data()) }));
  } catch (err) {
    console.error('[getCategories]', err.message);
    return [];
  }
}

/**
 * Get all orders (for admin panel server components)
 */
export async function getAllOrders() {
  try {
    const snap = await adminDb.collection('orders').get();
    const orders = snap.docs.map((d) => ({ id: d.id, ...serializeDoc(d.data()) }));
    return sortByDate(orders);
  } catch (err) {
    console.error('[getAllOrders]', err.message);
    return [];
  }
}

/**
 * Get general settings (siteName, tagline, contactEmail, etc.)
 */
export async function getGeneralSettings() {
  try {
    const doc = await adminDb.collection('settings').doc('general').get();
    if (!doc.exists) return {};
    return serializeDoc(doc.data());
  } catch (err) {
    console.error('[getGeneralSettings]', err.message);
    return {};
  }
}
