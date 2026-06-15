import { Truck, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { icon: Truck, label: "Envio para todo Brasil" },
  { icon: RotateCcw, label: "Troca facilitada" },
  { icon: ShieldCheck, label: "Pagamento seguro" },
  { icon: Sparkles, label: "Produtos exclusivos" },
];

export function AuthorityBar() {
  return (
    <section className="border-y border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-2">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flex items-center justify-center gap-3 group"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/5 border border-white/10 group-hover:bg-white group-hover:text-black transition-colors">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-foreground/80">
                  {it.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}