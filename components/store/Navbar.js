'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Menu, X, Star, Truck, User, LogOut } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useSettingsStore from '@/store/settingsStore';
import useAuthStore from '@/store/authStore';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';

const NAV_LINKS = [
  { label: 'Home',    href: '/'       },
  { label: 'Shop',    href: '/shop'   },
  { label: 'About',   href: '/about'  },
  { label: 'Contact', href: '/contact'},
];

export default function Navbar() {
  const pathname   = usePathname();
  const router     = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount  = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const siteName   = useSettingsStore((s) => s.general.siteName) || 'Cute Things';
  const { user, clearAuth } = useAuthStore();

  const activeLinks = user
    ? [...NAV_LINKS, { label: 'Track Order', href: '/track-order' }]
    : NAV_LINKS;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const isFeaturedActive = pathname === '/shop/featured';

  return (
    <>
      {/* Delivery Banner */}
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
        <Truck size={13} color="#c5a880" />
        <span>Island-wide Delivery in Sri Lanka</span>
      </div>

      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.82)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid #f0f0f0' : '1px solid transparent',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 2px 20px rgba(197,168,128,.08)' : 'none',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 68 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flex: 1, minWidth: 0 }}>
            <Image
              src="/logo.jpg"
              alt={`${siteName} Logo`}
              width={42} height={42}
              style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(197,168,128,0.2)', boxShadow: '0 2px 8px rgba(197,168,128,0.15)', flexShrink: 0 }}
            />
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'var(--font-serif)', color: '#1e1a1d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {siteName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', gap: 4, alignItems: 'center', marginRight: 16 }} className="hidden-mobile">
            {activeLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '8px 16px', borderRadius: 9999,
                  fontSize: 14, fontWeight: 500, textDecoration: 'none',
                  color: pathname === link.href ? '#c5a880' : '#1e1a1d',
                  background: pathname === link.href ? 'rgba(197,168,128,.08)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Featured — special pill */}
            <Link
              href="/shop/featured"
              style={{
                padding: '7px 16px',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                letterSpacing: '0.04em',
                background: isFeaturedActive
                  ? 'linear-gradient(135deg,#c5a880,#e5b3b3)'
                  : 'linear-gradient(135deg,rgba(197,168,128,0.12),rgba(229,179,179,0.12))',
                color: isFeaturedActive ? '#fff' : '#c5a880',
                border: '1.5px solid rgba(197,168,128,0.35)',
                transition: 'all 0.25s',
                boxShadow: isFeaturedActive ? '0 4px 14px rgba(197,168,128,0.3)' : 'none',
              }}
            >
              Featured
            </Link>
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Cart */}
            <Link href="/cart" id="cart-link" style={{ position: 'relative', textDecoration: 'none' }}>
              <button style={{
                width: 42, height: 42, borderRadius: 12,
                border: '1.5px solid #f0f0f0', background: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,.04)',
              }}>
                <ShoppingCart size={18} color="#374151" />
              </button>
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  background: '#1e1a1d', color: '#fff', borderRadius: 9999,
                  minWidth: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, border: '2px solid #fff',
                }}>
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Auth section */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  height: 42, borderRadius: 12,
                  border: '1.5px solid #f0f0f0', background: '#faf8f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 12px', gap: 6, fontSize: 13, fontWeight: 600, color: '#c5a880',
                }}>
                  <User size={16} />
                  <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hidden-mobile">
                    {user.displayName || 'User'}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    await signOut(auth);
                    clearAuth();
                    router.push('/');
                  }}
                  style={{
                    width: 42, height: 42, borderRadius: 12,
                    border: '1.5px solid #f0f0f0', background: '#fff',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                  }}
                  title="Sign Out"
                >
                  <LogOut size={16} color="#dc2626" />
                </button>
              </div>
            ) : (
              <Link href="/login" style={{ textDecoration: 'none' }} id="login-link">
                <button style={{
                  height: 42, borderRadius: 12,
                  border: '1.5px solid #f0f0f0', background: '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 16px', gap: 8, fontSize: 13, fontWeight: 600, color: '#374151',
                  transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                }} className="nav-login-btn">
                  <User size={16} />
                  <span className="hidden-mobile">Sign In</span>
                </button>
              </Link>
            )}

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
        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }}>
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)', backdropFilter: 'blur(4px)' }}
          />
          <nav className="mobile-menu-drawer" style={{
            position: 'absolute', top: 68, left: 0, right: 0,
            background: '#fff', borderBottom: '1px solid #f0f0f0',
            padding: '16px 24px 24px',
            boxShadow: '0 8px 32px rgba(0,0,0,.1)',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {activeLinks.map((link) => (
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
            {/* Featured in mobile menu */}
            <Link
              href="/shop/featured"
              style={{
                padding: '12px 16px', borderRadius: 10,
                fontSize: 15, fontWeight: 700, textDecoration: 'none',
                display: 'flex', alignItems: 'center',
                color: isFeaturedActive ? '#fff' : '#c5a880',
                background: isFeaturedActive
                  ? 'linear-gradient(135deg,#c5a880,#e5b3b3)'
                  : 'rgba(197,168,128,0.08)',
              }}
            >
              Featured Products
            </Link>
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
