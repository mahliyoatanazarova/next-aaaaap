"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const KEY = "cart";
const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem(KEY) || "[]"));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = (p, qty = 1) =>
    setItems((prev) => {
      const found = prev.find((i) => i.id === p._id);
      if (found)
        return prev.map((i) => (i.id === p._id ? { ...i, stock: p.stock, qty: Math.min(i.qty + qty, p.stock) } : i));
      return [
        ...prev,
        { id: p._id, name: p.name, price: p.price, image: p.image, category: p.category, stock: p.stock, qty: Math.min(qty, p.stock) },
      ];
    });
  const setQty = (id, qty) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) } : i)));
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  const value = useMemo(
    () => ({
      items,
      ready,
      add,
      setQty,
      remove,
      clear,
      count: items.reduce((s, i) => s + i.qty, 0),
      total: items.reduce((s, i) => s + i.qty * i.price, 0),
    }),
    [items, ready]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
