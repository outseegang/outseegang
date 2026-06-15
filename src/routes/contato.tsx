import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mail, MessageCircle, MapPin, Send } from "lucide-react";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — OUTSEE | Fale com a marca" },
      { name: "description", content: "Fale com a Outsee: atendimento, trocas, parcerias e imprensa." },
      { property: "og:title", content: "Contato OUTSEE" },
      { property: "og:description", content: "Atendimento, trocas e parcerias." },
    ],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email.includes("@") || message.length < 5) {
      toast.error("Preencha todos os campos");
      return;
    }
    toast.success("Mensagem enviada. Responderemos em até 24h úteis.");
    setName(""); setEmail(""); setMessage("");
  };

  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10" style={{ background: "var(--gradient-premium)" }}>
        <div className="mx-auto max-w-6xl px-4 py-24 md:py-32">
          <p className="text-xs uppercase tracking-[0.35em] text-white/40 mb-6">— Suporte OUTSEE</p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-7xl md:text-[10rem] uppercase leading-[0.88]"
          >
            Fale com<br />a marca.
          </motion.h1>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 grid md:grid-cols-2 gap-12">
        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          <h2 className="font-display text-3xl uppercase mb-6">Envie uma mensagem</h2>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-white/50">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/40"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-white/50">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/40"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-white/50">Mensagem</label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/40 resize-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-white/90"
          >
            <Send className="h-4 w-4" /> Enviar
          </button>
        </form>

        {/* Info */}
        <div className="space-y-6">
          <h2 className="font-display text-3xl uppercase mb-6">Outros canais</h2>
          {[
            { Icon: Mail, label: "Atendimento", value: "atendimento@outsee.com.br" },
            { Icon: MessageCircle, label: "WhatsApp", value: "+55 (11) 99999-0000" },
            { Icon: MapPin, label: "Estúdio", value: "São Paulo · Brasil" },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4 rounded-2xl bg-white/5 border border-white/10 p-5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-black shrink-0">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-white/50">{label}</p>
                <p className="text-base font-semibold mt-1">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Policies */}
      <section className="border-t border-white/10 bg-[var(--gradient-drop)]">
        <div className="mx-auto max-w-6xl px-4 py-20 grid md:grid-cols-2 gap-12">
          <div id="trocas">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3">— Política</p>
            <h2 className="font-display text-4xl uppercase mb-6">Troca facilitada</h2>
            <div className="space-y-3 text-sm text-white/70 leading-relaxed">
              <p>Trocas em até 30 dias após a entrega.</p>
              <p>A peça deve estar sem uso, com etiquetas originais.</p>
              <p>O frete da primeira troca por outro tamanho é por nossa conta.</p>
              <p>Edições limitadas e drops não têm restock — pode haver substituição por crédito.</p>
            </div>
          </div>
          <div id="privacidade">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3">— Política</p>
            <h2 className="font-display text-4xl uppercase mb-6">Privacidade</h2>
            <div className="space-y-3 text-sm text-white/70 leading-relaxed">
              <p>Coletamos apenas os dados necessários para entrega e atendimento.</p>
              <p>Nunca vendemos ou compartilhamos seus dados com terceiros.</p>
              <p>Você pode solicitar exclusão da sua conta a qualquer momento.</p>
              <p>Pagamentos processados por gateways certificados (PCI-DSS).</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}