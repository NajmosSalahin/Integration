import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCart = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: ({ product, size }) => {
        const { items } = get();
        const existing = items.find(
          (item) => item.productId === product._id && item.size === size
        );

        if (existing) {
          set({
            items: items.map((item) =>
              item.productId === product._id && item.size === size
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                productId: product._id,
                title: product.title,
                price: product.price,
                image: product.images[0],
                size,
                quantity: 1,
              },
            ],
          });
        }
      },

      removeItem: (productId, size) => {
        set({
          items: get().items.filter(
            (item) => !(item.productId === productId && item.size === size)
          ),
        });
      },

      updateQuantity: (productId, size, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId, size);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.productId === productId && item.size === size
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    { name: 'integration-cart' }
  )
);

export default useCart;
