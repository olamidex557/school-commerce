"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  CART_STORAGE_KEY,
  deserializeCart,
  normalizeCartItems,
  serializeCart,
  type CartItem,
} from "@/lib/cart";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  hydrated: boolean;
  addItem: (item: CartItem) => void;
  setQuantity: (productId: string, variantId: string, quantity: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setItems(
        deserializeCart(window.localStorage.getItem(CART_STORAGE_KEY)).items,
      );
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);
  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(CART_STORAGE_KEY, serializeCart(items));
  }, [hydrated, items]);
  const value = useMemo<CartContextValue>(
    () => ({
      items,
      hydrated,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
      addItem: (item) =>
        setItems((current) => normalizeCartItems([...current, item])),
      setQuantity: (productId, variantId, quantity) =>
        setItems((current) =>
          normalizeCartItems(
            current.map((item) =>
              item.productId === productId && item.variantId === variantId
                ? { ...item, quantity }
                : item,
            ),
          ),
        ),
      removeItem: (productId, variantId) =>
        setItems((current) =>
          current.filter(
            (item) =>
              item.productId !== productId || item.variantId !== variantId,
          ),
        ),
      clearCart: () => setItems([]),
    }),
    [hydrated, items],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
