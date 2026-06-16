import Link from 'next/link';
import { getFeaturedProducts, getNewArrivals, getCategories } from '@/lib/firebase/server';
import ProductCard from '@/components/store/ProductCard';
import CategoryGrid from '@/components/store/CategoryGrid';
import { ArrowRight, Truck, Shield, RefreshCw, Star, Heart, Sparkles, Gift, Gem, ShoppingBag } from 'lucide-react';

export const metadata = {
  title: 'Cute Things — Plush Toys, Gifts & Cute Accessories in Sri Lanka',
  description: 'Shop adorable plush toys, anime gifts, keychains & cute accessories. Island-wide delivery. Cash on delivery available.',
};

export const revalidate = 60;

const features = [
  { icon: Truck,     title: 'Island-wide Delivery',  desc: 'We deliver across all of Sri Lanka'    },
  { icon: Shield,    title: 'Cash on Delivery',       desc: 'Pay only when you receive your order' },
  { icon: RefreshCw, title: 'Easy Returns',           desc: 'Hassle-free return policy'             },
  { icon: Star,      title: 'Premium Quality',        desc: 'Carefully selected cute products'      },
];

export default async function HomePage() {
  const [featured, newArrivals, dbCategories] = await Promise.all([
    getFeaturedProducts(8),
    getNewArrivals(8),
    getCategories(),
  ]);

  const floatingIcons = [Heart, Sparkles, Gift, Star, Gem, ShoppingBag];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden', minHeight: '80vh',
        display: 'flex', alignItems: 'center',
        background: 'linear-gradient(135deg, #1e1a1d 0%, #120f11 100%)',
        borderBottom: '1px solid rgba(197,168,128,0.1)',
      }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position:'absolute', top:'-15%', right:'-5%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(197,168,128,.15) 0%,transparent 70%)' }} />
          <div style={{ position:'absolute', bottom:'-20%', left:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(229,179,179,.1) 0%,transparent 70%)' }} />
          {floatingIcons.map((Icon, i) => (
            <div key={i} style={{
              position:'absolute',
              top: `${10 + i * 15}%`, left: `${5 + i * 14}%`,
              opacity: 0.08, color: '#c5a880',
              animation: `float${i % 3} ${4 + i}s ease-in-out infinite`,
            }}>
              <Icon size={28 + (i * 6)} />
            </div>
          ))}
        </div>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'80px 24px', position:'relative', zIndex:1, width:'100%' }}>
          <div style={{ maxWidth:640 }}>
            <h1 style={{ fontSize:'clamp(36px,6vw,72px)', fontWeight:300, fontFamily:'var(--font-serif)', lineHeight:1.1, color:'#fff', margin:'0 0 24px', letterSpacing:'0.02em' }}>
              Discover{' '}
              <span style={{ background:'linear-gradient(135deg,#c5a880,#e5b3b3)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Adorable
              </span>
              {' '}Luxury Gifts
            </h1>

            <p style={{ fontSize:18, color:'rgba(255,255,255,.6)', fontFamily:'var(--font-sans)', fontWeight:300, lineHeight:1.7, marginBottom:36, maxWidth:500 }}>
              Curated collection of cuddly plush toys, premium anime gifts, and charming accessories — delivered island-wide. 💖
            </p>

            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <Link href="/shop" className="btn-gold" style={{ textDecoration:'none', fontSize:14, padding:'14px 32px' }}>
                Shop Collection <ArrowRight size={18} />
              </Link>
              <Link href="/shop/plush-toys" className="btn-outline" style={{ textDecoration:'none', fontSize:14, padding:'14px 32px', color:'#fff', borderColor:'rgba(255,255,255,0.4)' }}>
                <Heart size={16} /> Plush Toys
              </Link>
            </div>

            <div style={{ display:'flex', gap:32, marginTop:48, flexWrap:'wrap' }}>
              {[
                ['5000+', 'Happy Clients'],
                ['50+', 'Boutique Products'],
                ['⭐ 4.9', 'Client Rating']
              ].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontSize:26, fontWeight:700, fontFamily:'var(--font-sans)', color:'#c5a880', letterSpacing:'0.04em' }}>{val}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,.5)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:2 }}>{label}</div>
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

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section style={{ padding:'80px 24px', background:'#fff' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, margin:'0 0 12px' }}>
              Shop by <span className="gradient-brand-text">Category</span>
            </h2>
            <p style={{ color:'#6b7280', fontSize:16 }}>Find exactly what you're looking for</p>
          </div>
          
          <CategoryGrid categories={dbCategories} />
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section style={{ padding:'80px 24px', background:'#faf8f6' }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:48, flexWrap:'wrap', gap:16 }}>
              <div>
                <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, margin:'0 0 8px' }}>
                  Featured <span className="gradient-brand-text">Products</span>
                </h2>
                <p style={{ color:'#6b7280', margin:0 }}>Our most loved items</p>
              </div>
              <Link href="/shop" className="btn-outline" style={{ textDecoration:'none' }}>
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="product-grid">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── New Arrivals ──────────────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section style={{ padding:'80px 24px', background:'#fff' }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:48, flexWrap:'wrap', gap:16 }}>
              <div>
                <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, margin:'0 0 8px' }}>
                  New <span className="gradient-brand-text">Arrivals</span>
                </h2>
                <p style={{ color:'#6b7280', margin:0 }}>Fresh & adorable additions</p>
              </div>
              <Link href="/shop" className="btn-outline" style={{ textDecoration:'none' }}>
                Shop All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="product-grid">
              {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {featured.length === 0 && newArrivals.length === 0 && (
        <section style={{ padding:'80px 24px', textAlign:'center' }}>
          <div style={{ maxWidth:480, margin:'0 auto' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(197,168,128,0.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'#c5a880' }}>
              <ShoppingBag size={32} />
            </div>
            <h2 style={{ fontSize:28, fontWeight:800, marginBottom:12 }}>Products Coming Soon!</h2>
            <p style={{ color:'#6b7280' }}>We're adding our cute collection. Check back soon!</p>
          </div>
        </section>
      )}

      {/* ── Features Strip ────────────────────────────────────────────────── */}
      <section style={{ padding:'64px 24px', background:'linear-gradient(135deg,#1e1a1d,#120f11)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:32 }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:12 }}>
              <div style={{
                width:52, height:52, borderRadius:14,
                background:'rgba(197,168,128,.15)', border:'1px solid rgba(197,168,128,.25)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <Icon size={22} color="#c5a880" />
              </div>
              <h3 style={{ color:'#fff', fontWeight:500, letterSpacing:'0.04em', fontSize:16, margin:0 }}>{title}</h3>
              <p style={{ color:'rgba(255,255,255,.5)', fontSize:13, margin:0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TikTok CTA ────────────────────────────────────────────────────────── */}
      <section style={{ padding:'80px 24px', background:'#fff', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#1e1a1d,#333)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>
          </div>
          <h2 style={{ fontSize:'clamp(24px,4vw,38px)', fontWeight:800, margin:'0 0 16px' }}>
            Follow us on <span className="gradient-brand-text">TikTok</span>
          </h2>
          <p style={{ color:'#6b7280', fontSize:16, marginBottom:32 }}>
            Watch our unboxing videos, cute product showcases, and more on TikTok @cute.things516
          </p>
          <a
            href="https://www.tiktok.com/@cute.things516"
            target="_blank"
            rel="noreferrer"
            id="tiktok-cta"
            className="btn-gold"
            style={{ textDecoration:'none', fontSize:16, padding:'14px 32px' }}
          >
            Follow @cute.things516
          </a>
        </div>
      </section>
    </>
  );
}
