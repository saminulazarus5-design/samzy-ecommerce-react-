import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const KEY = "samzy_cart";

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const sameLine = (i, id, variant) => i.id === id && i.variant === variant;

  const addItem = (product, qty = 1, variant = "") =>
    setItems((prev) => {
      const existing = prev.find((i) => sameLine(i, product.id, variant));
      if (existing) return prev.map((i) => (sameLine(i, product.id, variant) ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { id: product.id, name: product.name, image: product.image, price: product.price, variant, qty }];
    });

  const updateQty = (id, variant, qty) =>
    setItems((prev) => prev.map((i) => (sameLine(i, id, variant) ? { ...i, qty: Math.max(1, qty) } : i)));

  const removeItem = (id, variant) => setItems((prev) => prev.filter((i) => !sameLine(i, id, variant)));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, count, subtotal, addItem, updateQty, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
