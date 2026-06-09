import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user:        null,  // Firebase Auth user object
  adminUser:   null,  // Firestore users/{uid} document
  role:        null,  // 'superadmin' | 'admin' | 'staff' | null
  permissions: {},    // permission map from Firestore
  loading:     true,

  setUser: (user) => set({ user }),

  setAdminUser: (adminUser) =>
    set({
      adminUser,
      role:        adminUser?.role        ?? null,
      permissions: adminUser?.permissions ?? {},
    }),

  setLoading: (loading) => set({ loading }),

  clearAuth: () =>
    set({
      user:        null,
      adminUser:   null,
      role:        null,
      permissions: {},
      loading:     false,
    }),

  /** Check if current user has a specific permission */
  hasPermission: (key) => {
    const { role, permissions } = useAuthStore.getState();
    if (role === 'superadmin') return true;
    return !!permissions[key];
  },
}));

export default useAuthStore;
