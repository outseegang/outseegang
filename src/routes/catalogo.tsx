import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { type Product } from "@/components/ProductCard";
import { GroupedProductCard } from "@/components/GroupedProductCard";
import { useProductsRealtime } from "@/hooks/useProductsRealtime";
import { searchAndGroup } from "@/lib/catalog-filters";

type Search = { q?: string; cat?: string };

export const Route = createFileRoute("/catalogo")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    cat: typeof s.cat === "string" ? s.cat : undefined,
  }),
  component: Catalogo,
});

function Catalogo() {
  useProductsRealtime();
  const { q: initQ, cat: initCat } = Route.useSearch();
  const [query, setQuery] = useState(initQ ?? "");
  const [cat, setCat] = useState(initCat ?? "Todos");

  const { data: all = [], isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("category");
      if (error) throw error;
      return data as Product[];
    },
  });

  const grouped = useMemo(() => searchAndGroup(all, query, cat), [all, query, cat]);

  const cats = ["Todos", ...Array.from(new Set(all.map((p) => p.category)))];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl md:text-5xl font-black">Catálogo</h1>
        <p className="text-muted-foreground mt-2">Toda a coleção Outsee num só lugar.</p>
      </motion.div>

      <div className="mt-8 flex flex-col md:flex-row gap-3">
        <input
          value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome, cor, categoria…"
          className="flex-1 rounded-full bg-secondary px-5 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${cat === c ? "bg-accent text-accent-foreground" : "bg-secondary hover:bg-muted"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-center py-20 text-muted-foreground">Carregando…</p>
      ) : grouped.length === 0 ? (
        <p className="text-center py-20 text-muted-foreground">Nenhum produto encontrado.</p>
      ) : (
        <>
          <p className="mt-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {grouped.length} {grouped.length === 1 ? "modelo" : "modelos"}
          </p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {grouped.map((g, i) => (
              <GroupedProductCard
                key={g.variants[0].id}
                variants={g.variants}
                index={i}
                preferredColor={g.matchedColor}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
