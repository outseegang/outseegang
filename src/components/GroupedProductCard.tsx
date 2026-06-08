import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, Check, Pencil } from "lucide-react";
import { toast } from "sonner";
import { getProductImage } from "@/lib/product-images";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Product } from "@/components/ProductCard";

function tagClass(t: string) {
  const u = t.toUpperCase();
  if (u === "NOVO" || u === "LANÇAMENTO") return "bg-emerald-500 text-white";
  if (u === "EM ALTA" || u === "MAIS VENDIDO") return "bg-orange-500 text-white";
  if (u === "MENOR PREÇO" || u === "PROMOÇÃO") return "bg-rose-500 text-white";
  if (u === "ÚLTIMAS UNIDADES") return "bg-amber-500 text-black";
  return "bg-accent text-accent-foreground";
}

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

function swatch(color: string, hex: string | null): string {
  if (hex) return hex;
  const key = color.trim().toLowerCase();
  return COLOR_MAP[key] ?? "#999999";
}

export function GroupedProductCard({
  variants,
  index = 0,
  preferredColor,
}: {
  variants: Product[];
  index?: number;
  preferredColor?: string;
}) {
  const { add } = useCart();
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [editingColor, setEditingColor] = useState(false);
  const [colorDraft, setColorDraft] = useState("");
  const groupKey = `outsee_variant_${variants[0]?.name}_${variants[0]?.category}`;
  const resolveIdx = (color?: string) => {
    if (color) {
      const i = variants.findIndex((v) => v.color.trim().toLowerCase() === color.trim().toLowerCase());
      if (i >= 0) return i;
    }
    return Math.max(0, variants.findIndex((v) => v.is_primary));
  };
  const [selected, setSelected] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(groupKey);
      if (saved) {
        const i = variants.findIndex((v) => v.id === saved);
        if (i >= 0) return i;
      }
    }
    return resolveIdx(preferredColor);
  });
  useEffect(() => {
    if (preferredColor) setSelected(resolveIdx(preferredColor));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferredColor]);
  useEffect(() => {
    if (typeof window !== "undefined" && variants[selected]) {
      localStorage.setItem(groupKey, variants[selected].id);
    }
  }, [selected, groupKey, variants]);
  const p = variants[selected];
  const totalStock = variants.reduce((s, v) => s + v.stock, 0);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (p.stock <= 0) {
      toast.error("Variante sem estoque");
      return;
    }
    add({
      productId: p.id,
      name: p.name,
      color: p.color,
      size: p.sizes[0] ?? "Único",
      price: Number(p.price),
      image_url: p.image_url,
      quantity: 1,
    });
    toast.success(`${p.name} (${p.color}) adicionado ao carrinho`);
  };

  const saveColor = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = colorDraft.trim();
    if (!next || next === p.color) { setEditingColor(false); return; }
    const { error } = await supabase.from("products").update({ color: next }).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Cor atualizada");
    setEditingColor(false);
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="group rounded-2xl bg-card border border-border overflow-hidden shadow-[var(--shadow-glow)]"
    >
      <Link to="/produto/$id" params={{ id: p.id }} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {p.tags && p.tags.length > 0 && (
            <div className="absolute top-2 left-2 z-10 flex flex-col items-start gap-1">
              {p.tags.map((t) => (
                <span key={t} className={`text-[10px] font-black tracking-wide rounded-full px-2 py-0.5 shadow ${tagClass(t)}`}>
                  {t.toUpperCase()}
                </span>
              ))}
            </div>
          )}
          <img src={getProductImage(p.image_url)} alt={`${p.name} ${p.color}`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold leading-tight">{p.name}</h3>
              <p className="text-xs text-muted-foreground">
                Cor: <span className="font-semibold text-foreground">{p.color}</span>
              </p>
            </div>
            <span className="text-xs rounded-full bg-secondary px-2 py-1">{p.category}</span>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-xl font-bold text-accent">
              R$ {Number(p.price).toFixed(2).replace(".", ",")}
            </p>
            <p className="text-xs text-muted-foreground">{totalStock} em estoque</p>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {p.sizes.map((s) => (
              <span key={s} className="text-[10px] border border-border rounded px-1.5 py-0.5">{s}</span>
            ))}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 -mt-1 space-y-3">
        {isAdmin && (
          <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            {editingColor ? (
              <form onSubmit={saveColor} className="flex gap-1.5">
                <input
                  autoFocus
                  value={colorDraft}
                  onChange={(e) => setColorDraft(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Nome da cor"
                  className="flex-1 rounded-md bg-secondary px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button type="submit" className="rounded-md bg-accent text-accent-foreground p-1.5" title="Salvar">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => setEditingColor(false)} className="rounded-md bg-secondary p-1.5" title="Cancelar">
                  <span className="text-xs px-0.5">×</span>
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setColorDraft(p.color); setEditingColor(true); }}
                className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide rounded-full bg-secondary px-2 py-1 hover:bg-muted transition"
              >
                <Pencil className="h-3 w-3" /> Editar cor ({p.color})
              </button>
            )}
          </div>
        )}
        {variants.length > 1 && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">
              {variants.length} cores
            </p>
            <div className="flex flex-wrap gap-1.5">
              {variants.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  title={v.color}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelected(i);
                  }}
                  className={`h-6 w-6 rounded-full border-2 transition ${i === selected ? "border-accent scale-110 ring-2 ring-accent/40" : "border-border hover:border-muted-foreground"}`}
                  style={{ backgroundColor: swatch(v.color, v.color_hex) }}
                  aria-label={v.color}
                />
              ))}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={handleAdd}
          disabled={p.stock <= 0}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ShoppingBag className="h-4 w-4" />
          {p.stock <= 0 ? "Sem estoque" : "Adicionar ao carrinho"}
        </button>
      </div>
    </motion.div>
  );
}