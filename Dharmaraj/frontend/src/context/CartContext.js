import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "drj_cart_v1";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems((curr) => {
      const existing = curr.find((i) => i.product_id === product.id);
      if (existing) {
        return curr.map((i) =>
          i.product_id === product.id ? { ...i, quantity: i.quantity + qty } : i,
        );
      }
      return [
        ...curr,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
          image: product.images?.[0],
        },
      ];
    });
    setDrawerOpen(true);
  };

  const removeItem = (product_id) =>
    setItems((curr) => curr.filter((i) => i.product_id !== product_id));

  const updateQty = (product_id, quantity) =>
    setItems((curr) =>
      curr
        .map((i) => (i.product_id === product_id ? { ...i, quantity: Math.max(1, quantity) } : i))
        .filter((i) => i.quantity > 0),
    );

  const clear = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items],
  );

  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  const value = {
    items,
    addItem,
    removeItem,
    updateQty,
    clear,
    subtotal,
    count,
    drawerOpen,
    setDrawerOpen,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
