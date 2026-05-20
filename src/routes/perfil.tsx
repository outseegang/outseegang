import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { redeemAdminCode } from "@/lib/admin.functions";
import { Shield, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/perfil")({ component: Perfil });

function Perfil() {
  const { user, isAdmin, setIsAdmin, signOut } = useAuth();
  if (!user) return <AuthForm />;
  return <ProfileView isAdmin={isAdmin} setIsAdmin={setIsAdmin} signOut={signOut} email={user.email!} />;
}

function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Conta criada! Você já está logado.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erro");
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-[var(--shadow-glow)]">
        <h1 className="text-3xl font-black text-center">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="text-center text-muted-foreground text-sm mt-1">Outsee — acesso à sua área pessoal</p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <input required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              className="w-full rounded-lg bg-secondary px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent" />
          )}
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="w-full rounded-lg bg-secondary px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent" />
          <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha (mín. 6)"
            className="w-full rounded-lg bg-secondary px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent" />
          <button disabled={loading} className="w-full rounded-lg bg-accent text-accent-foreground font-bold py-3 hover:opacity-90 transition disabled:opacity-50">
            {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 w-full text-sm text-muted-foreground hover:text-accent transition">
          {mode === "login" ? "Não tenho conta — criar uma" : "Já tenho conta — entrar"}
        </button>
      </motion.div>
    </main>
  );
}

function ProfileView({ isAdmin, setIsAdmin, signOut, email }: {
  isAdmin: boolean; setIsAdmin: (v: boolean) => void; signOut: () => Promise<void>; email: string;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const redeem = useServerFn(redeemAdminCode);

  const onRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await redeem({ data: { code } });
      setIsAdmin(true);
      toast.success("Modo Admin ativado!");
      setCode("");
    } catch (err: any) {
      toast.error(err.message ?? "Código inválido");
    } finally { setLoading(false); }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl p-8 shadow-[var(--shadow-glow)]">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-accent text-accent-foreground p-4">
            <UserIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Meu perfil</h1>
            <p className="text-muted-foreground text-sm">{email}</p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-1 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-bold">
                <Shield className="h-3 w-3" /> ADMIN
              </span>
            )}
          </div>
        </div>

        {!isAdmin && (
          <form onSubmit={onRedeem} className="mt-8 space-y-3">
            <label className="text-sm font-semibold">Ativar modo Admin</label>
            <div className="flex gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value)}
                placeholder="Código de admin" type="password"
                className="flex-1 rounded-lg bg-secondary px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent" />
              <button disabled={loading} className="rounded-lg bg-accent text-accent-foreground font-bold px-6 hover:opacity-90 transition disabled:opacity-50">
                Ativar
              </button>
            </div>
          </form>
        )}

        {isAdmin && (
          <button onClick={() => nav({ to: "/admin" })}
            className="mt-8 w-full rounded-lg bg-accent text-accent-foreground font-bold py-3 hover:opacity-90 transition">
            Abrir painel Admin
          </button>
        )}

        <button onClick={signOut} className="mt-3 w-full rounded-lg border border-border font-bold py-3 hover:bg-secondary transition">
          Sair
        </button>
      </motion.div>
    </main>
  );
}