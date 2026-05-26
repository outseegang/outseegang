import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { getProductImage } from "@/lib/product-images";

export interface Product {
  id: string;
  name: string;
  category: string;
  color: string;
  price: number;
  sizes: string[];
  stock: number;
  image_url: string;
  description: string | null;
  tags?: string[];
}

function tagClass(t: string) {
  const u = t.toUpperCase();
  if (u === "NOVO" || u === "LANÇAMENTO") return "bg-emerald-500 text-white";
  if (u === "EM ALTA" || u === "MAIS VENDIDO") return "bg-orange-500 text-white";
  if (u === "MENOR PREÇO" || u === "PROMOÇÃO") return "bg-rose-500 text-white";
  if (u === "ÚLTIMAS UNIDADES") return "bg-amber-500 text-black";
  return "bg-accent text-accent-foreground";
}

export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
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
            <p className="text-xs text-muted-foreground">{p.color}</p>
          </div>
          <span className="text-xs rounded-full bg-secondary px-2 py-1">{p.category}</span>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-xl font-bold text-accent">
            R$ {Number(p.price).toFixed(2).replace(".", ",")}
          </p>
          <p className="text-xs text-muted-foreground">{p.stock} em estoque</p>
        </div>
        <div className="flex flex-wrap gap-1 pt-1">
          {p.sizes.map((s) => (
            <span key={s} className="text-[10px] border border-border rounded px-1.5 py-0.5">{s}</span>
          ))}
        </div>
      </div>
      </Link>
    </motion.div>
  );
}