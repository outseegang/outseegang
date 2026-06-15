import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Ruler,
  ZoomIn,
  Flame,
  Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getProductImage } from "@/lib/product-images";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/components/ProductCard";
import { useProductsRealtime } from "@/hooks/useProductsRealtime";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/produto/$id")({ component: ProductDetail });

const sizeChart: Record<string, { chest: string; length: string; sleeve: string }> = {
  P: { chest: "100 cm", length: "68 cm", sleeve: "62 cm" },
  M: { chest: "106 cm", length: "70 cm", sleeve: "64 cm" },
  G: { chest: "112 cm", length: "72 cm", sleeve: "66 cm" },
  GG: { chest: "118 cm", length: "74 cm", sleeve: "68 cm" },
  XGG: { chest: "124 cm", length: "76 cm", sleeve: "70 cm" },
};

function ProductDetail() {
  useProductsRealtime();
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const imgWrapRef = useRef<HTMLDivElement>(null);

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

  const mainImg = getProductImage(p.image_url);
  const gallery = [mainImg, mainImg, mainImg, mainImg];
  const lowStock = p.stock > 0 && p.stock <= 5;

  const addToCart = () => {
    if (!size) {
      toast.error("Selecione um tamanho");
      return;
    }
    add({
      productId: p.id,
      name: p.name,
      color: p.color,
      size,
      price: Number(p.price),
      image_url: p.image_url,
      quantity: qty,
    });
    toast.success("Adicionado à sacola");
  };

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgWrapRef.current) return;
    const rect = imgWrapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ active: true, x, y });
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-white/50 hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar à coleção
        </Link>

        <div className="grid lg:grid-cols-[1fr_480px] gap-10">
          {/* GALLERY */}
          <div className="grid grid-cols-[80px_1fr] gap-4">
            <div className="flex flex-col gap-2">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square rounded-xl overflow-hidden border transition-colors ${
                    activeImg === i ? "border-white" : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img src={src} alt={`${p.name} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>

            <motion.div
              ref={imgWrapRef}
              onMouseMove={onMove}
              onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden cursor-zoom-in"
            >
              <img
                src={gallery[activeImg]}
                alt={p.name}
                className="w-full h-full object-cover transition-transform duration-200"
                style={{
                  transform: zoom.active ? "scale(2)" : "scale(1)",
                  transformOrigin: `${zoom.x}% ${zoom.y}%`,
                }}
              />
              <div className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-black/60 backdrop-blur border border-white/10">
                <ZoomIn className="h-4 w-4" />
              </div>
              {lowStock && (
                <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider px-3 py-1.5">
                  <Flame className="h-3 w-3" /> Últimas {p.stock} unidades
                </div>
              )}
            </motion.div>
          </div>

          {/* INFO */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 lg:sticky lg:top-24 self-start"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                {p.category} · DROP 01
              </p>
              <h1 className="mt-3 font-display text-5xl md:text-6xl uppercase leading-[0.9]">
                {p.name}
              </h1>
              <p className="mt-3 text-sm text-white/60">
                Cor: <span className="text-white font-semibold">{p.color}</span>
              </p>
            </div>

            <div className="flex items-end justify-between border-y border-white/10 py-5">
              <p className="text-4xl font-black tracking-tight">
                R$ {Number(p.price).toFixed(2).replace(".", ",")}
              </p>
              <p className="text-xs text-white/50">
                ou 4x de R$ {(Number(p.price) / 4).toFixed(2).replace(".", ",")} sem juros
              </p>
            </div>

            {/* TAMANHO */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider">Tamanho</p>
                <button
                  onClick={() => setSizeGuideOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white underline-offset-2 hover:underline"
                >
                  <Ruler className="h-3.5 w-3.5" /> Guia de tamanhos
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {p.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`py-3 rounded-lg border-2 font-bold transition-all ${
                      size === s
                        ? "border-white bg-white text-black"
                        : "border-white/15 hover:border-white/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {sizeGuideOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
                >
                  <table className="w-full text-xs">
                    <thead className="bg-white/5">
                      <tr className="text-left text-white/50 uppercase tracking-wider">
                        <th className="px-3 py-2">Tam.</th>
                        <th className="px-3 py-2">Peito</th>
                        <th className="px-3 py-2">Comprimento</th>
                        <th className="px-3 py-2">Manga</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.sizes
                        .filter((s) => sizeChart[s])
                        .map((s) => (
                          <tr key={s} className="border-t border-white/5">
                            <td className="px-3 py-2 font-bold">{s}</td>
                            <td className="px-3 py-2 text-white/70">{sizeChart[s].chest}</td>
                            <td className="px-3 py-2 text-white/70">{sizeChart[s].length}</td>
                            <td className="px-3 py-2 text-white/70">{sizeChart[s].sleeve}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </div>

            {/* QUANTIDADE */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider">Quantidade</p>
              <div className="inline-flex items-center rounded-full border border-white/15">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-2 hover:bg-white/5"
                >
                  −
                </button>
                <span className="px-5 font-bold tabular-nums">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-4 py-2 hover:bg-white/5"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={addToCart}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-white text-black font-bold uppercase tracking-wider text-sm py-4 hover:bg-white/90 transition-colors"
              >
                <ShoppingBag className="h-4 w-4" /> Adicionar à sacola
              </button>
              <button
                onClick={() => {
                  if (!size) {
                    toast.error("Selecione um tamanho");
                    return;
                  }
                  addToCart();
                  nav({ to: "/checkout" });
                }}
                className="rounded-full border border-white/20 font-bold uppercase tracking-wider text-sm py-4 hover:bg-white/10 transition-colors"
              >
                Comprar agora
              </button>
            </div>

            {/* DELIVERY / TRUST */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Truck className="h-4 w-4 text-white/60 shrink-0" />
                <p className="text-white/80">
                  Entrega estimada: <span className="text-white font-semibold">4 – 7 dias úteis</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-4 w-4 text-white/60 shrink-0" />
                <p className="text-white/80">Troca facilitada em até 30 dias</p>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-white/60 shrink-0" />
                <p className="text-white/80">Pagamento 100% seguro</p>
              </div>
              <div className="flex items-center gap-3">
                <Eye className="h-4 w-4 text-white/60 shrink-0" />
                <p className="text-white/80">
                  <span className="text-white font-semibold">38 pessoas</span> visualizando agora
                </p>
              </div>
            </div>

            {/* DESCRIPTION */}
            {p.description && (
              <div className="rounded-2xl border border-white/10 p-5">
                <p className="text-xs font-bold uppercase tracking-wider mb-3 text-white/60">
                  Descrição
                </p>
                <p className="text-sm text-white/80 leading-relaxed">{p.description}</p>
              </div>
            )}
          </motion.aside>
        </div>

        {/* DETALHES */}
        <section className="mt-24 grid md:grid-cols-3 gap-6">
          {[
            { title: "Tecido", body: "Algodão pesado 380gsm com toque encorpado e caimento estruturado." },
            { title: "Confecção", body: "Costura reforçada em pontos de tensão. Acabamento estúdio." },
            { title: "Identidade", body: "Etiqueta numerada, edição limitada e selo de autenticidade." },
          ].map((d) => (
            <div key={d.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">— Detalhe</p>
              <h3 className="font-display text-2xl uppercase">{d.title}</h3>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">{d.body}</p>
            </div>
          ))}
        </section>
      </div>

      <Footer />
    </main>
  );
}