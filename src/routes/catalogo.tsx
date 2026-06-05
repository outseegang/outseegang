import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { type Product } from "@/components/ProductCard";
import { GroupedProductCard } from "@/components/GroupedProductCard";

type Search = { q?: string; cat?: string };

export const Route = createFileRoute("/catalogo")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    cat: typeof s.cat === "string" ? s.cat : undefined,
  }),
  component: Catalogo,
});

function Catalogo() {
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

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return all.filter((p) => {
      const matchCat = cat === "Todos" || p.category === cat;
      const matchTerm = !term || `${p.name} ${p.color} ${p.category} ${p.description ?? ""}`.toLowerCase().includes(term);
      return matchCat && matchTerm;
    });
  }, [all, query, cat]);

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of filtered) {
      const key = `${p.name}__${p.category}`;
      const arr = map.get(key) ?? [];
      arr.push(p);
      map.set(key, arr);
    }
    return Array.from(map.values());
  }, [filtered]);

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
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {grouped.map((variants, i) => (
            <GroupedProductCard key={variants[0].id} variants={variants} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}
