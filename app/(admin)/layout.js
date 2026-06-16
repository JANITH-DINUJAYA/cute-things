'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db } from '@/lib/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import useAuthStore from '@/store/authStore';
import AdminSidebar from '@/components/admin/Sidebar';
import AdminTopbar  from '@/components/admin/Topbar';

export default function AdminLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { setUser, setAdminUser, setLoading, clearAuth, loading } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        clearAuth();
        router.replace('/auth/login');
        return;
      }
      setUser(user);
      // Fetch Firestore user doc for permissions
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists()) {
        clearAuth();
        router.replace('/auth/login');
        return;
      }
      setAdminUser({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg,#1a1a2e,#16213e)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(197,168,128,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'#c5a880' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(197,168,128,.3)', borderTop: '3px solid #c5a880',
            borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AdminTopbar onMenuToggle={() => setMobileMenuOpen((v) => !v)} />
        <main style={{ flex: 1, padding: '24px 24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
