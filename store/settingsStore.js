import { create } from 'zustand';

const useSettingsStore = create((set, get) => ({
  general: {
    siteName: 'Cute Things',
    tagline: 'Adorable Gifts & Plushies',
    contactEmail: 'hello@cutethings.lk',
    phone: '',
    address: '',
    facebookUrl: 'https://www.facebook.com/share/17Qros4sRV/',
    tiktokUrl: 'https://www.tiktok.com/@cute.things516',
    maintenanceMode: false,
  },
  shipping: {
    defaultFee: 350,
    freeShippingThreshold: 5000,
  },
  loading: false,
  fetched: false,

  fetchSettings: async () => {
    // Avoid re-fetching if already fetched during this session
    if (get().fetched || get().loading) return;

    set({ loading: true });
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        set({
          general: { ...get().general, ...data.general },
          shipping: { ...get().shipping, ...data.shipping },
          fetched: true,
        });
      }
    } catch (err) {
      console.error('Error fetching public settings:', err);
    } finally {
      set({ loading: false });
    }
  },
}));

export default useSettingsStore;
