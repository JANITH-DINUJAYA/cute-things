/**
 * Product Seeder — Cute Things Store
 * Seeds 20 demo products with categories into Firestore.
 *
 * Usage:
 *   node scripts/seed-products.js
 *
 * Run from project root. Requires .env.local with Firebase Admin credentials.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, Timestamp }      = require('firebase-admin/firestore');

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

const db = getFirestore();

// ── Categories ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'plush-toys',   name: 'Plush Toys',   slug: 'plush-toys',    emoji: '🧸', description: 'Adorable teddy bears and anime plushies' },
  { id: 'accessories',  name: 'Accessories',  slug: 'accessories',   emoji: '🔑', description: 'Keychains, stickers and cute accessories' },
  { id: 'gifts',        name: 'Gifts',        slug: 'gifts',         emoji: '🎁', description: 'Perfect gift sets for every occasion' },
  { id: 'anime',        name: 'Anime',        slug: 'anime-plushies',emoji: '⭐', description: 'Your favorite characters as plushies' },
];

// ── Products (real Unsplash/Picsum images) ──────────────────────────────────
const PRODUCTS = [
  // ─── Plush Toys ─────────────────────────────────────────────────────────
  {
    name: 'Giant Teddy Bear — Cream',
    slug: 'giant-teddy-bear-cream',
    category: 'plush-toys',
    categoryName: 'Plush Toys',
    price: 2800,
    compareAtPrice: 3500,
    description: 'Our bestselling giant cream teddy bear. Ultra-soft premium plush fabric. 60cm tall — perfect for hugging!',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      'https://images.unsplash.com/photo-1555685812-4b8f286bb46a?w=600&q=80',
    ],
    isFeatured: true,
    status: 'active',
    stock: 25,
    tags: ['teddy', 'plush', 'cream', 'featured'],
    weight: 0.8,
  },
  {
    name: 'Pink Bunny Plush — 35cm',
    slug: 'pink-bunny-plush-35cm',
    category: 'plush-toys',
    categoryName: 'Plush Toys',
    price: 1850,
    compareAtPrice: 2200,
    description: 'Super soft pink bunny with long floppy ears. Made from premium velvet plush. A perfect gift for all ages.',
    images: [
      'https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=600&q=80',
      'https://images.unsplash.com/photo-1606166325683-e6deb697d301?w=600&q=80',
    ],
    isFeatured: true,
    status: 'active',
    stock: 30,
    tags: ['bunny', 'pink', 'plush'],
    weight: 0.4,
  },
  {
    name: 'Shiba Inu Plush — 40cm',
    slug: 'shiba-inu-plush-40cm',
    category: 'plush-toys',
    categoryName: 'Plush Toys',
    price: 2200,
    compareAtPrice: null,
    description: 'The iconic Shiba Inu in adorable plush form. Much wow, very soft. 40cm of pure cuteness.',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
      'https://images.unsplash.com/photo-1544568100-847a948585b9?w=600&q=80',
    ],
    isFeatured: false,
    status: 'active',
    stock: 15,
    tags: ['shiba', 'dog', 'plush', 'anime'],
    weight: 0.5,
  },
  {
    name: 'Strawberry Bear Plush',
    slug: 'strawberry-bear-plush',
    category: 'plush-toys',
    categoryName: 'Plush Toys',
    price: 1600,
    compareAtPrice: 2000,
    description: 'A cute strawberry-costumed teddy bear. Bright red with white polka dots. 30cm of sweetness!',
    images: [
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80',
      'https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=600&q=80',
    ],
    isFeatured: true,
    status: 'active',
    stock: 20,
    tags: ['bear', 'strawberry', 'cute', 'cosplay'],
    weight: 0.35,
  },
  {
    name: 'Avocado Plush Pillow',
    slug: 'avocado-plush-pillow',
    category: 'plush-toys',
    categoryName: 'Plush Toys',
    price: 1200,
    compareAtPrice: 1500,
    description: 'Adorable avocado-shaped plush pillow. Squishy, soft, and irresistibly cute. 35cm.',
    images: [
      'https://images.unsplash.com/photo-1590005024862-6b67679a29fb?w=600&q=80',
    ],
    isFeatured: false,
    status: 'active',
    stock: 40,
    tags: ['avocado', 'food', 'pillow', 'plush'],
    weight: 0.3,
  },

  // ─── Accessories ────────────────────────────────────────────────────────
  {
    name: 'Kawaii Bear Keychain',
    slug: 'kawaii-bear-keychain',
    category: 'accessories',
    categoryName: 'Accessories',
    price: 450,
    compareAtPrice: 600,
    description: 'A tiny fluffy bear keychain in pastel colors. Attaches to bags, keys, or phones. Comes in 5 colors.',
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
    ],
    isFeatured: true,
    status: 'active',
    stock: 100,
    tags: ['keychain', 'kawaii', 'bear', 'accessory'],
    weight: 0.05,
  },
  {
    name: 'Aesthetic Sticker Pack (50pcs)',
    slug: 'aesthetic-sticker-pack-50pcs',
    category: 'accessories',
    categoryName: 'Accessories',
    price: 380,
    compareAtPrice: 500,
    description: '50 premium waterproof vinyl stickers. Kawaii, anime, and pastel themes. Perfect for laptops, journals & water bottles.',
    images: [
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80',
    ],
    isFeatured: true,
    status: 'active',
    stock: 200,
    tags: ['sticker', 'aesthetic', 'kawaii', 'stationery'],
    weight: 0.1,
  },
  {
    name: 'Pastel Phone Ring Holder',
    slug: 'pastel-phone-ring-holder',
    category: 'accessories',
    categoryName: 'Accessories',
    price: 350,
    compareAtPrice: null,
    description: 'A cute flower-shaped pastel phone ring holder. Universal compatibility. Swivels 360°.',
    images: [
      'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&q=80',
    ],
    isFeatured: false,
    status: 'active',
    stock: 75,
    tags: ['phone', 'ring', 'pastel', 'accessory'],
    weight: 0.05,
  },
  {
    name: 'Star & Moon Hair Clip Set',
    slug: 'star-moon-hair-clip-set',
    category: 'accessories',
    categoryName: 'Accessories',
    price: 590,
    compareAtPrice: 750,
    description: 'A set of 6 celestial hair clips — stars, moons, and clouds in silver and gold. Y2K aesthetic.',
    images: [
      'https://images.unsplash.com/photo-1512214379-b2bbb52bdef2?w=600&q=80',
    ],
    isFeatured: false,
    status: 'active',
    stock: 60,
    tags: ['hair', 'clip', 'star', 'moon', 'y2k'],
    weight: 0.08,
  },
  {
    name: 'Floral Canvas Tote Bag',
    slug: 'floral-canvas-tote-bag',
    category: 'accessories',
    categoryName: 'Accessories',
    price: 890,
    compareAtPrice: 1100,
    description: 'A lightweight canvas tote bag with pastel floral embroidery. Eco-friendly and stylish.',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    ],
    isFeatured: true,
    status: 'active',
    stock: 35,
    tags: ['tote', 'bag', 'floral', 'canvas'],
    weight: 0.25,
  },

  // ─── Gifts ──────────────────────────────────────────────────────────────
  {
    name: 'Luxury Gift Box — Pastel Dream',
    slug: 'luxury-gift-box-pastel-dream',
    category: 'gifts',
    categoryName: 'Gifts',
    price: 4500,
    compareAtPrice: 5500,
    description: 'A curated luxury gift box: 1 plush toy, 3 keychains, sticker pack, and a greeting card. Beautifully wrapped.',
    images: [
      'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600&q=80',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80',
    ],
    isFeatured: true,
    status: 'active',
    stock: 10,
    tags: ['gift', 'box', 'luxury', 'set', 'featured'],
    weight: 1.2,
  },
  {
    name: 'Birthday Surprise Set',
    slug: 'birthday-surprise-set',
    category: 'gifts',
    categoryName: 'Gifts',
    price: 2900,
    compareAtPrice: 3500,
    description: 'The perfect birthday gift! Includes a mini plush, 2 keychains, a card, and a birthday ribbon.',
    images: [
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80',
      'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=600&q=80',
    ],
    isFeatured: false,
    status: 'active',
    stock: 18,
    tags: ['birthday', 'gift', 'set', 'surprise'],
    weight: 0.7,
  },
  {
    name: "Valentine's Day Gift Bundle",
    slug: 'valentines-day-gift-bundle',
    category: 'gifts',
    categoryName: 'Gifts',
    price: 3800,
    compareAtPrice: 4800,
    description: 'Show your love! Includes a red heart plush, chocolate-scented candle, sticker pack, and a love letter card.',
    images: [
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80',
    ],
    isFeatured: true,
    status: 'active',
    stock: 12,
    tags: ['valentine', 'love', 'gift', 'heart'],
    weight: 0.9,
  },
  {
    name: 'Self-Care Kawaii Kit',
    slug: 'self-care-kawaii-kit',
    category: 'gifts',
    categoryName: 'Gifts',
    price: 2200,
    compareAtPrice: null,
    description: 'A self-care kit with a face mask, bath bomb, mini scented candle, and a kawaii plush companion.',
    images: [
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80',
    ],
    isFeatured: false,
    status: 'active',
    stock: 22,
    tags: ['self-care', 'kawaii', 'kit', 'gift'],
    weight: 0.6,
  },

  // ─── Anime ───────────────────────────────────────────────────────────────
  {
    name: 'Totoro Large Plush — 50cm',
    slug: 'totoro-large-plush-50cm',
    category: 'anime',
    categoryName: 'Anime',
    price: 3200,
    compareAtPrice: 4000,
    description: 'My Neighbor Totoro in 50cm plush form. Officially inspired design. Incredibly soft grey fabric with expressive face.',
    images: [
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80',
    ],
    isFeatured: true,
    status: 'active',
    stock: 8,
    tags: ['totoro', 'anime', 'ghibli', 'plush', 'featured'],
    weight: 0.9,
  },
  {
    name: 'Pikachu Squishy Plush — 25cm',
    slug: 'pikachu-squishy-plush-25cm',
    category: 'anime',
    categoryName: 'Anime',
    price: 1900,
    compareAtPrice: 2400,
    description: 'Your favourite electric mouse in ultra-squishy plush form. 25cm of Pokémon goodness. I choose you!',
    images: [
      'https://images.unsplash.com/photo-1611325961054-aac56e3b7ae7?w=600&q=80',
    ],
    isFeatured: true,
    status: 'active',
    stock: 20,
    tags: ['pikachu', 'pokemon', 'anime', 'plush'],
    weight: 0.4,
  },
  {
    name: 'Kirby Plush — 30cm',
    slug: 'kirby-plush-30cm',
    category: 'anime',
    categoryName: 'Anime',
    price: 2100,
    compareAtPrice: null,
    description: 'The pink puffball from Dream Land in adorable plush form. 30cm of Kirby cuteness. Inhale the fun!',
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
    ],
    isFeatured: false,
    status: 'active',
    stock: 14,
    tags: ['kirby', 'nintendo', 'game', 'plush', 'anime'],
    weight: 0.45,
  },
  {
    name: 'Hello Kitty Plush Bag Charm',
    slug: 'hello-kitty-plush-bag-charm',
    category: 'anime',
    categoryName: 'Anime',
    price: 750,
    compareAtPrice: 950,
    description: 'A mini Hello Kitty plush charm for bags, keys, or pouches. Classic design in soft plush. 10cm.',
    images: [
      'https://images.unsplash.com/photo-1589654387840-7b2ebb94c4e9?w=600&q=80',
    ],
    isFeatured: false,
    status: 'active',
    stock: 50,
    tags: ['hello kitty', 'sanrio', 'charm', 'anime', 'bag'],
    weight: 0.08,
  },
  {
    name: 'Cinnamoroll Plush — 40cm',
    slug: 'cinnamoroll-plush-40cm',
    category: 'anime',
    categoryName: 'Anime',
    price: 2600,
    compareAtPrice: 3200,
    description: 'Sanrio\'s beloved Cinnamoroll in a large 40cm plush. White with blue eyes and a cute cinnamon roll tail.',
    images: [
      'https://images.unsplash.com/photo-1559041881-9ef55f84afab?w=600&q=80',
    ],
    isFeatured: true,
    status: 'active',
    stock: 16,
    tags: ['cinnamoroll', 'sanrio', 'anime', 'plush'],
    weight: 0.7,
  },
  {
    name: 'Stitch Plush — 35cm',
    slug: 'stitch-plush-35cm',
    category: 'anime',
    categoryName: 'Anime',
    price: 2400,
    compareAtPrice: 2900,
    description: 'Experiment 626 in cuddly plush form! Classic blue Stitch, 35cm tall. Disney-inspired design.',
    images: [
      'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&q=80',
    ],
    isFeatured: true,
    status: 'active',
    stock: 18,
    tags: ['stitch', 'disney', 'anime', 'plush'],
    weight: 0.6,
  },
];

// ── Seed function ──────────────────────────────────────────────────────────
async function seed() {
  const now = Timestamp.now();

  // 1. Write categories
  console.log('\n📂 Seeding categories...');
  const catBatch = db.batch();
  for (const cat of CATEGORIES) {
    const ref = db.collection('categories').doc(cat.id);
    catBatch.set(ref, { ...cat, createdAt: now }, { merge: true });
    console.log(`  ✅ ${cat.emoji} ${cat.name}`);
  }
  await catBatch.commit();

  // 2. Write products (in batches of 10)
  console.log('\n📦 Seeding products...');
  let batch = db.batch();
  let count = 0;

  for (const product of PRODUCTS) {
    const ref = db.collection('products').doc();
    batch.set(ref, {
      ...product,
      priceFormatted: `Rs. ${product.price.toLocaleString()}`,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  ✅ ${product.name} — Rs. ${product.price}`);
    count++;
    if (count % 10 === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }
  if (count % 10 !== 0) await batch.commit();

  console.log(`\n🎉 Done! Seeded ${CATEGORIES.length} categories and ${PRODUCTS.length} products.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
