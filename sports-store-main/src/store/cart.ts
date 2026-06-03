"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item: CartItem) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (i) =>
            i.productId === item.productId &&
            i.size === item.size &&
            i.color === item.color
        );

        if (existingIndex > -1) {
          // Sản phẩm đã có trong giỏ → tăng số lượng
          const updatedItems = [...items];
          const newQty =
            updatedItems[existingIndex].quantity + item.quantity;
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: Math.min(newQty, item.stock),
          };
          set({ items: updatedItems });
        } else {
          // Thêm sản phẩm mới vào giỏ
          set({ items: [...items, item] });
        }
      },

      removeItem: (productId: string, size: string, color: string) => {
        set({
          items: get().items.filter(
            (i) =>
              !(
                i.productId === productId &&
                i.size === size &&
                i.color === color
              )
          ),
        });
      },

      updateQuantity: (
        productId: string,
        size: string,
        color: string,
        quantity: number
      ) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.productId === productId &&
            item.size === size &&
            item.color === color
              ? { ...item, quantity: Math.min(quantity, item.stock) }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "sports-store-cart",
    }
  )
);
