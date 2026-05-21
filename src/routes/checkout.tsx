import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export const Route = createFileRoute("/checkout")({ component: Checkout });

function Checkout() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", cep: "", street: "", number: "", city: "", state: "", payment: "pix",
  });

  useEffect(() => { if (items.length === 0) nav({ to: "/carrinho" }); }, [items, nav]);

  if (!user) {
    return (
      <main className="mx-auto max-w-md px-4 py-20 min-h-screen text-center">
        <h1 className="text-3xl font-black">Faça login para continuar</h1>
        <p className="text-muted-foreground mt-2">Você precisa estar logado para finalizar a compra.</p>
        <Link to="/perfil" className="inline-block mt-6 rounded-full bg-accent text-accent-foreground font-bold px-6 py-3">Entrar</Link>
      </main>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: order, error } = await supabase.from("orders").insert({
        user_id: user.id,
        status: "pending",
        total,
        payment_method: form.payment,
        shipping_address: {
          name: form.name, phone: form.phone, cep: form.cep,
          street: form.street, number: form.number, city: form.city, state: form.state,
        },
      }).select().single();
      if (error) throw error;

      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id, product_id: i.productId, name: i.name,
          color: i.color, size: i.size, quantity: i.quantity, unit_price: i.price, image_url: i.image_url,
        }))
      );
      if (itemsErr) throw itemsErr;

      clear();
      toast.success("Pedido realizado com sucesso!");
      nav({ to: "/pedidos" });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao finalizar pedido");
    } finally { setLoading(false); }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 min-h-screen">
      <h1 className="text-4xl font-black">Checkout</h1>
      <form onSubmit={submit} className="mt-8 grid lg:grid-cols-[1fr_340px] gap-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-black text-lg">Endereço de entrega</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input required placeholder="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} />
            <input required placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inp} />
            <input required placeholder="CEP" value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} className={inp} />
            <input required placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inp} />
            <input required placeholder="Rua" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className={`${inp} sm:col-span-2`} />
            <input required placeholder="Número" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className={inp} />
            <input required placeholder="Estado (UF)" maxLength={2} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} className={inp} />
          </div>

          <h2 className="font-black text-lg pt-4">Pagamento</h2>
          <div className="grid sm:grid-cols-3 gap-2">
            {(["pix", "cartao", "boleto"] as const).map((m) => (
              <button type="button" key={m} onClick={() => setForm({ ...form, payment: m })}
                className={`rounded-lg py-3 font-bold capitalize border-2 transition ${form.payment === m ? "border-accent bg-accent text-accent-foreground" : "border-border hover:border-accent"}`}>
                {m === "cartao" ? "Cartão" : m}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="bg-card border border-border rounded-2xl p-6 h-fit sticky top-24">
          <h2 className="font-black text-lg">Resumo</h2>
          <div className="text-sm mt-3 space-y-1 max-h-48 overflow-y-auto">
            {items.map((i, idx) => (
              <div key={idx} className="flex justify-between"><span>{i.quantity}× {i.name} ({i.size})</span><span>R$ {(i.price * i.quantity).toFixed(2)}</span></div>
            ))}
          </div>
          <div className="border-t border-border my-4" />
          <div className="flex justify-between font-black text-xl"><span>Total</span><span className="text-accent">R$ {total.toFixed(2).replace(".", ",")}</span></div>
          <button disabled={loading} className="w-full mt-5 rounded-full bg-accent text-accent-foreground font-bold py-3 hover:scale-105 transition disabled:opacity-50">
            {loading ? "Processando…" : "Confirmar pedido"}
          </button>
        </div>
      </form>
    </main>
  );
}

const inp = "w-full rounded-lg bg-secondary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-sm";