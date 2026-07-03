import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/components/ProductCard";
import { GroupedProductCard } from "@/components/GroupedProductCard";
import { useProductsRealtime } from "@/hooks/useProductsRealtime";
import { Footer } from "@/components/Footer";
import { searchAndGroup, paginate, pageCount } from "@/lib/catalog-filters";

type Search = { cor?: string; cat?: string; q?: string; pag?: number };

export const Route = createFileRoute("/colecao")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    cor: typeof s.cor === "string" ? s.cor : undefined,
    cat: typeof s.cat === "string" ? s.cat : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
    pag: typeof s.pag === "number" ? s.pag : typeof s.pag === "string" ? Number(s.pag) || undefined : undefined,
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

type Grouped = { variants: Product[]; matchedColor?: string };

const PAGE_SIZE = 12;

function Section({
  title,
  subtitle,
  groups,
  preferred,
}: {
  title: string;
  subtitle: string;
  groups: Grouped[];
  preferred?: string;
}) {
  if (groups.length === 0) return null;
  return (
    <section className="mb-24">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3">— {subtitle}</p>
          <h2 className="font-display text-5xl md:text-6xl uppercase leading-none">{title}</h2>
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">
          {groups.length} {groups.length === 1 ? "modelo" : "modelos"}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {groups.map((g, i) => (
          <GroupedProductCard
            key={g.variants[0].id}
            variants={g.variants}
            index={i}
            preferredColor={g.matchedColor ?? preferred}
          />
        ))}
      </div>
    </section>
  );
}

function Colecao() {
  useProductsRealtime();
  const { cor: initCor, cat: initCat, q: initQ, pag: initPag } = Route.useSearch();
  const [cor, setCor] = useState<string | undefined>(initCor);
  const [cat, setCat] = useState<string>(initCat ?? "Todos");
  const [query, setQuery] = useState<string>(initQ ?? "");
  const [page, setPage] = useState<number>(initPag && initPag > 0 ? initPag : 1);

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

  // Group + search em um passo só — evita reagrupar por seção.
  const searched = useMemo<Grouped[]>(
    () => searchAndGroup(all, query, "Todos"),
    [all, query],
  );

  // Filtro por cor aplicado sobre grupos (mantém o card único).
  const colorFiltered = useMemo<Grouped[]>(() => {
    if (!cor) return searched;
    const key = cor.trim().toLowerCase();
    return searched.filter((g) => g.variants.some((v) => v.color.trim().toLowerCase() === key));
  }, [searched, cor]);

  // Divide em seções (moletons/tênis/outros) já agrupadas.
  const buckets = useMemo(() => {
    const isMoletom = (v: Product) => /moletom|moleton/i.test(v.category) || /moletom/i.test(v.name);
    const isTenis = (v: Product) => /t[êe]nis|sneaker/i.test(v.category) || /t[êe]nis/i.test(v.name);
    const m: Grouped[] = [];
    const t: Grouped[] = [];
    const o: Grouped[] = [];
    for (const g of colorFiltered) {
      if (g.variants.some(isMoletom)) m.push(g);
      else if (g.variants.some(isTenis)) t.push(g);
      else o.push(g);
    }
    return { moletons: m, tenis: t, outros: o };
  }, [colorFiltered]);

  const showMoletons = cat === "Todos" || cat === "Moletons";
  const showTenis = cat === "Todos" || cat === "Tênis";
  const showOutros = cat === "Todos" && buckets.outros.length > 0;

  // Aplica paginação baseada em GRUPOS.
  const activeGroups = useMemo<Grouped[]>(() => {
    const parts: Grouped[] = [];
    if (showMoletons) parts.push(...buckets.moletons);
    if (showTenis) parts.push(...buckets.tenis);
    if (showOutros) parts.push(...buckets.outros);
    return parts;
  }, [buckets, showMoletons, showTenis, showOutros]);

  const totalGroups = activeGroups.length;
  const totalPages = pageCount(totalGroups, PAGE_SIZE);
  const currentPage = Math.min(page, totalPages);
  const pagedIds = new Set(paginate(activeGroups, currentPage, PAGE_SIZE).map((g) => g.variants[0].id));
  const takePage = (arr: Grouped[]) => arr.filter((g) => pagedIds.has(g.variants[0].id));

  // Reset página quando filtros mudam.
  useEffect(() => {
    setPage(1);
  }, [query, cor, cat]);

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

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, cor, SKU ou categoria…"
              className="w-full rounded-full bg-white/5 border border-white/10 pl-11 pr-10 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

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

        {!isLoading && totalGroups > 0 && (
          <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-8">
            {totalGroups} {totalGroups === 1 ? "modelo encontrado" : "modelos encontrados"}
            {totalPages > 1 && ` · página ${currentPage} de ${totalPages}`}
          </p>
        )}

        {isLoading ? (
          <p className="text-center py-20 text-white/50">Carregando coleção…</p>
        ) : totalGroups === 0 ? (
          <p className="text-center py-20 text-white/50">
            {query || cor
              ? "Nenhum modelo encontrado com esses filtros."
              : (
                <>
                  Nenhum produto ainda. <Link to="/catalogo" className="underline">Ver catálogo</Link>
                </>
              )}
          </p>
        ) : (
          <>
            {showMoletons && (
              <Section
                title="Moletons"
                subtitle="Peso 380gsm · Edição 01"
                groups={takePage(buckets.moletons)}
                preferred={cor}
              />
            )}
            {showTenis && (
              <Section
                title="Tênis"
                subtitle="Solado premium · Numerado"
                groups={takePage(buckets.tenis)}
                preferred={cor}
              />
            )}
            {showOutros && (
              <Section
                title="Outros"
                subtitle="Complementos"
                groups={takePage(buckets.outros)}
                preferred={cor}
              />
            )}

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((n) => Math.max(1, n - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:bg-white/10 disabled:opacity-40"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-9 min-w-9 rounded-full px-3 text-xs font-bold uppercase tracking-wider transition ${
                      n === currentPage
                        ? "bg-white text-black"
                        : "border border-white/20 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((n) => Math.min(totalPages, n + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:bg-white/10 disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}