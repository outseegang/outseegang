import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type Product } from "@/components/ProductCard";
import logo from "@/assets/logo.png";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useProductsRealtime } from "@/hooks/useProductsRealtime";
import { AuthorityBar } from "@/components/AuthorityBar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  useProductsRealtime();
  const { data: products = [] } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").limit(8);
      if (error) throw error;
      return data as Product[];
    },
  });

  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section
        className="relative overflow-hidden -mt-[72px] pt-[72px]"
        style={{ background: "var(--gradient-premium)" }}
      >
        {/* Grain / noise overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />
        {/* Spotlight */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 md:pt-32 md:pb-40 min-h-[calc(100vh-72px)] flex flex-col justify-center">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 text-[10px] sm:text-xs uppercase tracking-[0.35em] text-white/50 mb-8"
          >
            <span className="h-px w-10 bg-white/30" />
            COLEÇÃO 2026 — CHAPTER 01
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[15vw] sm:text-[12vw] md:text-[9vw] lg:text-[8rem] leading-[0.88] uppercase max-w-5xl"
          >
            <span className="block text-shimmer">Nascidos para</span>
            <span className="block text-white">sair do comum.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="mt-8 max-w-xl text-base md:text-lg text-white/70 leading-relaxed"
          >
            A OUTSEE não segue tendências. <span className="text-white">Nós criamos nossa própria direção.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/catalogo"
              className="group inline-flex items-center gap-3 rounded-full bg-white text-black pl-6 pr-2 py-2 font-bold uppercase tracking-wider text-sm hover:bg-white/90 transition-all"
            >
              Entrar na coleção
              <span className="grid h-9 w-9 place-items-center rounded-full bg-black text-white group-hover:rotate-45 transition-transform">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
            <Link
              to="/drops"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-colors"
            >
              Ver próximo drop
            </Link>
          </motion.div>

          {/* Side numerics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="absolute bottom-10 right-4 hidden md:flex items-center gap-6 text-xs uppercase tracking-[0.25em] text-white/40"
          >
            <span>EST. 2026</span>
            <span className="h-px w-10 bg-white/20" />
            <span>SÃO PAULO · BR</span>
          </motion.div>
        </div>
      </section>

      {/* AUTHORITY BAR */}
      <AuthorityBar />

      {/* MARQUEE */}
      <section className="border-b border-white/10 bg-black overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee py-6">
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ["OUTSEE", "NASCIDOS PARA SAIR DO COMUM", "DROP 01", "SÃO PAULO", "STREETWEAR", "EST. 2026"].map((t, i) => (
              <span
                key={`${k}-${i}`}
                className="font-display text-5xl md:text-6xl uppercase mx-8 text-white/10 hover:text-white transition-colors"
              >
                {t} <span className="text-white/40">★</span>
              </span>
            )),
          )}
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3">— Selecionados</p>
            <h2 className="font-display text-5xl md:text-7xl uppercase leading-none">
              A coleção<br />em destaque.
            </h2>
          </div>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-b border-white/40 hover:border-white pb-1"
          >
            Ver tudo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      </section>

      {/* MAIS QUE ROUPA */}
      <section className="relative overflow-hidden border-y border-white/10 bg-[var(--gradient-drop)]">
        <div className="mx-auto max-w-7xl px-4 py-24 md:py-32 grid md:grid-cols-12 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="md:col-span-5"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4">— Manifesto</p>
            <h2 className="font-display text-6xl md:text-8xl uppercase leading-[0.88]">
              Mais que<br />roupa.
            </h2>
            <p className="mt-8 text-white/70 text-lg leading-relaxed max-w-md">
              Cada peça carrega uma postura. Liberdade, autenticidade e a coragem de não pertencer a lugar nenhum — exceto à própria rua.
            </p>
            <div className="mt-10 space-y-3">
              {[
                "Tecidos premium pensados para durar.",
                "Cortes que não pedem licença.",
                "Edições limitadas. Nunca repetidas.",
              ].map((line) => (
                <p key={line} className="flex items-start gap-3 text-sm text-white/80">
                  <span className="mt-1.5 h-1 w-6 bg-white/60 shrink-0" />
                  {line}
                </p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="md:col-span-7 grid grid-cols-6 gap-3 md:gap-4"
          >
            <div className="col-span-4 row-span-2 aspect-[4/5] bg-zinc-800 rounded-2xl overflow-hidden relative group">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=80"
                alt="Outsee lifestyle 1"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
              <p className="absolute bottom-4 left-4 font-display text-2xl uppercase">"Não é um look. É uma postura."</p>
            </div>
            <div className="col-span-2 aspect-square bg-zinc-800 rounded-2xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80"
                alt="Outsee lifestyle 2"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="col-span-2 aspect-square bg-zinc-800 rounded-2xl overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80"
                alt="Outsee lifestyle 3"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* OUTSEE NA RUA */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3">— Comunidade</p>
            <h2 className="font-display text-5xl md:text-7xl uppercase leading-none">Outsee na rua</h2>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider border-b border-white/40 hover:border-white pb-1"
          >
            @outsee <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
          {[
            "photo-1539109136881-3be0616acf4b",
            "photo-1552374196-1ab2a1c593e8",
            "photo-1492447166138-50c3889fccb1",
            "photo-1488161628813-04466f872be2",
            "photo-1503342217505-b0a15ec3261c",
            "photo-1519408469771-2586093c3f14",
          ].map((id, i) => (
            <a
              key={id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden bg-zinc-900 rounded-xl"
            >
              <motion.img
                initial={{ opacity: 0, scale: 1.05 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                src={`https://images.unsplash.com/${id}?w=500&q=80`}
                alt={`Comunidade Outsee ${i + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-300 grid place-items-center">
                <ArrowUpRight className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="relative overflow-hidden border-t border-white/10">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "radial-gradient(circle at 50% 0%, oklch(0.35 0 0) 0%, oklch(0.08 0 0) 70%)" }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-32 text-center">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 0.15, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            src={logo}
            alt=""
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-3xl invert pointer-events-none"
          />
          <p className="relative text-xs uppercase tracking-[0.3em] text-white/40 mb-6">— Próximo capítulo</p>
          <h2 className="relative font-display text-6xl md:text-8xl uppercase leading-none">
            Não espere o<br />próximo drop.<br />
            <span className="text-white/40">Seja ele.</span>
          </h2>
          <div className="relative mt-12 flex flex-wrap justify-center gap-3">
            <Link
              to="/drops"
              className="group inline-flex items-center gap-3 rounded-full bg-white text-black pl-6 pr-2 py-2 font-bold uppercase tracking-wider text-sm hover:bg-white/90 transition-all"
            >
              Entrar na lista VIP
              <span className="grid h-9 w-9 place-items-center rounded-full bg-black text-white group-hover:rotate-45 transition-transform">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
