import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getProductImage } from "@/lib/product-images";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/components/ProductCard";

export const Route = createFileRoute("/produto/$id")({ component: ProductDetail });

function ProductDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState(1);

  const { data: p, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
  });

  if (isLoading) return <p className="text-center py-32 text-muted-foreground">Carregando…</p>;
  if (!p) return <p className="text-center py-32 text-muted-foreground">Produto não encontrado.</p>;

  const addToCart = () => {
    if (!size) { toast.error("Selecione um tamanho"); return; }
    add({ productId: p.id, name: p.name, color: p.color, size, price: Number(p.price), image_url: p.image_url, quantity: qty });
    toast.success("Adicionado ao carrinho!");
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 min-h-screen">
      <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
      </Link>
      <div className="grid md:grid-cols-2 gap-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="aspect-square bg-card border border-border rounded-3xl overflow-hidden">
          <img src={getProductImage(p.image_url)} alt={p.name} className="w-full h-full object-cover" />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div>
            <span className="text-xs rounded-full bg-secondary px-3 py-1">{p.category}</span>
            <h1 className="mt-3 text-4xl font-black">{p.name}</h1>
            <p className="text-muted-foreground">Cor: <span className="text-foreground font-semibold">{p.color}</span></p>
          </div>
          <p className="text-4xl font-black text-accent">R$ {Number(p.price).toFixed(2).replace(".", ",")}</p>
          {p.description && <p className="text-muted-foreground">{p.description}</p>}

          <div>
            <p className="text-sm font-semibold mb-2">Tamanho</p>
            <div className="flex flex-wrap gap-2">
              {p.sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)}
                  className={`min-w-14 px-4 py-2 rounded-lg border-2 font-semibold transition-all ${size === s ? "border-accent bg-accent text-accent-foreground" : "border-border hover:border-accent"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Quantidade</p>
            <div className="inline-flex items-center rounded-lg border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 hover:bg-secondary">−</button>
              <span className="px-5 font-bold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-4 py-2 hover:bg-secondary">+</button>
            </div>
            <span className="ml-3 text-sm text-muted-foreground">{p.stock} em estoque</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={addToCart}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground font-bold py-4 hover:scale-105 transition-transform">
              <ShoppingBag className="h-5 w-5" /> Adicionar ao carrinho
            </button>
            <button onClick={() => { addToCart(); nav({ to: "/checkout" }); }}
              className="rounded-full border border-border font-bold px-6 hover:bg-secondary transition">
              Comprar agora
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}