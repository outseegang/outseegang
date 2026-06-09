import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X, Upload, Package, Boxes, Save, LifeBuoy, MessageCircle, Palette, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getProductImage, productImages } from "@/lib/product-images";
import type { Product } from "@/components/ProductCard";

export const Route = createFileRoute("/admin")({ component: Admin });

const PRESET_TAGS = ["NOVO", "EM ALTA", "MENOR PREÇO", "MAIS VENDIDO", "PROMOÇÃO", "ÚLTIMAS UNIDADES", "EXCLUSIVO", "LANÇAMENTO"];

function TagBadge({ tag }: { tag: string }) {
  const t = tag.toUpperCase();
  const color =
    t === "NOVO" || t === "LANÇAMENTO" ? "bg-emerald-500 text-white"
    : t === "EM ALTA" || t === "MAIS VENDIDO" ? "bg-orange-500 text-white"
    : t === "MENOR PREÇO" || t === "PROMOÇÃO" ? "bg-rose-500 text-white"
    : t === "ÚLTIMAS UNIDADES" ? "bg-amber-500 text-black"
    : "bg-accent text-accent-foreground";
  return <span className={`text-[10px] font-black tracking-wide rounded-full px-2 py-0.5 ${color}`}>{t}</span>;
}

function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) nav({ to: "/perfil" });
  }, [loading, user, isAdmin, nav]);

  const [tab, setTab] = useState<"products" | "orders" | "support">("products");

  if (!isAdmin) return null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 min-h-screen">
      <div>
        <h1 className="text-4xl font-black">Painel Admin</h1>
        <p className="text-muted-foreground">Gerencie todo o catálogo e pedidos da Outsee.</p>
      </div>

      <div className="mt-6 flex gap-2 border-b border-border">
        {([
          { id: "products", label: "Produtos", icon: Boxes },
          { id: "orders", label: "Pedidos", icon: Package },
          { id: "support", label: "Suporte", icon: LifeBuoy },
        ] as const).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition ${
              tab === t.id ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "products" && <ProductsPanel />}
      {tab === "orders" && <OrdersPanel />}
      {tab === "support" && <SupportPanel />}
    </main>
  );
}

function ProductsPanel() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("category");
      if (error) throw error;
      return data as Product[];
    },
  });

  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ["products"] });

  const del = async (id: string) => {
    if (!confirm("Excluir produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Excluído"); refresh(); }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-end">
        <button onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground font-bold px-5 py-3 hover:scale-105 transition">
          <Plus className="h-4 w-4" /> Novo produto
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr className="text-left">
              <th className="p-3">Imagem</th>
              <th className="p-3">Nome</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Cor</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Tamanhos</th>
              <th className="p-3">Estoque</th>
              <th className="p-3">Etiquetas</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-secondary/50">
                <td className="p-2"><img src={getProductImage(p.image_url)} className="h-12 w-12 rounded object-cover" /></td>
                <td className="p-3 font-semibold">{p.name}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">{p.color}</td>
                <td className="p-3 text-accent font-bold">R$ {Number(p.price).toFixed(2)}</td>
                <td className="p-3 text-xs">{p.sizes.join(", ")}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3"><div className="flex flex-wrap gap-1">{(p as any).tags?.map((t: string) => <TagBadge key={t} tag={t} />)}</div></td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(p)} className="p-2 hover:bg-accent hover:text-accent-foreground rounded transition"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => del(p.id)} className="p-2 hover:bg-destructive rounded transition"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {(editing || creating) && (
          <ProductModal
            product={editing}
            onClose={() => { setEditing(null); setCreating(false); }}
            onSaved={() => { refresh(); setEditing(null); setCreating(false); }}
          />
        )}
      </AnimatePresence>

      <VariantsQuickEditor products={products} onChange={refresh} />
    </div>
  );
}

const ORDER_STATUSES = [
  { value: "pending", label: "Aguardando pagamento" },
  { value: "paid", label: "Pagamento concluído" },
  { value: "shipped", label: "Pedido enviado" },
  { value: "delivered", label: "Entregue" },
  { value: "cancelled", label: "Cancelado" },
] as const;

