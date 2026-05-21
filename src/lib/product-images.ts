import azulMarinho from "@/assets/moletom-azul-marinho.png";
import branco from "@/assets/moletom-branco.png";
import preto from "@/assets/moletom-preto.png";
import verdeMilitar from "@/assets/moletom-verde-militar.png";
import vermelho from "@/assets/moletom-vermelho.png";
import tenisAzul from "@/assets/tenis-azul.png";
import tenisBranco from "@/assets/tenis-branco.png";
import tenisLaranja from "@/assets/tenis-laranja.png";
import tenisRoxo from "@/assets/tenis-roxo.png";

export const productImages: Record<string, string> = {
  "moletom-azul-marinho": azulMarinho,
  "moletom-branco": branco,
  "moletom-preto": preto,
  "moletom-verde-militar": verdeMilitar,
  "moletom-vermelho": vermelho,
  "tenis-azul": tenisAzul,
  "tenis-branco": tenisBranco,
  "tenis-laranja": tenisLaranja,
  "tenis-roxo": tenisRoxo,
};

export function getProductImage(slug: string): string {
  if (!slug) return branco;
  if (slug.startsWith("http://") || slug.startsWith("https://")) return slug;
  return productImages[slug] ?? branco;
}