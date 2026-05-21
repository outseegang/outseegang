import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartItem {
  productId: string;
  name: string;
  color: string;
  size: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface CartCtx {
  items: CartItem[];
  add: (i: CartItem) => void;
  remove: (idx: number) => void;
  setQty: (idx: number, q: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "outsee_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = (i: CartItem) => setItems((prev) => {
    const found = prev.findIndex((p) => p.productId === i.productId && p.color === i.color && p.size === i.size);
    if (found >= 0) {
      const next = [...prev];
      next[found] = { ...next[found], quantity: next[found].quantity + i.quantity };
      return next;
    }
    return [...prev, i];
  });

  const remove = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const setQty = (idx: number, q: number) => setItems((prev) => prev.map((p, i) => i === idx ? { ...p, quantity: Math.max(1, q) } : p));
  const clear = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return <Ctx.Provider value={{ items, add, remove, setQty, clear, total, count }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}