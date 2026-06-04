import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { type Product } from "@/components/ProductCard";
import { GroupedProductCard } from "@/components/GroupedProductCard";

type Search = { q?: string; cat?: string; cor?: string };

const COLOR_MAP: Record<string, string> = {
  preto: "#0a0a0a", preta: "#0a0a0a", black: "#0a0a0a",
  branco: "#f5f5f5", branca: "#f5f5f5", white: "#f5f5f5",
  cinza: "#7a7a7a", grafite: "#3a3a3a", chumbo: "#4a4a4a",
  vermelho: "#dc2626", vermelha: "#dc2626",
  azul: "#2563eb", "azul marinho": "#0c2340", marinho: "#0c2340",
  verde: "#16a34a", militar: "#4a5d23", oliva: "#6b7a3a",
  amarelo: "#facc15", amarela: "#facc15",
  rosa: "#ec4899", pink: "#ec4899",
  roxo: "#7c3aed", lilas: "#a78bfa", "lilás": "#a78bfa",
  laranja: "#f97316",
  marrom: "#78350f", caramelo: "#b45309", bege: "#d4b896", areia: "#c9b99a",
  nude: "#e8c5a0",
  vinho: "#7c1d2d", bordo: "#7c1d2d", bordô: "#7c1d2d",
  dourado: "#c9a84c", prata: "#c0c0c0",
};

function swatch(color: string): string {
  const key = color.trim().toLowerCase();
  return COLOR_MAP[key] ?? "#999999";
}

export const Route = createFileRoute("/catalogo")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    cat: typeof s.cat === "string" ? s.cat : undefined,
    cor: typeof s.cor === "string" ? s.cor : undefined,
  }),
  component: Catalogo,
});

function Catalogo() {
  const navigate = useNavigate({ from: "/catalogo" });
  const { q: initQ, cat: initCat, cor: initCor } = Route.useSearch();
  const [query, setQuery] = useState(initQ ?? "");
  const [cat, setCat] = useState(initCat ?? "Todos");
  const activeCor = initCor?.trim().toLowerCase() || undefined;

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
      const matchCor = !activeCor || p.color.trim().toLowerCase() === activeCor;
      return matchCat && matchTerm && matchCor;
    });
  }, [all, query, cat, activeCor]);

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

  const availableColors = useMemo(() => {
    const set = new Set<string>();
    for (const p of all) set.add(p.color.trim());
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [all]);

  const setCorFilter = (color?: string) => {
    navigate({ search: (prev) => ({ ...prev, cor: color, page: 1 }) });
  };

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

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">Cores:</span>
        {availableColors.map((c) => {
          const isActive = activeCor === c.toLowerCase();
          return (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => setCorFilter(isActive ? undefined : c)}
              className={`h-7 w-7 rounded-full border-2 transition ${isActive ? "border-accent scale-110 ring-2 ring-accent/30" : "border-border hover:border-muted-foreground"}`}
              style={{ backgroundColor: swatch(c) }}
              aria-label={c}
            />
          );
        })}
      </div>

      {activeCor && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtro ativo:</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 text-accent px-3 py-1 text-sm font-semibold">
            <span className="inline-block h-3 w-3 rounded-full border border-current" style={{ backgroundColor: swatch(activeCor) }} />
            {activeCor.charAt(0).toUpperCase() + activeCor.slice(1)}
            <button onClick={() => setCorFilter(undefined)} className="ml-1 hover:opacity-70" aria-label="Remover filtro de cor">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        </div>
      )}

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