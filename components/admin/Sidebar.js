'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Tag, TrendingUp, Shield, Settings, X, ChevronRight,
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useState } from 'react';

const iconMap = { LayoutDashboard, Package, ShoppingBag, Users, Tag, TrendingUp, Shield, Settings };

const navItems = [
  { label: 'Dashboard',  href: '/admin',             icon: 'LayoutDashboard', permission: null              },
  { label: 'Products',   href: '/admin/products',    icon: 'Package',         permission: 'manageProducts'  },
  { label: 'Orders',     href: '/admin/orders',      icon: 'ShoppingBag',     permission: 'manageOrders'    },
  { label: 'Customers',  href: '/admin/customers',   icon: 'Users',           permission: 'manageCustomers' },
  { label: 'Categories', href: '/admin/categories',  icon: 'Tag',             permission: 'manageCategories'},
  { label: 'Marketing',  href: '/admin/marketing',   icon: 'TrendingUp',      permission: 'manageMarketing' },
  { label: 'Users',      href: '/admin/users',       icon: 'Shield',          permission: 'manageUsers'     },
  { label: 'Settings',   href: '/admin/settings',    icon: 'Settings',        permission: 'manageSettings'  },
];

export default function AdminSidebar() {
  const pathname      = usePathname();
  const { role, permissions, adminUser } = useAuthStore();
  const [collapsed,   setCollapsed] = useState(false);

  function canAccess(permission) {
    if (!permission || role === 'superadmin') return true;
    return !!permissions?.[permission];
  }

  const visibleItems = navItems.filter((n) => canAccess(n.permission));

  return (
    <aside style={{
      width: collapsed ? 68 : 240,
      minHeight: '100vh',
      background: '#0f0f1a',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: 'width .25s ease',
      overflow: 'hidden',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 16px' : '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={34}
              height={34}
              style={{
                borderRadius: 6,
                objectFit: 'cover',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginRight: 4
              }}
            />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#fff' }}>Cute Things</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Admin Panel</p>
            </div>
          </div>
        )}
        {collapsed && (
          <Image
            src="/logo.jpg"
            alt="Logo"
            width={28}
            height={28}
            style={{ borderRadius: 4, objectFit: 'cover' }}
          />
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', display: collapsed ? 'none' : 'flex', alignItems: 'center' }}>
          <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#e91e8c,#9c27b0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {adminUser?.displayName?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {adminUser?.displayName ?? 'Admin'}
              </p>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                padding: '2px 6px', borderRadius: 4,
                background: role === 'superadmin' ? 'rgba(233,30,140,.25)' : 'rgba(156,39,176,.2)',
                color: role === 'superadmin' ? '#f9a8d4' : '#d8b4fe',
              }}>
                {role === 'superadmin' ? '👑 Super Admin' : role === 'admin' ? 'Admin' : 'Staff'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {visibleItems.map(({ label, href, icon }) => {
          const Icon     = iconMap[icon];
          const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link key={href} href={href} title={collapsed ? label : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px' : '10px 12px',
                borderRadius: 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                textDecoration: 'none',
                background: isActive ? 'linear-gradient(135deg,#e91e8c,#9c27b0)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,.55)',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                transition: 'all .2s',
                boxShadow: isActive ? '0 4px 12px rgba(233,30,140,.3)' : 'none',
              }}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle at bottom */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <button onClick={() => setCollapsed(!collapsed)}
          style={{
            width: '100%', padding: '10px', borderRadius: 10, border: 'none',
            background: 'rgba(255,255,255,.05)', cursor: 'pointer',
            color: 'rgba(255,255,255,.4)', display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start', gap: 8, fontSize: 13,
          }}>
          <ChevronRight size={16} style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform .25s' }} />
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  );
}
