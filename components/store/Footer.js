'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Music2, Heart, Mail, Phone } from 'lucide-react';
import useSettingsStore from '@/store/settingsStore';

export default function Footer() {
  const general = useSettingsStore((s) => s.general);
  const siteName = general.siteName || 'Cute Things';
  const tagline = general.tagline || 'Your one-stop shop for adorable plush toys, anime gifts, and cute accessories in Sri Lanka. 🐾';
  const contactEmail = general.contactEmail || 'hello@cutethings.lk';
  const phone = general.phone;
  const facebookUrl = general.facebookUrl || 'https://www.facebook.com/share/17Qros4sRV/';
  const tiktokUrl = general.tiktokUrl || 'https://www.tiktok.com/@cute.things516';

  const quickLinks = [
    { label: 'Shop All', href: '/shop' },
    { label: 'About Us', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
    { label: 'Shipping Policy', href: '/shipping-policy' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
  ];

  return (
    <footer style={{ background: '#120f11', color: '#fff', padding: '48px 24px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Main compact row */}
        <div
          className="footer-main-row"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 32,
            paddingBottom: 32,
            borderBottom: '1px solid rgba(255,255,255,.08)'
          }}
        >
          {/* Brand & Socials */}
          <div className="footer-brand-col" style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 260, flex: '1 1 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Image
                src="/logo.jpg"
                alt={`${siteName} Logo`}
                width={36}
                height={36}
                style={{
                  borderRadius: 6,
                  objectFit: 'cover',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              />
              <span style={{
                fontSize: 18, fontWeight: 700, letterSpacing: '0.04em',
                textTransform: 'uppercase', fontFamily: 'var(--font-serif)',
                color: '#fff',
              }}>
                {siteName}
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, margin: 0, maxWidth: 320, lineHeight: 1.5 }}>
              {tagline}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noreferrer" id="footer-facebook"
                   style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}>
                  <Facebook size={14} color="#fff" />
                </a>
              )}
              {tiktokUrl && (
                <a href={tiktokUrl} target="_blank" rel="noreferrer" id="footer-tiktok"
                   style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}>
                  <Music2 size={14} color="#fff" />
                </a>
              )}
            </div>
          </div>

          {/* Quick links horizontally */}
          <div className="footer-links-col" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 24px', flex: '2 1 auto', justifyContent: 'center' }}>
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} style={{ color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color .2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#c5a880'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,.6)'}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200, flex: '1 1 auto', alignItems: 'flex-end' }} className="footer-contact-col">
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: 13 }}>
                <Mail size={13} color="#c5a880" /> {contactEmail}
              </a>
            )}
            {phone && (
              <a href={`tel:${phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                <Phone size={13} color="#c5a880" /> {phone}
              </a>
            )}
          </div>
        </div>

        {/* Centered Copyright & Made with Heart */}
        <div style={{
          paddingTop: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          textAlign: 'center'
        }}>
          <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 12, margin: 0 }}>
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 12, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            Made with <Heart size={11} color="#e5b3b3" fill="#e5b3b3" /> in Sri Lanka
          </p>
        </div>

      </div>
      <style>{`
        @media (max-width: 768px) {
          .footer-main-row {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 28px !important;
          }
          .footer-brand-col {
            align-items: center !important;
            text-align: center !important;
          }
          .footer-brand-col > div:first-child {
            justify-content: center !important;
          }
          .footer-brand-col > div:last-child {
            justify-content: center !important;
          }
          .footer-links-col {
            justify-content: center !important;
          }
          .footer-contact-col {
            align-items: center !important;
            text-align: center !important;
          }
        }
      `}</style>
    </footer>
  );
}