const STATUS_MESSAGES: Record<string, string> = {
  pending: "Seu pedido está *aguardando pagamento*. Assim que confirmarmos, avisamos por aqui!",
  paid: "Recebemos o seu pagamento! ✅ Seu pedido está sendo preparado para envio.",
  shipped: "Seu pedido foi *enviado*! 📦 Em breve chega aí.",
  delivered: "Seu pedido foi *entregue*! 🎉 Esperamos que aproveite. Obrigado pela compra!",
  cancelled: "Seu pedido foi *cancelado*. Em caso de dúvidas, entre em contato conosco.",
};

function onlyDigits(s: string) { return (s ?? "").replace(/\D/g, ""); }
function normalizePhone(raw: string) {
  const d = onlyDigits(raw);
  if (!d) return "";
  if (d.startsWith("55")) return d;
  return `55${d}`;
}

function buildStatusMessage(order: any, statusValue: string) {
  const addr = order.shipping_address ?? {};
  const label = ORDER_STATUSES.find((s) => s.value === statusValue)?.label ?? statusValue;
  const items = (order.order_items ?? [])
    .map((it: any) => `• ${it.quantity}x ${it.name} — ${it.color} / ${it.size}`)
    .join("\n");
  const deliveryTxt = order.delivery_days
    ? `\n*Prazo de entrega:* ${order.delivery_days} dia(s)`
    : "";
  const extra = STATUS_MESSAGES[statusValue] ?? "";
  return (
`*Outsee — Atualização do Pedido #${order.order_number ?? order.id.slice(0,8)}*

Olá, ${addr.name ?? "cliente"}!

Status atual: *${label}*
${extra}

*Itens:*
${items}

*Total:* R$ ${Number(order.total).toFixed(2).replace(".", ",")}${deliveryTxt}

Qualquer dúvida estamos à disposição. Obrigado por comprar na Outsee! 🖤`
  );
}

