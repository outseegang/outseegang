import { describe, it, expect } from "vitest";
import {
  filterProducts,
  groupVariants,
  sortGroups,
  paginate,
  pageCount,
} from "./catalog-filters";
import type { Product } from "@/components/ProductCard";

function mk(over: Partial<Product>): Product {
  return {
    id: over.id ?? Math.random().toString(36).slice(2),
    name: "Moletom Outsee",
    color: "Preto",
    category: "Moletons",
    price: 199.9,
    stock: 10,
    image_url: "x.jpg",
    sizes: ["M"],
    tags: [],
    description: "",
    is_primary: false,
    ...over,
  } as Product;
}

const catalog: Product[] = [
  mk({ id: "m-p", name: "Moletom Outsee", color: "Preto", category: "Moletons", price: 199.9, is_primary: true }),
  mk({ id: "m-b", name: "Moletom Outsee", color: "Branco", category: "Moletons", price: 199.9 }),
  mk({ id: "m-v", name: "Moletom Outsee", color: "Vermelho", category: "Moletons", price: 219.9 }),
  mk({ id: "t-v", name: "Tênis Outsee", color: "Verde", category: "Tênis", price: 349.9, is_primary: true }),
  mk({ id: "t-p", name: "Tênis Outsee", color: "Preto", category: "Tênis", price: 349.9 }),
  mk({ id: "c-a", name: "Camiseta Outsee", color: "Azul", category: "Camisetas", price: 89.9, is_primary: true }),
];

describe("filterProducts — search bar", () => {
  it("retorna todos os moletons quando busca 'moletom'", () => {
    const r = filterProducts(catalog, "moletom", "Todos");
    expect(r).toHaveLength(3);
    expect(r.every((p) => p.category === "Moletons")).toBe(true);
  });

  it("retorna todos os tênis quando busca 'tênis'", () => {
    const r = filterProducts(catalog, "tênis", "Todos");
    expect(r).toHaveLength(2);
    expect(r.every((p) => p.category === "Tênis")).toBe(true);
  });

  it("filtra variantes pretas em qualquer categoria com 'preto'", () => {
    const r = filterProducts(catalog, "preto", "Todos");
    const ids = r.map((p) => p.id).sort();
    expect(ids).toEqual(["m-p", "t-p"]);
  });

  it("filtra variantes verdes com 'verde'", () => {
    const r = filterProducts(catalog, "verde", "Todos");
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe("t-v");
  });

  it("é case-insensitive e ignora espaços nas pontas", () => {
    expect(filterProducts(catalog, "  MOLETOM  ", "Todos")).toHaveLength(3);
  });

  it("combina termo de busca com categoria", () => {
    const r = filterProducts(catalog, "preto", "Tênis");
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe("t-p");
  });

  it("retorna vazio quando nada bate", () => {
    expect(filterProducts(catalog, "inexistente", "Todos")).toHaveLength(0);
  });
});

describe("groupVariants", () => {
  it("agrupa variantes pelo par nome+categoria", () => {
    const groups = groupVariants(catalog);
    expect(groups).toHaveLength(3);
    const moletons = groups.find((g) => g[0].name === "Moletom Outsee")!;
    expect(moletons).toHaveLength(3);
  });
});

describe("sortGroups — ordenação", () => {
  const groups = groupVariants(catalog);

  it("ordena por categoria (default) alfabeticamente", () => {
    const sorted = sortGroups(groups, "category");
    expect(sorted.map((g) => g[0].category)).toEqual(["Camisetas", "Moletons", "Tênis"]);
  });

  it("ordena por preço crescente usando a variante primária", () => {
    const sorted = sortGroups(groups, "price-asc");
    const prices = sorted.map((g) => Number((g.find((v) => v.is_primary) ?? g[0]).price));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(prices[0]).toBe(89.9);
  });

  it("ordena por preço decrescente", () => {
    const sorted = sortGroups(groups, "price-desc");
    const prices = sorted.map((g) => Number((g.find((v) => v.is_primary) ?? g[0]).price));
    expect(prices[0]).toBe(349.9);
  });

  it("ordena por nome", () => {
    const sorted = sortGroups(groups, "name");
    expect(sorted.map((g) => g[0].name)).toEqual([
      "Camiseta Outsee",
      "Moletom Outsee",
      "Tênis Outsee",
    ]);
  });

  it("não muta o array original", () => {
    const original = groups.slice();
    sortGroups(groups, "price-desc");
    expect(groups).toEqual(original);
  });
});

describe("paginate — paginação", () => {
  const items = Array.from({ length: 10 }, (_, i) => i + 1);

  it("retorna a primeira página", () => {
    expect(paginate(items, 1, 4)).toEqual([1, 2, 3, 4]);
  });

  it("retorna a página do meio", () => {
    expect(paginate(items, 2, 4)).toEqual([5, 6, 7, 8]);
  });

  it("retorna a última página parcial", () => {
    expect(paginate(items, 3, 4)).toEqual([9, 10]);
  });

  it("trata página <1 como 1", () => {
    expect(paginate(items, 0, 4)).toEqual([1, 2, 3, 4]);
  });

  it("retorna vazio além do total", () => {
    expect(paginate(items, 99, 4)).toEqual([]);
  });

  it("pageCount calcula o total de páginas", () => {
    expect(pageCount(10, 4)).toBe(3);
    expect(pageCount(8, 4)).toBe(2);
    expect(pageCount(0, 4)).toBe(1);
  });

  it("pagina grupos filtrados de moletons", () => {
    const groups = groupVariants(filterProducts(catalog, "moletom", "Todos"));
    const flat = groups[0]; // 3 moletons
    expect(paginate(flat, 1, 2)).toHaveLength(2);
    expect(paginate(flat, 2, 2)).toHaveLength(1);
  });
});