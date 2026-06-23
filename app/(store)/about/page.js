import { Sparkles, Heart, Gift, Truck, CreditCard, Star, Music, Award, Users, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'About Us | Cute Things Sri Lanka',
  description: 'Learn about Cute Things — your go-to shop for adorable plush toys, anime gifts, and cute accessories in Sri Lanka.',
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(32px,6vw,64px) clamp(16px,4vw,24px)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(36px,6vw,56px)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(197,168,128,0.15),rgba(229,179,179,0.15))', color: '#c5a880', marginBottom: 20, border: '1.5px solid rgba(197,168,128,0.2)' }}>
          <Sparkles size={38} />
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, margin: '0 0 16px', fontFamily: 'var(--font-serif)', letterSpacing: '0.02em' }}>
          About <span className="gradient-brand-text">Cute Things</span>
        </h1>
        <p style={{ fontSize: 'clamp(15px,2.5vw,18px)', color: '#6b7280', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
          Sri Lanka&apos;s cutest online shop for plush toys, anime gifts &amp; adorable accessories.
        </p>
      </div>

      {/* Story */}
      <div style={{ background: 'linear-gradient(135deg,#fce4ec 0%,#f3e5f5 100%)', borderRadius: 'clamp(14px,3vw,24px)', padding: 'clamp(24px,5vw,44px)', marginBottom: 'clamp(24px,4vw,40px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.08, color: '#c5a880' }}>
          <Heart size={130} fill="#c5a880" />
        </div>
        <h2 style={{ fontSize: 'clamp(20px,3.5vw,26px)', fontWeight: 800, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          Our Story <Heart size={20} color="#e91e8c" fill="#e91e8c" />
        </h2>
        <p style={{ fontSize: 'clamp(14px,2vw,16px)', color: '#4b5563', lineHeight: 1.85, margin: 0, position: 'relative', zIndex: 1 }}>
          Cute Things started with a simple love for adorable products — fluffy plushies, anime collectibles, and charming accessories that bring a smile to anyone&apos;s face. We began sharing our finds on TikTok and were overwhelmed by the response from our community. Today, we&apos;re proud to bring these cute treasures directly to your door, island-wide across Sri Lanka.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 'clamp(24px,4vw,40px)' }}>
        {[
          { value: '5000+', label: 'Happy Customers', icon: Users },
          { value: '50+',   label: 'Cute Products',   icon: Gift },
          { value: '4.9',  label: 'Customer Rating', icon: Award },
        ].map(({ value, label, icon: Icon }) => (
          <div key={label} className="card" style={{ padding: 'clamp(16px,3vw,24px)', textAlign: 'center' }}>
            <Icon size={22} color="#c5a880" style={{ marginBottom: 8 }} />
            <p style={{ margin: '0 0 4px', fontSize: 'clamp(20px,3.5vw,28px)', fontWeight: 800, color: '#1e1a1d', fontFamily: 'var(--font-sans)' }}>{value}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Values */}
      <div className="about-values-grid">
        {[
          { icon: Heart,      title: 'Curated with Love',    desc: 'Every product is hand-picked for cuteness and quality', color: '#e91e8c' },
          { icon: Truck,      title: 'Island-wide Delivery', desc: 'We deliver to every corner of Sri Lanka', color: '#3b82f6' },
          { icon: CreditCard, title: 'Easy Payments',        desc: 'COD, Bank Transfer & Card Payment options', color: '#10b981' },
          { icon: ShieldCheck,title: 'Customer First',       desc: 'Your happiness is our top priority', color: '#f59e0b' },
        ].map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="card" style={{ padding: 'clamp(18px,3vw,28px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${color}12`, border: `1.5px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
              <Icon size={24} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h3>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Social */}
      <div style={{ textAlign: 'center', background: '#0f0f1a', borderRadius: 'clamp(14px,3vw,20px)', padding: 'clamp(28px,5vw,44px)', marginTop: 'clamp(24px,4vw,40px)' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(197,168,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#c5a880', border: '1.5px solid rgba(197,168,128,0.2)' }}>
          <Music size={24} />
        </div>
        <h2 style={{ fontSize: 'clamp(18px,3.5vw,24px)', fontWeight: 800, color: '#fff', marginBottom: 10 }}>
          Follow Our Journey
        </h2>
        <p style={{ color: 'rgba(255,255,255,.55)', marginBottom: 28, fontSize: 14, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 28px' }}>
          Watch our TikTok for unboxings, product showcases, and behind-the-scenes cuteness!
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://www.tiktok.com/@cute.things516" target="_blank" rel="noreferrer"
             className="btn-gold" style={{ textDecoration: 'none' }}>🎵 @cute.things516</a>
          <a href="https://www.facebook.com/share/17Qros4sRV/" target="_blank" rel="noreferrer"
             className="btn-outline" style={{ textDecoration: 'none', borderColor: 'rgba(255,255,255,.3)', color: '#fff' }}>
            Facebook Page
          </a>
        </div>
      </div>
    </div>
  );
}
