import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const INTEREST_RATE = 0.0299;

const itemSchema = z.object({
  product_id: z.string().uuid(),
  color: z.string().min(1).max(64),
  size: z.string().min(1).max(16),
  quantity: z.number().int().min(1).max(99),
});

const inputSchema = z.object({
  items: z.array(itemSchema).min(1).max(50),
  payment_method: z.enum(["pix", "cartao", "boleto"]),
  installments: z.number().int().min(1).max(12),
  shipping_address: z.object({
    name: z.string().min(1).max(120),
    phone: z.string().min(1).max(32),
    cep: z.string().min(1).max(16),
    street: z.string().min(1).max(200),
    number: z.string().min(1).max(32),
    neighborhood: z.string().max(120).optional().default(""),
    complement: z.string().max(200).optional().default(""),
    city: z.string().min(1).max(120),
    state: z.string().min(2).max(2),
  }),
});

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const ids = Array.from(new Set(data.items.map((i) => i.product_id)));
    const { data: products, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id,name,price,image_url")
      .in("id", ids);
    if (pErr) throw new Error(pErr.message);
    const byId = new Map(products?.map((p) => [p.id, p]) ?? []);
    if (byId.size !== ids.length) throw new Error("Produto inválido no carrinho");

    let subtotal = 0;
    const itemsResolved = data.items.map((i) => {
      const p = byId.get(i.product_id)!;
      const unit = Number(p.price);
      subtotal += unit * i.quantity;
      return {
        product_id: p.id,
        name: p.name,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
        unit_price: unit,
        image_url: p.image_url ?? "",
      };
    });

    const installments = (data.payment_method === "cartao" || data.payment_method === "boleto")
      ? data.installments
      : 1;
    const maxInst = data.payment_method === "cartao" ? 12 : data.payment_method === "boleto" ? 6 : 1;
    if (installments > maxInst) throw new Error("Parcelamento inválido");

    let total = subtotal;
    let perInstallment = subtotal / installments;
    let hasInterest = false;
    if (installments > 3) {
      const i = INTEREST_RATE;
      perInstallment = (subtotal * i) / (1 - Math.pow(1 + i, -installments));
      total = perInstallment * installments;
      hasInterest = true;
    }

    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: context.userId,
        status: "pending",
        total,
        payment_method: data.payment_method,
        shipping_address: { ...data.shipping_address, installments },
      })
      .select()
      .single();
    if (oErr) throw new Error(oErr.message);

    const { error: iErr } = await supabaseAdmin
      .from("order_items")
      .insert(itemsResolved.map((it) => ({ ...it, order_id: order.id })));
    if (iErr) throw new Error(iErr.message);

    return {
      order_id: order.id,
      order_number: (order as any).order_number ?? null,
      subtotal,
      total,
      installments,
      per_installment: perInstallment,
      has_interest: hasInterest,
      items: itemsResolved,
    };
  });