'use client';

import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import useAuthStore from '@/store/authStore';
import { LogOut, ExternalLink, Bell } from 'lucide-react';
import Link from 'next/link';

// Map pathname to page title
function getPageTitle(pathname) {
  if (pathname === '/admin')                   return 'Dashboard';
  if (pathname.startsWith('/admin/products'))  return 'Products';
  if (pathname.startsWith('/admin/orders'))    return 'Orders';
  if (pathname.startsWith('/admin/customers')) return 'Customers';
  if (pathname.startsWith('/admin/categories'))return 'Categories';
  if (pathname.startsWith('/admin/marketing')) return 'Marketing';
  if (pathname.startsWith('/admin/users'))     return 'User Management';
  if (pathname.startsWith('/admin/settings'))  return 'Settings';
  return 'Admin Panel';
}

export default function AdminTopbar() {
  const router    = useRouter();
  const pathname  = usePathname();
  const { clearAuth, adminUser } = useAuthStore();
  const title = getPageTitle(pathname);

  async function handleLogout() {
    await signOut(auth);
    await fetch('/api/auth/session', { method: 'DELETE' });
    clearAuth();
    router.push('/auth/login');
  }

  return (
    <header style={{
      height: 64, background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      display: 'flex', alignItems: 'center',
      padding: '0 32px',
      justifyContent: 'space-between',
      boxShadow: '0 1px 4px rgba(0,0,0,.04)',
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      {/* Page title */}
      <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>{title}</h1>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* View Store */}
        <Link href="/" target="_blank"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10,
            border: '1.5px solid #e5e7eb', background: '#fff',
            textDecoration: 'none', fontSize: 13, fontWeight: 500, color: '#374151',
            transition: 'all .2s',
          }}>
          <ExternalLink size={14} /> View Store
        </Link>

        {/* Logout */}
        <button
          id="admin-logout-btn"
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10,
            border: '1.5px solid #fee2e2', background: '#fff5f5',
            fontSize: 13, fontWeight: 500, color: '#dc2626',
            cursor: 'pointer', transition: 'all .2s',
          }}>
          <LogOut size={14} /> Logout
        </button>
      </div>
    </header>
  );
}
