import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Music2, Instagram, Heart, Mail, Phone } from 'lucide-react';

const footerLinks = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Plush Toys',   href: '/shop/plush-toys' },
    { label: 'Accessories',  href: '/shop/accessories' },
    { label: 'Gifts',        href: '/shop/gifts' },
  ],
  Help: [
    { label: 'FAQ',             href: '/faq' },
    { label: 'Contact Us',      href: '/contact' },
    { label: 'Shipping Policy', href: '/shipping-policy' },
    { label: 'Privacy Policy',  href: '/privacy-policy' },
  ],
  Company: [
    { label: 'About Us',          href: '/about' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: '#120f11', color: '#fff', paddingTop: 64 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Top grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, paddingBottom: 48 }}>

          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Image
                src="/logo.jpg"
                alt="Cute Things Logo"
                width={40}
                height={40}
                style={{
                  borderRadius: 8,
                  objectFit: 'cover',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              />
              <span style={{
                fontSize: 20, fontWeight: 700, letterSpacing: '0.04em',
                textTransform: 'uppercase', fontFamily: 'var(--font-serif)',
                color: '#fff',
              }}>
                Cute Things
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              Your one-stop shop for adorable plush toys, anime gifts, and cute accessories in Sri Lanka. 🐾
            </p>
            {/* Social */}
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="https://www.facebook.com/share/17Qros4sRV/" target="_blank" rel="noreferrer"
                 id="footer-facebook"
                 style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'background .2s' }}>
                <Facebook size={16} color="#fff" />
              </a>
              <a href="https://www.tiktok.com/@cute.things516" target="_blank" rel="noreferrer"
                 id="footer-tiktok"
                 style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'background .2s' }}>
                <Music2 size={16} color="#fff" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>
                {group}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} style={{ color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: 14, transition: 'color .2s' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 16 }}>
              Contact
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="mailto:hello@cutethings.lk"
                 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: 14 }}>
                <Mail size={14} /> hello@cutethings.lk
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.6)', fontSize: 14 }}>
                <Phone size={14} /> Available on Social Media
              </div>
            </div>

            {/* Trust badges */}
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['🚚 Cash on Delivery', '📦 Island-wide Shipping', '💖 Secure Shopping'].map((badge) => (
                <span key={badge} style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>{badge}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,.08)',
          padding: '20px 0',
          display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 13, margin: 0 }}>
            © {new Date().getFullYear()} Cute Things. All rights reserved.
          </p>
          <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 13, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            Made with <Heart size={12} color="#e91e8c" fill="#e91e8c" /> in Sri Lanka
          </p>
        </div>
      </div>
    </footer>
  );
}
