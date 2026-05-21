import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { getProductImage } from "@/lib/product-images";

export const Route = createFileRoute("/carrinho")({ component: Cart });

function Cart() {
  const { items, remove, setQty, total } = useCart();
  const nav = useNavigate();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 min-h-screen text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
        <h1 className="text-3xl font-black mt-4">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground mt-2">Explore o catálogo e adicione suas peças favoritas.</p>
        <Link to="/catalogo" className="inline-block mt-6 rounded-full bg-accent text-accent-foreground font-bold px-6 py-3 hover:scale-105 transition">
          Ir ao catálogo
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 min-h-screen">
      <h1 className="text-4xl font-black">Carrinho</h1>
      <div className="mt-8 grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((it, i) => (
              <motion.div key={`${it.productId}-${it.color}-${it.size}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex gap-4 bg-card border border-border rounded-2xl p-3">
                <img src={getProductImage(it.image_url)} className="w-24 h-24 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-bold">{it.name}</h3>
                  <p className="text-xs text-muted-foreground">{it.color} • Tam {it.size}</p>
                  <p className="text-accent font-bold mt-1">R$ {(it.price * it.quantity).toFixed(2).replace(".", ",")}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => remove(i)} className="p-2 hover:bg-destructive rounded transition"><Trash2 className="h-4 w-4" /></button>
                  <div className="inline-flex items-center rounded-lg border border-border text-sm">
                    <button onClick={() => setQty(i, it.quantity - 1)} className="px-2 py-1 hover:bg-secondary">−</button>
                    <span className="px-3 font-bold">{it.quantity}</span>
                    <button onClick={() => setQty(i, it.quantity + 1)} className="px-2 py-1 hover:bg-secondary">+</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 h-fit sticky top-24">
          <h2 className="font-black text-lg">Resumo</h2>
          <div className="flex justify-between mt-4 text-sm"><span>Subtotal</span><span>R$ {total.toFixed(2).replace(".", ",")}</span></div>
          <div className="flex justify-between text-sm"><span>Frete</span><span className="text-accent">Grátis</span></div>
          <div className="border-t border-border my-3" />
          <div className="flex justify-between font-black text-xl"><span>Total</span><span className="text-accent">R$ {total.toFixed(2).replace(".", ",")}</span></div>
          <button onClick={() => nav({ to: "/checkout" })}
            className="w-full mt-5 rounded-full bg-accent text-accent-foreground font-bold py-3 hover:scale-105 transition">
            Finalizar compra
          </button>
        </div>
      </div>
    </main>
  );
}