function OrdersPanel() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const notifyClient = (order: any, statusValue: string) => {
    const addr = order.shipping_address ?? {};
    const phone = normalizePhone(addr.phone ?? "");
    if (!phone) {
      toast.warning("Cliente sem telefone — não foi possível notificar via WhatsApp.");
      return;
    }
    const msg = buildStatusMessage(order, statusValue);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const updateOrder = async (
    order: any,
    patch: { status?: string; delivery_days?: number | null },
  ) => {
    const { error } = await supabase.from("orders").update(patch as any).eq("id", order.id);
    if (error) toast.error(error.message);
    else {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["my-orders"] });
      if (patch.status && patch.status !== order.status) {
        toast.success("Status atualizado — abrindo WhatsApp do cliente…");
        notifyClient({ ...order, ...patch }, patch.status);
      } else {
        toast.success("Pedido atualizado");
      }
    }
  };

  const deleteOrder = async (order: any) => {
    if (!confirm(`Excluir pedido #${order.order_number ?? order.id.slice(0,8)}? Esta ação não pode ser desfeita.`)) return;
    const { error: e1 } = await supabase.from("order_items").delete().eq("order_id", order.id);
    if (e1) { toast.error(e1.message); return; }
    const { error: e2 } = await supabase.from("orders").delete().eq("id", order.id);
    if (e2) { toast.error(e2.message); return; }
    toast.success("Pedido excluído");
    qc.invalidateQueries({ queryKey: ["admin", "orders"] });
  };

  const [editing, setEditing] = useState<any | null>(null);

  if (isLoading) return <p className="text-center py-20 text-muted-foreground">Carregando…</p>;
  if (orders.length === 0) return <p className="text-center py-20 text-muted-foreground">Nenhum pedido até o momento.</p>;

  return (
    <div className="mt-6 space-y-4">
      {orders.map((o) => {
        const addr = o.shipping_address ?? {};
        const installments = addr.installments ?? 1;
        return (
          <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-5">
            <div className="flex justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Pedido #{o.order_number ?? o.id.slice(0, 8)}</p>
                <p className="font-black text-lg">{addr.name ?? "Cliente"}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("pt-BR")}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-xl text-accent">R$ {Number(o.total).toFixed(2).replace(".", ",")}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {o.payment_method === "cartao" ? "Cartão" : o.payment_method}
                  {installments > 1 ? ` • ${installments}x` : " • à vista"}
                </p>
                <div className="flex gap-1 justify-end mt-2">
                  <button onClick={() => setEditing(o)} title="Editar"
                    className="p-2 rounded hover:bg-accent hover:text-accent-foreground transition"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => deleteOrder(o)} title="Excluir"
                    className="p-2 rounded hover:bg-destructive hover:text-destructive-foreground transition"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs uppercase font-bold text-muted-foreground mb-1">Contato</p>
                <p>{addr.phone ?? "—"}</p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs uppercase font-bold text-muted-foreground mb-1">Endereço</p>
                <p>{addr.street}, {addr.number}</p>
                <p>{addr.city} - {addr.state} • CEP {addr.cep}</p>
              </div>
            </div>

            <div className="mt-4 space-y-1 text-sm">
              {o.order_items?.map((it: any) => (
                <div key={it.id} className="flex justify-between items-center bg-secondary/40 rounded px-3 py-2">
                  <span>{it.quantity}× {it.name} — {it.color} / {it.size}</span>
                  <span className="font-bold">R$ {(it.unit_price * it.quantity).toFixed(2).replace(".", ",")}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-3 pt-4 border-t border-border">
              <label className="block">
                <span className="text-xs font-bold uppercase text-muted-foreground">Status</span>
                <select value={o.status} onChange={(e) => updateOrder(o, { status: e.target.value })} className={inputCls + " mt-1"}>
                  {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase text-muted-foreground">Prazo de entrega (dias)</span>
                <input type="number" min={0} defaultValue={o.delivery_days ?? ""} placeholder="Ex: 7"
                  onBlur={(e) => {
                    const v = e.target.value === "" ? null : Number(e.target.value);
                    if (v !== o.delivery_days) updateOrder(o, { delivery_days: v });
                  }}
                  className={inputCls + " mt-1"} />
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ao alterar o status, o WhatsApp do cliente abrirá automaticamente com a mensagem pronta.
            </p>
          </motion.div>
        );
      })}
      <AnimatePresence>
        {editing && (
          <OrderEditModal
            order={editing}
            onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin", "orders"] }); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderEditModal({ order, onClose, onSaved }: { order: any; onClose: () => void; onSaved: () => void }) {
  const addr = order.shipping_address ?? {};
  const [form, setForm] = useState({
    name: addr.name ?? "",
    phone: addr.phone ?? "",
    cep: addr.cep ?? "",
    street: addr.street ?? "",
    number: addr.number ?? "",
    neighborhood: addr.neighborhood ?? "",
    complement: addr.complement ?? "",
    city: addr.city ?? "",
    state: addr.state ?? "",
    installments: addr.installments ?? 1,
    payment_method: order.payment_method ?? "pix",
    total: Number(order.total ?? 0),
  });
  const [items, setItems] = useState<any[]>(() =>
    (order.order_items ?? []).map((it: any) => ({ ...it }))
  );
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const updateItem = (id: string, patch: Partial<any>) =>
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeItem = (id: string) => {
    setItems((arr) => arr.filter((it) => it.id !== id));
    setDeletedIds((d) => [...d, id]);
  };
  const itemsTotal = items.reduce((s, it) => s + Number(it.unit_price) * Number(it.quantity), 0);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Atualiza itens
    for (const it of items) {
      const { error } = await supabase.from("order_items").update({
        name: it.name,
        color: it.color,
        size: it.size,
        quantity: Number(it.quantity),
        unit_price: Number(it.unit_price),
      }).eq("id", it.id);
      if (error) { setSaving(false); toast.error(error.message); return; }
    }
    // Remove itens excluídos
    if (deletedIds.length) {
      const { error } = await supabase.from("order_items").delete().in("id", deletedIds);
      if (error) { setSaving(false); toast.error(error.message); return; }
    }
    const { error } = await supabase.from("orders").update({
      payment_method: form.payment_method,
      total: Number(form.total),
      shipping_address: {
        ...addr,
        name: form.name, phone: form.phone, cep: form.cep,
        street: form.street, number: form.number,
        neighborhood: form.neighborhood, complement: form.complement,
        city: form.city, state: form.state,
        installments: Number(form.installments),
      },
    }).eq("id", order.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Pedido atualizado"); onSaved(); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black">Editar pedido #{order.order_number ?? order.id.slice(0,8)}</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={save} className="space-y-3 text-sm">
          <Field label="Nome"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></Field>
          <Field label="Telefone"><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="CEP"><input value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} className={inputCls} /></Field>
            <Field label="Cidade"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} /></Field>
          </div>
          <Field label="Rua"><input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Número"><input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className={inputCls} /></Field>
            <Field label="UF"><input maxLength={2} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bairro"><input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className={inputCls} /></Field>
            <Field label="Complemento"><input value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Pagamento">
              <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className={inputCls}>
                <option value="pix">PIX</option>
                <option value="cartao">Cartão</option>
                <option value="boleto">Boleto</option>
              </select>
            </Field>
            <Field label="Parcelas"><input type="number" min={1} value={form.installments} onChange={(e) => setForm({ ...form, installments: Number(e.target.value) })} className={inputCls} /></Field>
            <Field label="Total (R$)"><input type="number" step="0.01" value={form.total} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} className={inputCls} /></Field>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold text-muted-foreground">Itens do pedido</span>
              <button type="button" onClick={() => setForm({ ...form, total: Number(itemsTotal.toFixed(2)) })}
                className="text-xs underline text-accent">Recalcular total ({`R$ ${itemsTotal.toFixed(2)}`})</button>
            </div>
            <div className="space-y-2">
              {items.length === 0 && <p className="text-xs text-muted-foreground">Sem itens.</p>}
              {items.map((it) => (
                <div key={it.id} className="grid grid-cols-12 gap-2 items-center bg-secondary/40 rounded-lg p-2">
                  <input value={it.name} onChange={(e) => updateItem(it.id, { name: e.target.value })}
                    placeholder="Produto" className={`${inputCls} col-span-4 text-xs`} />
                  <input value={it.color} onChange={(e) => updateItem(it.id, { color: e.target.value })}
                    placeholder="Cor" className={`${inputCls} col-span-2 text-xs`} />
                  <input value={it.size} onChange={(e) => updateItem(it.id, { size: e.target.value })}
                    placeholder="Tam" className={`${inputCls} col-span-1 text-xs`} />
                  <input type="number" min={1} value={it.quantity}
                    onChange={(e) => updateItem(it.id, { quantity: Number(e.target.value) })}
                    placeholder="Qtd" className={`${inputCls} col-span-2 text-xs`} />
                  <input type="number" step="0.01" value={it.unit_price}
                    onChange={(e) => updateItem(it.id, { unit_price: Number(e.target.value) })}
                    placeholder="Preço" className={`${inputCls} col-span-2 text-xs`} />
                  <button type="button" onClick={() => removeItem(it.id)}
                    className="col-span-1 p-2 rounded hover:bg-destructive hover:text-destructive-foreground transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button disabled={saving} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent text-accent-foreground font-bold py-3 hover:opacity-90 transition disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Salvando…" : "Salvar alterações"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ProductModal({ product, onClose, onSaved }: {
  product: Product | null; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    category: product?.category ?? "Moletom",
    color: product?.color ?? "",
    color_hex: (product as any)?.color_hex ?? "#000000",
    price: product?.price ?? 0,
    sizes: product?.sizes.join(", ") ?? "P, M, G",
    stock: product?.stock ?? 0,
    image_url: product?.image_url ?? "moletom-preto",
    description: product?.description ?? "",
    tags: ((product as any)?.tags ?? []) as string[],
    is_primary: ((product as any)?.is_primary ?? false) as boolean,
  });
  const [loading, setLoading] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const toggleTag = (t: string) =>
    setForm((f) => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t] }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      tags: form.tags.map((t) => t.trim().toUpperCase()).filter(Boolean),
    };
    // Se marcado como principal, desmarca outras variantes do mesmo nome+categoria
    if (form.is_primary) {
      const q = supabase.from("products").update({ is_primary: false } as never)
        .eq("name", form.name).eq("category", form.category);
      if (product) await q.neq("id", product.id);
      else await q;
    }
    const { error } = product
      ? await supabase.from("products").update(payload as never).eq("id", product.id)
      : await supabase.from("products").insert(payload as never);
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Salvo!"); onSaved(); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black">{product ? "Editar produto" : "Novo produto"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={save} className="space-y-3 text-sm">
          <Field label="Nome"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoria"><input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls} /></Field>
            <Field label="Cor"><input required value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className={inputCls} /></Field>
          </div>
          <Field label="Cor (visual)">
            <div className="flex items-center gap-3">
              <input type="color" value={form.color_hex}
                onChange={(e) => setForm({ ...form, color_hex: e.target.value })}
                className="h-10 w-16 rounded-lg bg-secondary border border-border cursor-pointer" />
              <input value={form.color_hex}
                onChange={(e) => setForm({ ...form, color_hex: e.target.value })}
                placeholder="#000000" className={`${inputCls} font-mono`} />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preço (R$)"><input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputCls} /></Field>
            <Field label="Estoque"><input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className={inputCls} /></Field>
          </div>
          <Field label="Tamanhos (separados por vírgula)"><input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className={inputCls} /></Field>
          <Field label="Imagem">
            <ImageField value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
          </Field>
          <Field label="Descrição"><textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} /></Field>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={form.is_primary} onChange={(e) => setForm({ ...form, is_primary: e.target.checked })}
              className="h-4 w-4 accent-[color:var(--accent)]" />
            <span className="text-xs font-semibold">Variante principal (capa exibida no catálogo)</span>
          </label>
          <Field label="Etiquetas de destaque">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set([...PRESET_TAGS, ...form.tags])).map((t) => {
                  const active = form.tags.includes(t);
                  return (
                    <button type="button" key={t} onClick={() => toggleTag(t)}
                      className={`text-[11px] font-bold rounded-full px-3 py-1 border transition ${active ? "bg-accent text-accent-foreground border-accent" : "border-border hover:border-accent"}`}>
                      {t}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input value={customTag} onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Criar etiqueta personalizada" className={`${inputCls} text-xs`} />
                <button type="button" onClick={() => {
                  const v = customTag.trim().toUpperCase();
                  if (v && !form.tags.includes(v)) setForm((f) => ({ ...f, tags: [...f.tags, v] }));
                  setCustomTag("");
                }} className="rounded-lg bg-secondary px-3 text-xs font-bold hover:bg-muted transition">Adicionar</button>
              </div>
            </div>
          </Field>
          <button disabled={loading} className="w-full rounded-lg bg-accent text-accent-foreground font-bold py-3 hover:opacity-90 transition disabled:opacity-50">
            {loading ? "Salvando…" : "Salvar"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

const inputCls = "w-full rounded-lg bg-secondary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{label}</span><div className="mt-1">{children}</div></label>;
}

type ProductVariant = Product & { color_hex?: string | null };

function VariantsQuickEditor({ products, onChange }: { products: Product[]; onChange: () => void }) {
  const groups = new Map<string, ProductVariant[]>();
  for (const p of products as ProductVariant[]) {
    const key = `${p.name}__${p.category}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  const entries = Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const [openKey, setOpenKey] = useState<string | null>(entries[0]?.[0] ?? null);

  return (
    <section className="mt-8">
      <h2 className="text-lg font-black flex items-center gap-2 mb-3">
        <Palette className="h-5 w-5 text-accent" /> Variantes por produto
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Edite as cores rápidas de cada variante, adicione novas cores ou remova as existentes — tudo se reflete no catálogo automaticamente.
      </p>
      <div className="space-y-2">
        {entries.map(([key, vars]) => {
          const isOpen = openKey === key;
          const base = vars[0];
          return (
            <div key={key} className="rounded-2xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setOpenKey(isOpen ? null : key)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary/40 transition"
              >
                <div className="flex items-center gap-3">
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <div>
                    <p className="font-bold text-sm">{base.name}</p>
                    <p className="text-[11px] text-muted-foreground">{base.category} · {vars.length} {vars.length === 1 ? "variante" : "variantes"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {vars.map((v) => (
                    <span key={v.id} title={v.color}
                      className="h-5 w-5 rounded-full border border-border"
                      style={{ backgroundColor: (v as any).color_hex ?? "#999" }} />
                  ))}
                </div>
              </button>
              {isOpen && <VariantsList variants={vars} onChange={onChange} />}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function VariantsList({ variants, onChange }: { variants: ProductVariant[]; onChange: () => void }) {
  const [rows, setRows] = useState(() =>
    variants.map((v) => ({
      id: v.id,
      color: v.color,
      color_hex: (v as any).color_hex ?? "#000000",
    }))
  );
  const [busy, setBusy] = useState(false);
  const base = variants[0];

  useEffect(() => {
    setRows(variants.map((v) => ({
      id: v.id,
      color: v.color,
      color_hex: (v as any).color_hex ?? "#000000",
    })));
  }, [variants]);

  const update = (id: string, patch: Partial<{ color: string; color_hex: string }>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const saveAll = async () => {
    setBusy(true);
    for (const r of rows) {
      const orig = variants.find((v) => v.id === r.id);
      if (!orig) continue;
      if (orig.color === r.color && ((orig as any).color_hex ?? null) === r.color_hex) continue;
      const { error } = await supabase.from("products")
        .update({ color: r.color, color_hex: r.color_hex } as never)
        .eq("id", r.id);
      if (error) { setBusy(false); toast.error(error.message); return; }
    }
    setBusy(false);
    toast.success("Cores atualizadas");
    onChange();
  };

  const addVariant = async () => {
    setBusy(true);
    const payload = {
      name: base.name,
      category: base.category,
      color: "Nova cor",
      color_hex: "#888888",
      price: base.price,
      sizes: base.sizes,
      stock: 0,
      image_url: base.image_url,
      description: (base as any).description ?? "",
      tags: (base as any).tags ?? [],
      is_primary: false,
    };
    const { error } = await supabase.from("products").insert(payload as never);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Variante adicionada");
    onChange();
  };

  const removeVariant = async (id: string) => {
    if (variants.length <= 1) { toast.error("Mantenha ao menos uma variante."); return; }
    if (!confirm("Remover essa variante de cor?")) return;
    setBusy(true);
    const { error } = await supabase.from("products").delete().eq("id", id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Variante removida");
    onChange();
  };

  return (
    <div className="border-t border-border p-4 space-y-3 bg-secondary/20">
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-2">
            <input type="color" value={r.color_hex}
              onChange={(e) => update(r.id, { color_hex: e.target.value })}
              className="h-9 w-12 rounded-lg cursor-pointer border border-border bg-secondary" />
            <input value={r.color_hex}
              onChange={(e) => update(r.id, { color_hex: e.target.value })}
              className={`${inputCls} font-mono text-xs w-28`} />
            <input value={r.color}
              onChange={(e) => update(r.id, { color: e.target.value })}
              placeholder="Nome da cor"
              className={`${inputCls} flex-1`} />
            <button type="button" onClick={() => removeVariant(r.id)} disabled={busy}
              title="Remover variante"
              className="p-2 rounded-lg bg-secondary hover:bg-destructive hover:text-destructive-foreground transition disabled:opacity-50">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        <button type="button" onClick={saveAll} disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-accent text-accent-foreground font-bold px-4 py-2 text-sm hover:opacity-90 transition disabled:opacity-50">
          <Save className="h-4 w-4" /> Salvar cores
        </button>
        <button type="button" onClick={addVariant} disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-secondary font-bold px-4 py-2 text-sm hover:bg-muted transition disabled:opacity-50">
          <Plus className="h-4 w-4" /> Adicionar cor
        </button>
      </div>
    </div>
  );
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Imagem enviada!");
    } catch (err: any) {
      toast.error(err.message ?? "Falha ao enviar");
    } finally { setUploading(false); }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <img src={getProductImage(value)} alt="" className="w-16 h-16 rounded object-cover bg-secondary" />
        <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg bg-secondary px-3 py-2 hover:bg-muted transition text-sm font-semibold">
          <Upload className="h-4 w-4" />
          {uploading ? "Enviando…" : "Enviar imagem"}
          <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={uploading} />
        </label>
      </div>
      <select value={productImages[value] ? value : ""} onChange={(e) => e.target.value && onChange(e.target.value)} className={inputCls}>
        <option value="">— ou escolher imagem padrão —</option>
        {Object.keys(productImages).map((k) => <option key={k} value={k}>{k}</option>)}
      </select>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="URL ou slug" className={`${inputCls} text-xs`} />
    </div>
  );
}

type SupportTicket = {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  subject: string | null;
  transcript: Array<{ role: string; text: string }>;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em atendimento",
  resolved: "Resolvido",
};

function SupportPanel() {
  const qc = useQueryClient();
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["support_tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as SupportTicket[];
    },
  });
  const [active, setActive] = useState<SupportTicket | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["support_tickets"] });

  return (
    <section className="mt-8 grid lg:grid-cols-[360px_1fr] gap-6">
      <div className="space-y-2">
        <h2 className="font-black text-lg flex items-center gap-2"><LifeBuoy className="h-5 w-5" /> Tickets de suporte</h2>
        {isLoading && <p className="text-xs text-muted-foreground">Carregando…</p>}
        {!isLoading && tickets.length === 0 && (
          <p className="text-xs text-muted-foreground">Nenhum ticket por enquanto.</p>
        )}
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {tickets.map((t) => {
            const isActive = active?.id === t.id;
            return (
              <button key={t.id} onClick={() => setActive(t)}
                className={`w-full text-left rounded-xl border p-3 transition ${isActive ? "border-accent bg-accent/10" : "border-border hover:border-accent/60"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold truncate">{t.user_name || t.user_email || "Visitante"}</span>
                  <StatusPill status={t.status} />
                </div>
                <p className="text-xs text-muted-foreground truncate mt-1">{t.subject || t.transcript?.[t.transcript.length - 1]?.text || "(sem assunto)"}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(t.created_at).toLocaleString("pt-BR")}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-[400px]">
        {!active ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground border border-dashed border-border rounded-2xl p-10">
            <MessageCircle className="h-10 w-10 mb-2 opacity-60" />
            <p className="text-sm">Selecione um ticket para ver a conversa.</p>
          </div>
        ) : (
          <TicketDetail ticket={active} onChange={() => { refresh(); }} onClose={() => setActive(null)} />
        )}
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "open" ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
    : status === "in_progress" ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  return <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full border px-2 py-0.5 ${cls}`}>{STATUS_LABEL[status] ?? status}</span>;
}

function TicketDetail({ ticket, onChange, onClose }: { ticket: SupportTicket; onChange: () => void; onClose: () => void }) {
  const [status, setStatus] = useState(ticket.status);
  const [notes, setNotes] = useState(ticket.admin_notes ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setStatus(ticket.status); setNotes(ticket.admin_notes ?? ""); }, [ticket.id]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("support_tickets")
      .update({ status, admin_notes: notes }).eq("id", ticket.id);
    setSaving(false);
    if (error) toast.error(error.message); else { toast.success("Ticket atualizado"); onChange(); }
  };

  return (
    <div className="border border-border rounded-2xl p-5 space-y-4 bg-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{new Date(ticket.created_at).toLocaleString("pt-BR")}</p>
          <h3 className="text-lg font-black">{ticket.user_name || "Visitante"}</h3>
          <p className="text-xs text-muted-foreground">{ticket.user_email || "sem email"}</p>
          {ticket.subject && <p className="text-sm mt-1"><span className="text-muted-foreground">Assunto: </span>{ticket.subject}</p>}
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary"><X className="h-4 w-4" /></button>
      </div>

      <div className="space-y-2 max-h-[40vh] overflow-y-auto bg-secondary/30 rounded-xl p-3">
        {ticket.transcript.length === 0 && <p className="text-xs text-muted-foreground">Sem conversa registrada.</p>}
        {ticket.transcript.map((m, i) => (
          <div key={i} className={`text-sm ${m.role === "user" ? "text-foreground" : "text-muted-foreground"}`}>
            <span className="text-[10px] font-bold uppercase mr-2 opacity-70">{m.role === "user" ? "Cliente" : m.role === "assistant" ? "OutBot" : m.role}</span>
            <span className="whitespace-pre-wrap">{m.text}</span>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-[200px_1fr] gap-3">
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            <option value="open">Aberto</option>
            <option value="in_progress">Em atendimento</option>
            <option value="resolved">Resolvido</option>
          </select>
        </Field>
        <Field label="Notas internas">
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
        </Field>
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-accent text-accent-foreground font-bold px-4 py-2 hover:opacity-90 transition disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </div>
  );
}