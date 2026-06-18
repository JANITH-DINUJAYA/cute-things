import { Sparkles, Heart, Gift, Truck, CreditCard, Star, Music } from 'lucide-react';

export const metadata = {
  title: 'About Us',
  description: 'Learn about Cute Things — your go-to shop for adorable plush toys, anime gifts, and cute accessories in Sri Lanka.',
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: '50%', background: 'rgba(197,168,128,0.1)', color: '#c5a880', marginBottom: 16 }}>
          <Sparkles size={40} />
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, margin: '0 0 16px' }}>
          About <span className="gradient-brand-text">Cute Things</span>
        </h1>
        <p style={{ fontSize: 18, color: '#6b7280', lineHeight: 1.7 }}>
          Sri Lanka's cutest online shop for plush toys, anime gifts & adorable accessories.
        </p>
      </div>

      {/* Story */}
      <div style={{ background: 'linear-gradient(135deg,#fce4ec,#f3e5f5)', borderRadius: 20, padding: '40px', marginBottom: 40, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1, color: '#c5a880' }}>
          <Heart size={150} fill="#c5a880" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          Our Story <Heart size={20} color="#e91e8c" fill="#e91e8c" />
        </h2>
        <p style={{ fontSize: 16, color: '#4b5563', lineHeight: 1.8, margin: 0, position: 'relative', zIndex: 1 }}>
          Cute Things started with a simple love for adorable products — fluffy plushies, anime collectibles, and charming accessories that bring a smile to anyone's face. We began sharing our finds on TikTok and were overwhelmed by the response from our community. Today, we're proud to bring these cute treasures directly to your door, island-wide across Sri Lanka.
        </p>
      </div>

      {/* Values */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20, marginBottom: 40 }}>
        {[
          { icon: Heart, title: 'Curated with Love',    desc: 'Every product is hand-picked for cuteness and quality', color: '#e91e8c' },
          { icon: Truck, title: 'Island-wide Delivery', desc: 'We deliver to every corner of Sri Lanka', color: '#3b82f6' },
          { icon: CreditCard, title: 'Easy Payments',     desc: 'COD, Bank Transfer & Card Payment options', color: '#10b981' },
          { icon: Star, title: 'Customer First',       desc: 'Your happiness is our top priority', color: '#f59e0b' },
        ].map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="card" style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: color }}>
              <Icon size={24} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>{title}</h3>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Social */}
      <div style={{ textAlign: 'center', background: '#0f0f1a', borderRadius: 20, padding: '40px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          Follow Our Journey <Music size={20} color="#c5a880" />
        </h2>
        <p style={{ color: 'rgba(255,255,255,.6)', marginBottom: 24 }}>
          Watch our TikTok videos for unboxings, product showcases, and behind-the-scenes cuteness!
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
