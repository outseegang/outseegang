import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a OUTSEE — Streetwear de marca própria" },
      { name: "description", content: "A história da Outsee: streetwear de marca própria feito para quem não segue tendências." },
      { property: "og:title", content: "Sobre a OUTSEE" },
      { property: "og:description", content: "Marca de streetwear independente. Nascida em São Paulo." },
    ],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10" style={{ background: "var(--gradient-premium)" }}>
        <div className="mx-auto max-w-6xl px-4 py-24 md:py-40">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs uppercase tracking-[0.35em] text-white/40 mb-8"
          >
            — Manifesto OUTSEE
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display text-[12vw] md:text-[8rem] uppercase leading-[0.88]"
          >
            Não somos<br />
            <span className="text-shimmer">tendência.</span><br />
            Somos direção.
          </motion.h1>
        </div>
      </section>

      {/* STORY */}
      <section className="mx-auto max-w-5xl px-4 py-24 md:py-32">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">— 01</p>
            <h2 className="mt-3 font-display text-4xl uppercase">Origem</h2>
          </div>
          <div className="md:col-span-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              A OUTSEE nasceu em São Paulo, em 2026, com uma única ideia fixa: criar peças para quem
              não se encaixa — e não quer se encaixar.
            </p>
            <p>
              Cada coleção é desenhada do zero. Sem inspiração genérica, sem peças coringa, sem fast
              fashion. O que entra na rua sai do estúdio com a assinatura da marca: tecidos densos,
              caimentos pesados e atitude que se sente antes de se ver.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[var(--gradient-drop)]">
        <div className="mx-auto max-w-5xl px-4 py-24 md:py-32 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">— 02</p>
            <h2 className="mt-3 font-display text-4xl uppercase">Filosofia</h2>
          </div>
          <div className="md:col-span-8 space-y-6 text-white/80 text-lg leading-relaxed">
            <p>
              Acreditamos que roupa não é decoração. É declaração. O que você veste comunica antes da
              primeira palavra — e nós levamos isso a sério.
            </p>
            <p>
              Lançamos em drops limitados. O que esgotou, esgotou. Sem restock, sem versão "de novo".
              Cada peça tem número. Cada drop tem fim.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-24 md:py-32 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">— 03</p>
          <h2 className="mt-3 font-display text-4xl uppercase">Comunidade</h2>
        </div>
        <div className="md:col-span-8 space-y-6 text-white/80 text-lg leading-relaxed">
          <p>
            OUTSEE não é cliente. É membro. Os primeiros a saber de cada drop são os que estão na lista —
            e os que estão na rua.
          </p>
          <p className="text-white">
            Bem-vindo. Você não comprou uma peça. Você entrou na marca.
          </p>
        </div>
      </section>

      {/* CLOSING */}
      <section className="relative overflow-hidden border-t border-white/10">
        <div className="relative mx-auto max-w-4xl px-4 py-32 text-center">
          <img src={logo} alt="" className="mx-auto h-20 invert opacity-30 mb-10" />
          <h2 className="font-display text-5xl md:text-7xl uppercase leading-none">
            Nascidos para sair<br />do comum.
          </h2>
          <Link
            to="/catalogo"
            className="mt-12 inline-flex items-center gap-3 rounded-full bg-white text-black px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
          >
            Ver a coleção <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}