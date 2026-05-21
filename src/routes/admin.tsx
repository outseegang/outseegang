import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getProductImage, productImages } from "@/lib/product-images";
import type { Product } from "@/components/ProductCard";

export const Route = createFileRoute("/admin")({ component: Admin });

function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) nav({ to: "/perfil" });
  }, [loading, user, isAdmin, nav]);

  const qc = useQueryClient();
  const { data: products = [] } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("category");
      if (error) throw error;
      return data as Product[];
    },
    enabled: isAdmin,
  });

  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ["products"] });

  const del = async (id: string) => {
    if (!confirm("Excluir produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Excluído"); refresh(); }
  };

  if (!isAdmin) return null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Painel Admin</h1>
          <p className="text-muted-foreground">Gerencie todo o catálogo Outsee.</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground font-bold px-5 py-3 hover:scale-105 transition">
          <Plus className="h-4 w-4" /> Novo produto
        </button>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
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
    </main>
  );
}

function ProductModal({ product, onClose, onSaved }: {
  product: Product | null; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    category: product?.category ?? "Moletom",
    color: product?.color ?? "",
    price: product?.price ?? 0,
    sizes: product?.sizes.join(", ") ?? "P, M, G",
    stock: product?.stock ?? 0,
    image_url: product?.image_url ?? "moletom-preto",
    description: product?.description ?? "",
  });
  const [loading, setLoading] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
    };
    const { error } = product
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert(payload);
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
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preço (R$)"><input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputCls} /></Field>
            <Field label="Estoque"><input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className={inputCls} /></Field>
          </div>
          <Field label="Tamanhos (separados por vírgula)"><input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className={inputCls} /></Field>
          <Field label="Imagem">
            <ImageField value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
          </Field>
          <Field label="Descrição"><textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} /></Field>
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