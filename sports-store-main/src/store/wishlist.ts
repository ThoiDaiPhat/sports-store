"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSession } from "next-auth/react";

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
}

interface WishlistState {
  lists: Record<string, WishlistItem[]>; // key: user email
  addItem: (item: WishlistItem, email: string) => void;
  removeItem: (productId: string, email: string) => void;
  toggleItem: (item: WishlistItem, email: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      lists: {},

      addItem: (item, email) => {
        if (!email) return;
        const currentList = get().lists[email] || [];
        if (!currentList.some((i) => i.productId === item.productId)) {
          set({
            lists: {
              ...get().lists,
              [email]: [...currentList, item],
            },
          });
        }
      },

      removeItem: (productId, email) => {
        if (!email) return;
        const currentList = get().lists[email] || [];
        set({
          lists: {
            ...get().lists,
            [email]: currentList.filter((i) => i.productId !== productId),
          },
        });
      },

      toggleItem: (item, email) => {
        if (!email) return;
        const currentList = get().lists[email] || [];
        if (currentList.some((i) => i.productId === item.productId)) {
          get().removeItem(item.productId, email);
        } else {
          get().addItem(item, email);
        }
      },
    }),
    {
      name: "sports-store-wishlist-v2",
    }
  )
);

// Custom hook to automatically bind with NextAuth session email
export function useWishlist() {
  const { data: session } = useSession();
  const email = session?.user?.email; // null/undefined if logged out

  const lists = useWishlistStore((state) => state.lists);
  const storeAddItem = useWishlistStore((state) => state.addItem);
  const storeRemoveItem = useWishlistStore((state) => state.removeItem);
  const storeToggleItem = useWishlistStore((state) => state.toggleItem);

  const items = email ? (lists[email] || []) : [];

  const addItem = (item: WishlistItem) => {
    if (email) storeAddItem(item, email);
  };

  const removeItem = (productId: string) => {
    if (email) storeRemoveItem(productId, email);
  };

  const toggleItem = (item: WishlistItem) => {
    if (email) storeToggleItem(item, email);
  };

  const hasItem = (productId: string) => {
    return items.some((i) => i.productId === productId);
  };

  return {
    items,
    addItem,
    removeItem,
    toggleItem,
    hasItem,
    isAuthenticated: !!email,
  };
}
