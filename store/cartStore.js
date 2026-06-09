import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      /** Add item or increment quantity */
      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existing = items.find((i) => i.id === product.id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                id:       product.id,
                name:     product.name,
                price:    product.discountPrice ?? product.price,
                image:    product.images?.[0] ?? '',
                slug:     product.slug,
                quantity,
              },
            ],
          });
        }
      },

      /** Remove item entirely */
      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      /** Set exact quantity (min 1) */
      setQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        });
      },

      /** Empty cart */
      clearCart: () => set({ items: [] }),

      // ── Derived values ──────────────────────────────────────────────
      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      get subtotal() {
        return get().items.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );
      },
    }),
    {
      name: 'cute-things-cart', // localStorage key
    }
  )
);

export default useCartStore;
