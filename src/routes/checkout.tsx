import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export const Route = createFileRoute("/checkout")({ component: Checkout });

const WHATSAPP_NUMBER = "5519989067693";
const INTEREST_RATE = 0.0299; // 2,99% a.m. acima de 3x

function calcInstallment(total: number, n: number) {
  if (n <= 3) return { perInstallment: total / n, totalWithInterest: total, hasInterest: false };
  // Price formula (juros compostos)
  const i = INTEREST_RATE;
  const per = (total * i) / (1 - Math.pow(1 + i, -n));
  return { perInstallment: per, totalWithInterest: per * n, hasInterest: true };
}

const brl = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

function Checkout() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", cep: "", street: "", number: "", city: "", state: "", payment: "pix", installments: 1,
  });

  useEffect(() => { if (items.length === 0) nav({ to: "/carrinho" }); }, [items, nav]);

  const [cepLoading, setCepLoading] = useState(false);
  const lookupCep = async (raw: string) => {
    const cep = raw.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) { toast.error("CEP não encontrado"); return; }
      setForm((f) => ({
        ...f,
        street: data.logradouro || f.street,
        city: data.localidade || f.city,
        state: (data.uf || f.state).toUpperCase(),
      }));
      toast.success("Endereço preenchido!");
    } catch {
      toast.error("Falha ao buscar CEP");
    } finally { setCepLoading(false); }
  };

  if (!user) {
    return (
      <main className="mx-auto max-w-md px-4 py-20 min-h-screen text-center">
        <h1 className="text-3xl font-black">Faça login para continuar</h1>
        <p className="text-muted-foreground mt-2">Você precisa estar logado para finalizar a compra.</p>
        <Link to="/perfil" className="inline-block mt-6 rounded-full bg-accent text-accent-foreground font-bold px-6 py-3">Entrar</Link>
      </main>
    );
  }

  const showInstallments = form.payment === "cartao" || form.payment === "boleto";
  const maxInstallments = form.payment === "cartao" ? 12 : 6;
  const installmentInfo = showInstallments
    ? calcInstallment(total, form.installments)
    : { perInstallment: total, totalWithInterest: total, hasInterest: false };
  const finalTotal = showInstallments ? installmentInfo.totalWithInterest : total;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: order, error } = await supabase.from("orders").insert({
        user_id: user.id,
        status: "pending",
        total: finalTotal,
        payment_method: form.payment,
        shipping_address: {
          name: form.name, phone: form.phone, cep: form.cep,
          street: form.street, number: form.number, city: form.city, state: form.state,
          installments: showInstallments ? form.installments : 1,
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

      // Monta mensagem do WhatsApp
      const orderNumber = (order as any).order_number ?? "—";
      const paymentLabel =
        form.payment === "pix" ? "PIX" : form.payment === "cartao" ? "Cartão de Crédito" : "Boleto Bancário";
      const parcelaTxt = showInstallments && form.installments > 1
        ? `Parcelado em ${form.installments}x de ${brl(installmentInfo.perInstallment)}${installmentInfo.hasInterest ? " (com juros)" : " (sem juros)"}`
        : "À vista";

      const itemsTxt = items
        .map((i) => `• ${i.quantity}x ${i.name} — Cor: ${i.color} | Tam: ${i.size} — ${brl(i.price * i.quantity)}`)
        .join("\n");

      const message =
`*Pedido nº${orderNumber} Confirmado* ✅

*Cliente:* ${form.name}
*Telefone:* ${form.phone}
*E-mail:* ${user.email ?? "—"}

*Produtos:*
${itemsTxt}

*Endereço de Entrega:*
${form.street}, ${form.number}
${form.city} - ${form.state}
CEP: ${form.cep}

*Forma de Pagamento:* ${paymentLabel}
*Condição:* ${parcelaTxt}

*Subtotal:* ${brl(total)}
${showInstallments && installmentInfo.hasInterest ? `*Juros:* ${brl(finalTotal - total)}\n` : ""}*Total:* ${brl(finalTotal)}

Aguardo a confirmação do pedido. Obrigado!`;

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      clear();
      toast.success("Pedido realizado! Redirecionando para o WhatsApp…");
      window.open(url, "_blank");
      setTimeout(() => nav({ to: "/pedidos" }), 800);
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
            <input required placeholder="CEP" value={form.cep}
              onChange={(e) => { const v = e.target.value; setForm({ ...form, cep: v }); if (v.replace(/\D/g, "").length === 8) lookupCep(v); }}
              onBlur={(e) => lookupCep(e.target.value)}
              className={inp} />
            <input required placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inp} />
            <input required placeholder="Rua" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className={`${inp} sm:col-span-2`} />
            <input required placeholder="Número" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className={inp} />
            <input required placeholder="Estado (UF)" maxLength={2} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} className={inp} />
          </div>
          {cepLoading && <p className="text-xs text-muted-foreground">Buscando endereço pelo CEP…</p>}

          <h2 className="font-black text-lg pt-4">Pagamento</h2>
          <div className="grid sm:grid-cols-3 gap-2">
            {(["pix", "cartao", "boleto"] as const).map((m) => (
              <button type="button" key={m} onClick={() => setForm({ ...form, payment: m, installments: 1 })}
                className={`rounded-lg py-3 font-bold capitalize border-2 transition ${form.payment === m ? "border-accent bg-accent text-accent-foreground" : "border-border hover:border-accent"}`}>
                {m === "cartao" ? "Cartão" : m}
              </button>
            ))}
          </div>

          {showInstallments && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2">
              <label className="block font-bold mb-2 text-sm">Parcelas</label>
              <select
                value={form.installments}
                onChange={(e) => setForm({ ...form, installments: Number(e.target.value) })}
                className={inp}
              >
                {Array.from({ length: maxInstallments }, (_, i) => i + 1).map((n) => {
                  const info = calcInstallment(total, n);
                  return (
                    <option key={n} value={n}>
                      {n}x de {brl(info.perInstallment)} {n <= 3 ? "(sem juros)" : `(com juros — total ${brl(info.totalWithInterest)})`}
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-muted-foreground mt-2">
                Parcelamento em até 3x sem juros. Acima disso, taxa de {(INTEREST_RATE * 100).toFixed(2).replace(".", ",")}% a.m.
              </p>
            </motion.div>
          )}
        </motion.div>

        <div className="bg-card border border-border rounded-2xl p-6 h-fit sticky top-24">
          <h2 className="font-black text-lg">Resumo</h2>
          <div className="text-sm mt-3 space-y-1 max-h-48 overflow-y-auto">
            {items.map((i, idx) => (
              <div key={idx} className="flex justify-between"><span>{i.quantity}× {i.name} ({i.size})</span><span>R$ {(i.price * i.quantity).toFixed(2)}</span></div>
            ))}
          </div>
          <div className="border-t border-border my-4" />
          <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>{brl(total)}</span></div>
          {showInstallments && installmentInfo.hasInterest && (
            <div className="flex justify-between text-sm text-muted-foreground mt-1"><span>Juros</span><span>{brl(finalTotal - total)}</span></div>
          )}
          <div className="flex justify-between font-black text-xl mt-2"><span>Total</span><span className="text-accent">{brl(finalTotal)}</span></div>
          {showInstallments && form.installments > 1 && (
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {form.installments}x de {brl(installmentInfo.perInstallment)}
            </div>
          )}
          <button disabled={loading} className="w-full mt-5 rounded-full bg-accent text-accent-foreground font-bold py-3 hover:scale-105 transition disabled:opacity-50">
            {loading ? "Processando…" : "Confirmar pedido"}
          </button>
          <p className="text-xs text-muted-foreground mt-3 text-center">Você será redirecionado para o WhatsApp da loja para confirmar.</p>
        </div>
      </form>
    </main>
  );
}

const inp = "w-full rounded-lg bg-secondary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-sm";