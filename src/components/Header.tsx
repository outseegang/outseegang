import { Link, useNavigate } from "@tanstack/react-router";
import { Search, User as UserIcon, Shield, LogOut } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    nav({ to: "/catalogo", search: { q: q.trim() || undefined } });
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Outsee" className="h-10 w-auto invert" />
        </Link>
        <nav className="hidden md:flex items-center gap-6 ml-4 text-sm">
          <Link to="/" className="hover:text-accent transition-colors" activeProps={{ className: "text-accent" }}>Início</Link>
          <Link to="/catalogo" className="hover:text-accent transition-colors" activeProps={{ className: "text-accent" }}>Catálogo</Link>
          {isAdmin && <Link to="/admin" className="hover:text-accent transition-colors flex items-center gap-1"><Shield className="h-4 w-4" />Admin</Link>}
        </nav>
        <form onSubmit={onSearch} className="flex-1 max-w-md ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar moletons, tênis…"
              className="w-full rounded-full bg-secondary px-10 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </form>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/perfil" className="rounded-full bg-secondary p-2 hover:bg-muted transition-colors" title="Perfil">
                <UserIcon className="h-5 w-5" />
              </Link>
              <button onClick={signOut} className="rounded-full bg-secondary p-2 hover:bg-destructive transition-colors" title="Sair">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link to="/perfil" className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}