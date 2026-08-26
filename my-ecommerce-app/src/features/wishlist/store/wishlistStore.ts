import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../../../core/interfaces/Product';

interface WishlistState {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number | string) => void;
  toggleWishlist: (product: Product) => boolean; // returns true if added, false if removed
  isInWishlist: (productId: number | string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addToWishlist: (product) => {
        const { items } = get();
        if (!items.some((item) => String(item.id) === String(product.id))) {
          set({ items: [product, ...items] });
        }
      },

      removeFromWishlist: (productId) => {
        set({ items: get().items.filter((item) => String(item.id) !== String(productId)) });
      },

      toggleWishlist: (product) => {
        const { items, addToWishlist, removeFromWishlist } = get();
        const exists = items.some((item) => String(item.id) === String(product.id));
        if (exists) {
          removeFromWishlist(product.id);
          return false;
        } else {
          addToWishlist(product);
          return true;
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => String(item.id) === String(productId));
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'nova_wishlist_storage',
    }
  )
);