'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useSettingsStore from '@/store/settingsStore';
import { STORE_NAV_LINKS } from '@/lib/constants';

export default function Navbar() {
  const pathname    = usePathname();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const siteName = useSettingsStore((s) => s.general.siteName) || 'Cute Things';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      <div style={{
        background: '#120f11',
        color: '#e6d5b8',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        textAlign: 'center',
        padding: '8px 24px',
        borderBottom: '1px solid rgba(197,168,128,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontFamily: 'var(--font-sans)',
      }}>
        <span>🚚 Island-wide Delivery in Sri Lanka</span>
      </div>
      <header

        style={{
          position:  'sticky',
          top:       0,
          zIndex:    50,
          background: scrolled
            ? 'rgba(255,255,255,.92)'
            : 'rgba(255,255,255,.75)',
          backdropFilter: 'blur(20px)',
          borderBottom:   scrolled ? '1px solid #f0f0f0' : '1px solid transparent',
          transition:     'all 0.3s ease',
          boxShadow:      scrolled ? '0 2px 20px rgba(233,30,140,.06)' : 'none',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 68 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flex: 1 }}>
            <Image
              src="/logo.jpg"
              alt={`${siteName} Logo`}
              width={42}
              height={42}
              style={{
                borderRadius: 8,
                objectFit: 'cover',
                border: '1px solid rgba(197, 168, 128, 0.2)',
                boxShadow: '0 2px 8px rgba(197, 168, 128, 0.15)'
              }}
            />
            <span style={{
              fontSize: 20, fontWeight: 700, letterSpacing: '0.04em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-serif)',
              color: '#1e1a1d',
            }}>{siteName}</span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="hidden-mobile">
            {STORE_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '8px 16px',
                  borderRadius: 9999,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: pathname === link.href ? '#c5a880' : '#1e1a1d',
                  background: pathname === link.href ? 'rgba(197,168,128,.08)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            {/* Cart */}
            <Link href="/cart" id="cart-link" style={{ position: 'relative', textDecoration: 'none' }}>
              <button style={{
                width: 42, height: 42, borderRadius: 12,
                border: '1.5px solid #f0f0f0',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,.04)',
              }}>
                <ShoppingCart size={18} color="#374151" />
              </button>
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  background: '#1e1a1d',
                  color: '#fff', borderRadius: 9999,
                  minWidth: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  border: '2px solid #fff',
                }}>
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: 42, height: 42, borderRadius: 12,
                border: '1.5px solid #f0f0f0', background: '#fff',
                cursor: 'pointer', display: 'none',
                alignItems: 'center', justifyContent: 'center',
              }}
              className="show-mobile"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 40,
        }}>
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)', backdropFilter: 'blur(4px)' }}
          />
          <nav className="mobile-menu-drawer" style={{
            position: 'absolute', top: 68, left: 0, right: 0,
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            padding: '16px 24px 24px',
            boxShadow: '0 8px 32px rgba(0,0,0,.1)',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {STORE_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '12px 16px', borderRadius: 10,
                  fontSize: 15, fontWeight: 500, textDecoration: 'none',
                  color: pathname === link.href ? '#c5a880' : '#1e1a1d',
                  background: pathname === link.href ? 'rgba(197,168,128,.08)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) { .hidden-mobile { display: flex !important; } .show-mobile { display: none !important; } }
        @media (max-width: 767px) { .hidden-mobile { display: none !important; } .show-mobile { display: flex !important; } }
      `}</style>
    </>
  );
}
