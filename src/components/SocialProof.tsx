import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, MapPin, AlertTriangle } from "lucide-react";

type Proof = { icon: typeof Flame; label: string };

const proofs: Proof[] = [
  { icon: MapPin, label: "João de São Paulo comprou Moletom Outsee Black" },
  { icon: Flame, label: "Tênis Outsee — mais vendido da semana" },
  { icon: AlertTriangle, label: "Últimas unidades disponíveis na Coleção 2026" },
  { icon: MapPin, label: "Marina do Rio de Janeiro acabou de comprar" },
  { icon: Flame, label: "Drop atual com 80% das peças vendidas" },
];

export function SocialProof() {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 3500);
    return () => clearTimeout(show);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setI((p) => (p + 1) % proofs.length), 5000);
    return () => clearInterval(id);
  }, [visible]);

  if (!visible) return null;
  const Item = proofs[i];
  const Icon = Item.icon;

  return (
    <div className="fixed bottom-24 left-4 z-40 hidden sm:block pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 px-4 py-2.5 shadow-2xl max-w-xs"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-black shrink-0">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <p className="text-xs text-white/90 leading-tight">{Item.label}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}