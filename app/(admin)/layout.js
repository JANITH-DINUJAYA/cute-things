'use client';

import { useEffect } from 'react';
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg,#1a1a2e,#16213e)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🌸</div>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(233,30,140,.3)', borderTop: '3px solid #e91e8c',
            borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <AdminSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AdminTopbar />
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
