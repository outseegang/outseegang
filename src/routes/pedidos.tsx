import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getProductImage } from "@/lib/product-images";

export const Route = createFileRoute("/pedidos")({ component: Orders });

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-300" },
  paid: { label: "Pago", color: "bg-blue-500/20 text-blue-300" },
  shipped: { label: "Enviado", color: "bg-purple-500/20 text-purple-300" },
  delivered: { label: "Entregue", color: "bg-green-500/20 text-green-300" },
  cancelled: { label: "Cancelado", color: "bg-red-500/20 text-red-300" },
};

function Orders() {
  const { user, loading: authLoading } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders").select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  if (authLoading) return <p className="text-center py-32 text-muted-foreground">Carregando…</p>;
  if (!user) {
    return (
      <main className="mx-auto max-w-md px-4 py-20 min-h-screen text-center">
        <h1 className="text-3xl font-black">Entre para ver seus pedidos</h1>
        <Link to="/perfil" className="inline-block mt-6 rounded-full bg-accent text-accent-foreground font-bold px-6 py-3">Entrar</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 min-h-screen">
      <h1 className="text-4xl font-black">Meus pedidos</h1>
      <p className="text-muted-foreground mt-1">Acompanhe o status de cada compra.</p>

      {isLoading ? (
        <p className="text-center py-20 text-muted-foreground">Carregando…</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Você ainda não fez pedidos.</p>
          <Link to="/catalogo" className="inline-block mt-4 rounded-full bg-accent text-accent-foreground font-bold px-6 py-3">Comprar</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o, idx) => {
            const st = STATUS_LABEL[o.status] ?? { label: o.status, color: "bg-secondary" };
            return (
              <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="bg-card border border-border rounded-2xl p-5">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Pedido #{o.id.slice(0, 8)}</p>
                    <p className="text-sm">{new Date(o.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${st.color}`}>{st.label}</span>
                </div>
                <div className="mt-4 space-y-2">
                  {o.order_items?.map((it: any) => (
                    <div key={it.id} className="flex gap-3 items-center text-sm">
                      <img src={getProductImage(it.image_url)} className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold">{it.name}</p>
                        <p className="text-xs text-muted-foreground">{it.color} • Tam {it.size} • {it.quantity}×</p>
                      </div>
                      <p className="font-bold">R$ {(it.unit_price * it.quantity).toFixed(2).replace(".", ",")}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-sm text-muted-foreground capitalize">Pagamento: {o.payment_method}</span>
                  <span className="font-black text-xl text-accent">R$ {Number(o.total).toFixed(2).replace(".", ",")}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </main>
  );
}