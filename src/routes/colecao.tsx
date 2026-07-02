import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/components/ProductCard";
import { GroupedProductCard } from "@/components/GroupedProductCard";
import { useProductsRealtime } from "@/hooks/useProductsRealtime";
import { Footer } from "@/components/Footer";

type Search = { cor?: string; cat?: string };

export const Route = createFileRoute("/colecao")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    cor: typeof s.cor === "string" ? s.cor : undefined,
    cat: typeof s.cat === "string" ? s.cat : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Coleção — OUTSEE" },
      { name: "description", content: "Toda a coleção OUTSEE de moletons e tênis, organizada por cor." },
      { property: "og:title", content: "Coleção OUTSEE" },
      { property: "og:description", content: "Moletons e tênis por cor. Edições limitadas." },
    ],
  }),
  component: Colecao,
});

const COLOR_MAP: Record<string, string> = {
  preto: "#0a0a0a", branco: "#f5f5f5", cinza: "#7a7a7a",
  vermelho: "#dc2626", azul: "#2563eb", "azul marinho": "#0c2340",
  verde: "#16a34a", militar: "#4a5d23", amarelo: "#facc15",
  rosa: "#ec4899", roxo: "#7c3aed", laranja: "#f97316",
  marrom: "#78350f", bege: "#d4b896", vinho: "#7c1d2d",
};

function swatch(color: string, hex: string | null): string {
  if (hex) return hex;
  return COLOR_MAP[color.trim().toLowerCase()] ?? "#999";
}

function Section({ title, subtitle, products, cor }: { title: string; subtitle: string; products: Product[]; cor?: string }) {
  const groups = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of products) {
      const key = `${p.name}`;
      const arr = map.get(key) ?? [];
      arr.push(p);
      map.set(key, arr);
    }
    return Array.from(map.values());
  }, [products]);

  const filtered = cor
    ? groups.filter((g) => g.some((v) => v.color.trim().toLowerCase() === cor.trim().toLowerCase()))
    : groups;

  if (filtered.length === 0) return null;

  return (
    <section className="mb-24">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3">— {subtitle}</p>
        <h2 className="font-display text-5xl md:text-6xl uppercase leading-none">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filtered.map((variants, i) => (
          <GroupedProductCard key={variants[0].id} variants={variants} index={i} preferredColor={cor} />
        ))}
      </div>
    </section>
  );
}

function Colecao() {
  useProductsRealtime();
  const { cor: initCor, cat: initCat } = Route.useSearch();
  const [cor, setCor] = useState<string | undefined>(initCor);
  const [cat, setCat] = useState<string>(initCat ?? "Todos");

  const { data: all = [], isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("category");
      if (error) throw error;
      return data as Product[];
    },
  });

  const colors = useMemo(() => {
    const map = new Map<string, { name: string; hex: string }>();
    for (const p of all) {
      const key = p.color.trim().toLowerCase();
      if (!map.has(key)) map.set(key, { name: p.color, hex: swatch(p.color, p.color_hex) });
    }
    return Array.from(map.values());
  }, [all]);

  const moletons = all.filter((p) => /moletom|moleton/i.test(p.category) || /moletom/i.test(p.name));
  const tenis = all.filter((p) => /t[êe]nis|sneaker/i.test(p.category) || /t[êe]nis/i.test(p.name));
  const outros = all.filter((p) => !moletons.includes(p) && !tenis.includes(p));

  const showMoletons = cat === "Todos" || cat === "Moletons";
  const showTenis = cat === "Todos" || cat === "Tênis";
  const showOutros = cat === "Todos" && outros.length > 0;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4">— Coleção completa</p>
          <h1 className="font-display text-6xl md:text-8xl uppercase leading-[0.9]">
            A coleção<br /><span className="text-white/40">por cor.</span>
          </h1>
          <p className="mt-6 max-w-xl text-white/60">
            Moletons e tênis OUTSEE em todas as cores. Filtre para encontrar sua vibe.
          </p>
        </motion.div>

        {/* Category filter */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {["Todos", "Moletons", "Tênis"].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                cat === c ? "bg-white text-black" : "border border-white/20 text-white/70 hover:bg-white/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Color filter */}
        <div className="mb-14">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">Filtrar por cor</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCor(undefined)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                !cor ? "bg-white text-black" : "border border-white/20 text-white/70 hover:bg-white/10"
              }`}
            >
              Todas
            </button>
            {colors.map((c) => {
              const active = cor?.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.name}
                  onClick={() => setCor(active ? undefined : c.name)}
                  className={`inline-flex items-center gap-2 rounded-full pl-1.5 pr-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    active ? "bg-white text-black" : "border border-white/20 text-white/70 hover:bg-white/10"
                  }`}
                  title={c.name}
                >
                  <span className="h-6 w-6 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <p className="text-center py-20 text-white/50">Carregando coleção…</p>
        ) : (
          <>
            {showMoletons && <Section title="Moletons" subtitle="Peso 380gsm · Edição 01" products={moletons} cor={cor} />}
            {showTenis && <Section title="Tênis" subtitle="Solado premium · Numerado" products={tenis} cor={cor} />}
            {showOutros && <Section title="Outros" subtitle="Complementos" products={outros} cor={cor} />}
            {all.length === 0 && (
              <p className="text-center py-20 text-white/50">
                Nenhum produto ainda. <Link to="/catalogo" className="underline">Ver catálogo</Link>
              </p>
            )}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}