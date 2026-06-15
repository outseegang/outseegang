import { Link } from "@tanstack/react-router";
import { Mail, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const IconInstagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const IconTwitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const IconTikTok = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.6a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.03z" />
  </svg>
);

export function Footer() {
  const [email, setEmail] = useState("");

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Insira um email válido");
      return;
    }
    toast.success("Você entrou na lista. Bem-vindo à Outsee.");
    setEmail("");
  };

  return (
    <footer className="relative border-t border-white/10 bg-[var(--gradient-drop)]">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <img src={logo} alt="Outsee" className="h-10 w-auto invert mb-4" />
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Streetwear de marca própria. Feito para quem não segue tendências — cria as próprias.
            </p>
            <div className="mt-6 flex gap-2">
              {[
                { Icon: IconInstagram, href: "https://instagram.com", label: "Instagram" },
                { Icon: IconTikTok, href: "https://tiktok.com", label: "TikTok" },
                { Icon: IconTwitter, href: "https://twitter.com", label: "X" },
              ].map(({ Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60 mb-4">Loja</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/catalogo" className="hover:text-white transition-colors">Coleção</Link></li>
              <li><Link to="/drops" className="hover:text-white transition-colors">Drops</Link></li>
              <li><Link to="/carrinho" className="hover:text-white transition-colors">Carrinho</Link></li>
              <li><Link to="/pedidos" className="hover:text-white transition-colors">Meus pedidos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60 mb-4">Suporte</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/sobre" className="hover:text-white transition-colors">Sobre a Outsee</Link></li>
              <li><Link to="/contato" className="hover:text-white transition-colors">Contato</Link></li>
              <li><Link to="/contato" hash="trocas" className="hover:text-white transition-colors">Política de troca</Link></li>
              <li><Link to="/contato" hash="privacidade" className="hover:text-white transition-colors">Política de privacidade</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60 mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Entre na lista. Drops antes de todos.
            </p>
            <form onSubmit={subscribe} className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-full bg-white/5 border border-white/10 px-10 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-white/40"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white text-black hover:scale-105 transition-transform"
                aria-label="Inscrever"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} OUTSEE. Todos os direitos reservados.</p>
          <p className="font-display tracking-[0.3em] text-base text-foreground/30">NASCIDOS PARA SAIR DO COMUM.</p>
        </div>
      </div>
    </footer>
  );
}