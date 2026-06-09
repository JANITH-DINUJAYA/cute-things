import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase/client';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import ProductCard from '@/components/store/ProductCard';
import { ArrowRight, Truck, Shield, RefreshCw, Star } from 'lucide-react';

export const metadata = {
  title: 'Cute Things — Plush Toys, Gifts & Cute Accessories in Sri Lanka',
  description: 'Shop adorable plush toys, anime gifts, keychains & cute accessories. Island-wide delivery. Cash on delivery available.',
};

export const revalidate = 60; // ISR: rebuild every 60s

async function getFeaturedProducts() {
  try {
    const q = query(
      collection(db, 'products'),
      where('status', '==', 'active'),
      where('isFeatured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(8)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

async function getNewArrivals() {
  try {
    const q = query(
      collection(db, 'products'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(8)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

const categories = [
  { name: 'Plush Toys',   slug: 'plush-toys',   emoji: '🧸', desc: 'Teddy bears & anime plushies',      bg: 'linear-gradient(135deg,#ff6b9d,#c44dff)' },
  { name: 'Accessories',  slug: 'accessories',   emoji: '🔑', desc: 'Keychains, stickers & more',        bg: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { name: 'Gifts',        slug: 'gifts',         emoji: '🎁', desc: 'Perfect for any occasion',          bg: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { name: 'Anime',        slug: 'anime-plushies', emoji: '⭐', desc: 'Your fav characters as plushies',  bg: 'linear-gradient(135deg,#ffecd2,#fcb69f)' },
];

const features = [
  { icon: Truck,     title: 'Island-wide Delivery',   desc: 'We deliver across all of Sri Lanka'    },
  { icon: Shield,    title: 'Cash on Delivery',        desc: 'Pay only when you receive your order' },
  { icon: RefreshCw, title: 'Easy Returns',            desc: 'Hassle-free return policy'             },
  { icon: Star,      title: 'Premium Quality',         desc: 'Carefully selected cute products'      },
];

export default async function HomePage() {
  const [featured, newArrivals] = await Promise.all([getFeaturedProducts(), getNewArrivals()]);

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden', minHeight: '85vh',
        display: 'flex', alignItems: 'center',
        background: 'linear-gradient(135deg, #1e1a1d 0%, #120f11 100%)',
        borderBottom: '1px solid rgba(197, 168, 128, 0.1)'
      }}>
        {/* BG blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position:'absolute', top:'-15%', right:'-5%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(197,168,128,.15) 0%,transparent 70%)' }} />
          <div style={{ position:'absolute', bottom:'-20%', left:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(229,179,179,.1) 0%,transparent 70%)' }} />
          {/* Floating emojis */}
          {['🧸','🌸','💖','⭐','🎀','🌷'].map((e, i) => (
            <div key={i} style={{
              position:'absolute', fontSize: 28 + (i * 4),
              top: `${10 + i * 15}%`, left: `${5 + i * 14}%`,
              opacity: 0.1, animation: `float${i % 3} ${4 + i}s ease-in-out infinite`,
            }}>{e}</div>
          ))}
        </div>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'80px 24px', position:'relative', zIndex:1, width:'100%' }}>
          <div style={{ maxWidth:640 }}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:'rgba(197,168,128,.1)', border:'1px solid rgba(197,168,128,.2)',
              borderRadius:9999, padding:'6px 16px', marginBottom:24,
            }}>
              <span style={{ fontSize:13, color:'#e6d5b8', fontWeight:500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>🌟 Island-wide Delivery in Sri Lanka</span>
            </div>

            <h1 style={{ fontSize:'clamp(36px,6vw,72px)', fontWeight:300, fontFamily: 'var(--font-serif)', lineHeight:1.1, color:'#fff', margin:'0 0 24px', letterSpacing: '0.02em' }}>
              Discover{' '}
              <span style={{ background:'linear-gradient(135deg,#c5a880,#e5b3b3)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Adorable
              </span>
              {' '}Luxury Gifts
            </h1>

            <p style={{ fontSize:18, color:'rgba(255,255,255,.6)', fontFamily: 'var(--font-sans)', fontWeight: 300, lineHeight:1.7, marginBottom:36, maxWidth:500 }}>
              Indulge in our curated collection of cuddly plush toys, premium anime gifts, and charming accessories. High-end gifts made to bring joy. 💖
            </p>

            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <Link href="/shop" className="btn-primary" style={{ textDecoration:'none', fontSize:14, padding:'14px 32px' }}>
                Shop Collection <ArrowRight size={18} />
              </Link>
              <Link href="/shop/plush-toys" className="btn-outline" style={{
                textDecoration:'none', fontSize:14, padding:'14px 32px',
                borderColor:'rgba(255,255,255,.2)', color:'#fff',
              }}>
                Plush Toys 🧸
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display:'flex', gap:32, marginTop:48, flexWrap:'wrap' }}>
              {[['500+','Happy Clients'],['50+','Boutique Products'],['⭐ 4.9','Client Rating']].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontSize:24, fontWeight:400, fontFamily: 'var(--font-serif)', color:'#fff', letterSpacing: '0.04em' }}>{val}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop:2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes float0 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
          @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
          @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        `}</style>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────────── */}
      <section style={{ padding:'80px 24px', background:'#fff' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, margin:'0 0 12px' }}>
              Shop by <span className="gradient-brand-text">Category</span>
            </h2>
            <p style={{ color:'#6b7280', fontSize:16 }}>Find exactly what you're looking for</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:20 }}>
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/shop/${cat.slug}`} style={{ textDecoration:'none' }}>
                <div
                  className="transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    borderRadius: 20,
                    padding: '32px 24px',
                    background: cat.bg,
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0,0,0,.08)',
                  }}
                >
                  <div style={{ fontSize:48, marginBottom:16 }}>{cat.emoji}</div>
                  <h3 style={{ fontSize:18, fontWeight:700, color:'#fff', margin:'0 0 8px' }}>{cat.name}</h3>
                  <p style={{ fontSize:13, color:'rgba(255,255,255,.8)', margin:0 }}>{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section style={{ padding:'80px 24px', background:'#fafafa' }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:48, flexWrap:'wrap', gap:16 }}>
              <div>
                <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, margin:'0 0 8px' }}>
                  ⭐ Featured <span className="gradient-brand-text">Products</span>
                </h2>
                <p style={{ color:'#6b7280', margin:0 }}>Our most loved items</p>
              </div>
              <Link href="/shop" className="btn-outline" style={{ textDecoration:'none' }}>
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:24 }}>
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── New Arrivals ──────────────────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section style={{ padding:'80px 24px', background:'#fff' }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:48, flexWrap:'wrap', gap:16 }}>
              <div>
                <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, margin:'0 0 8px' }}>
                  🆕 New <span className="gradient-brand-text">Arrivals</span>
                </h2>
                <p style={{ color:'#6b7280', margin:0 }}>Fresh & adorable additions</p>
              </div>
              <Link href="/shop" className="btn-outline" style={{ textDecoration:'none' }}>
                Shop All <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:24 }}>
              {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Empty state (no products yet) ────────────────────────────────────── */}
      {featured.length === 0 && newArrivals.length === 0 && (
        <section style={{ padding:'80px 24px', textAlign:'center' }}>
          <div style={{ maxWidth:480, margin:'0 auto' }}>
            <div style={{ fontSize:64, marginBottom:16 }}>🌸</div>
            <h2 style={{ fontSize:28, fontWeight:800, marginBottom:12 }}>Products Coming Soon!</h2>
            <p style={{ color:'#6b7280' }}>We're adding our cute collection. Check back soon!</p>
          </div>
        </section>
      )}

      {/* ── Features Strip ────────────────────────────────────────────────────── */}
      <section style={{ padding:'64px 24px', background:'linear-gradient(135deg,#1e1a1d,#120f11)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:32 }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:12 }}>
              <div style={{
                width:52, height:52, borderRadius:14,
                background:'rgba(197,168,128,.15)', border:'1px solid rgba(197,168,128,.25)',
                display:'flex', alignItems:'center', justifyContent: 'center',
              }}>
                <Icon size={22} color="#c5a880" />
              </div>
              <h3 style={{ color:'#fff', fontWeight:500, letterSpacing: '0.04em', fontSize:16, margin:0 }}>{title}</h3>
              <p style={{ color:'rgba(255,255,255,.5)', fontSize:13, margin:0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TikTok CTA ────────────────────────────────────────────────────────── */}
      <section style={{ padding:'80px 24px', background:'#fff', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🎵</div>
          <h2 style={{ fontSize:'clamp(24px,4vw,38px)', fontWeight:800, margin:'0 0 16px' }}>
            Follow us on <span className="gradient-brand-text">TikTok</span>
          </h2>
          <p style={{ color:'#6b7280', fontSize:16, marginBottom:32 }}>
            Watch our unboxing videos, cute product showcases, and more on TikTok @cute.things516 🌸
          </p>
          <a
            href="https://www.tiktok.com/@cute.things516"
            target="_blank"
            rel="noreferrer"
            id="tiktok-cta"
            className="btn-primary"
            style={{ textDecoration:'none', fontSize:16, padding:'14px 32px' }}
          >
            🎵 Follow @cute.things516
          </a>
        </div>
      </section>
    </>
  );
}
