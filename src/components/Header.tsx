import { Link, useNavigate } from "@tanstack/react-router";
import { Search, User as UserIcon, Shield, LogOut, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import logo from "@/assets/logo.png";

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    nav({ to: "/catalogo", search: { q: q.trim() || undefined } });
  };

  const navLinkClass = "text-xs font-semibold uppercase tracking-[0.18em] text-foreground/70 hover:text-foreground transition-colors";

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-background/60 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]"
          : "border-b border-transparent bg-background/40 backdrop-blur-xl"
      }`}
    >
      <div className={`mx-auto grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 transition-all duration-300 max-w-7xl ${scrolled ? "py-2.5" : "py-4"}`}>
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Outsee" className={`w-auto invert transition-all duration-300 ${scrolled ? "h-8" : "h-10"}`} />
        </Link>
        <nav className="hidden lg:flex items-center justify-center gap-8 min-w-0">
          <Link to="/" className={navLinkClass} activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }}>Home</Link>
          <Link to="/colecao" className={navLinkClass} activeProps={{ className: "text-foreground" }}>Coleção</Link>
          <Link to="/drops" className={navLinkClass} activeProps={{ className: "text-foreground" }}>Drops</Link>
          <Link to="/sobre" className={navLinkClass} activeProps={{ className: "text-foreground" }}>Sobre a Outsee</Link>
          <Link to="/contato" className={navLinkClass} activeProps={{ className: "text-foreground" }}>Contato</Link>
          {isAdmin && <Link to="/admin" className={`${navLinkClass} flex items-center gap-1`}><Shield className="h-3.5 w-3.5" />Admin</Link>}
        </nav>
        <form onSubmit={onSearch} className="hidden md:block w-56 ml-auto lg:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar…"
              className="w-full rounded-full bg-white/5 border border-white/10 px-10 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-white/30"
            />
          </div>
        </form>
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => {
              const term = window.prompt("Buscar produtos:");
              if (term !== null) nav({ to: "/catalogo", search: { q: term.trim() || undefined } });
            }}
            className="hidden lg:inline-flex rounded-full bg-white/5 hover:bg-white/10 border border-white/10 p-2 transition-colors"
            title="Buscar"
          >
            <Search className="h-4 w-4" />
          </button>
          <Link to="/carrinho" className="relative rounded-full bg-white/5 hover:bg-white/10 border border-white/10 p-2 transition-colors" title="Carrinho">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-background">{count}</span>
            )}
          </Link>
          {user ? (
            <>
              <Link to="/perfil" className="rounded-full bg-white/5 hover:bg-white/10 border border-white/10 p-2 transition-colors" title="Perfil">
                <UserIcon className="h-5 w-5" />
              </Link>
              <button onClick={signOut} className="rounded-full bg-white/5 hover:bg-destructive border border-white/10 p-2 transition-colors" title="Sair">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link to="/perfil" className="rounded-full bg-white text-black px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}