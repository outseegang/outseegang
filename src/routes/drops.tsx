import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock, Mail, ArrowUpRight, Crown } from "lucide-react";
import { Footer } from "@/components/Footer";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/drops")({
  head: () => ({
    meta: [
      { title: "Drops — OUTSEE | Próximo lançamento e lista VIP" },
      { name: "description", content: "Os próximos drops da Outsee. Entre na lista VIP e receba acesso antes de todos." },
      { property: "og:title", content: "Drops OUTSEE — Próximo lançamento" },
      { property: "og:description", content: "Acesso antecipado. Lista VIP. Produtos exclusivos." },
    ],
  }),
  component: DropsPage,
});

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

function DropsPage() {
  const target = new Date();
  target.setDate(target.getDate() + 14);
  const c = useCountdown(target);
  const [email, setEmail] = useState("");

  const join = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Email inválido");
      return;
    }
    toast.success("Bem-vindo à lista VIP. Você terá acesso 24h antes.");
    setEmail("");
  };

  const Cell = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20 md:w-28 md:h-28 grid place-items-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <span className="font-display text-4xl md:text-6xl tabular-nums">{String(value).padStart(2, "0")}</span>
      </div>
      <span className="mt-3 text-[10px] md:text-xs uppercase tracking-[0.25em] text-white/50">{label}</span>
    </div>
  );

  return (
    <main className="min-h-screen -mt-[72px] pt-[72px]" style={{ background: "var(--gradient-drop)" }}>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />
        <img
          aria-hidden
          src={logo}
          alt=""
          className="absolute -right-32 -top-20 w-[600px] opacity-[0.04] invert pointer-events-none"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-white/50 mb-8"
          >
            <span className="h-px w-10 bg-white/30" />
            DROP 02 · LIMITED EDITION
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display text-[14vw] md:text-[10rem] uppercase leading-[0.85]"
          >
            <span className="block text-shimmer">PRÓXIMO</span>
            <span className="block">DROP.</span>
          </motion.h1>
          <p className="mt-8 max-w-xl text-lg text-white/70">
            Edição limitada. Quem está na lista VIP entra 24 horas antes — sem fila, sem sorteio.
          </p>

          {/* COUNTDOWN */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex flex-wrap gap-3 md:gap-5"
          >
            <Cell value={c.days} label="Dias" />
            <Cell value={c.hours} label="Horas" />
            <Cell value={c.minutes} label="Minutos" />
            <Cell value={c.seconds} label="Segundos" />
          </motion.div>
        </div>
      </section>

      {/* VIP FORM */}
      <section className="relative border-y border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <Crown className="h-8 w-8 mx-auto mb-4 text-white/70" />
          <h2 className="font-display text-4xl md:text-6xl uppercase">Lista VIP</h2>
          <p className="mt-4 text-white/60 max-w-md mx-auto">
            Receba acesso antecipado, peças exclusivas para membros e descontos privados.
          </p>
          <form onSubmit={join} className="mt-10 relative max-w-md mx-auto">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-full bg-white/5 border border-white/15 pl-11 pr-32 py-4 text-sm focus:outline-none focus:border-white/40"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-white text-black px-5 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white/90"
            >
              Entrar
            </button>
          </form>
          <p className="mt-4 text-[11px] text-white/40 uppercase tracking-wider">
            Sem spam. Apenas drops, sempre antes.
          </p>
        </div>
      </section>

      {/* PRÓXIMAS PEÇAS */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3">— Em breve</p>
          <h2 className="font-display text-5xl md:text-7xl uppercase">Produtos futuros</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { name: "Moletom Outsee Phantom", code: "DRP02-01" },
            { name: "Calça Cargo Limited", code: "DRP02-02" },
            { name: "Tênis Outsee Runner V2", code: "DRP02-03" },
            { name: "Camiseta Heritage", code: "DRP02-04" },
            { name: "Jaqueta Sherpa Drop", code: "DRP02-05" },
            { name: "Boné Outsee 6 Panel", code: "DRP02-06" },
          ].map((item, i) => (
            <motion.div
              key={item.code}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="group relative aspect-[3/4] bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="absolute inset-0 grid place-items-center">
                <Lock className="h-10 w-10 text-white/20 group-hover:text-white/40 transition-colors" />
              </div>
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em]">
                <span className="text-white/40">{item.code}</span>
                <span className="rounded-full bg-white/10 px-2 py-1">LOCKED</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/80 to-transparent">
                <p className="font-display text-xl uppercase">{item.name}</p>
                <p className="text-xs text-white/40 mt-1">Disponível apenas no drop</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-3 rounded-full border border-white/20 px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-colors"
          >
            Ver coleção atual <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}