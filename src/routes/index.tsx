import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type Product } from "@/components/ProductCard";
import logo from "@/assets/logo.png";
import { ArrowRight } from "lucide-react";
import { useProductsRealtime } from "@/hooks/useProductsRealtime";

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
    <main className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border" style={{ background: "var(--gradient-hero)" }}>
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-32 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="text-accent font-semibold tracking-widest uppercase text-sm">Coleção 2026</p>
              <h1 className="mt-4 text-5xl md:text-7xl font-black leading-none">
                Streetwear<br />sem padrão.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-md">
                Moletons e tênis Outsee — feitos para quem enxerga além do óbvio.
              </p>
              <div className="mt-8 flex gap-3">
                <Link to="/catalogo" className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 font-bold hover:scale-105 transition-transform">
                  Ver catálogo <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/perfil" className="rounded-full border border-border px-6 py-3 font-bold hover:bg-secondary transition-colors">
                  Criar conta
                </Link>
              </div>
            </motion.div>
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="flex justify-center"
          >
            <img src={logo} alt="Outsee" className="w-full max-w-md invert drop-shadow-2xl" />
          </motion.div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black">Destaques</h2>
            <p className="text-muted-foreground mt-1">Peças selecionadas da coleção atual.</p>
          </div>
          <Link to="/catalogo" className="text-sm text-accent hover:underline">Ver tudo →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 Outsee. Todos os direitos reservados.
      </footer>
    </main>
  );
}
