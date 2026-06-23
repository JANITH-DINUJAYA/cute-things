'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import useAuthStore from '@/store/authStore';

export default function AuthListener() {
  const { setUser, setAdminUser, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (!user) {
        clearAuth();
        return;
      }
      setUser(user);

      // Check if user is also an admin or staff.
      // Do not redirect them from the storefront if they are not!
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          setAdminUser({ id: snap.id, ...snap.data() });
        } else {
          setAdminUser(null);
        }
      } catch (err) {
        console.error('[AuthListener] Firestore fetch failed:', err.message);
        setAdminUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [setUser, setAdminUser, clearAuth, setLoading]);

  return null;
}
