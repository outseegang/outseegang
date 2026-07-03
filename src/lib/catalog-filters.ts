import type { Product } from "@/components/ProductCard";

function productHaystack(p: Product): string {
  const extra = (p as unknown as { sku?: string; tags?: string[] }).sku ?? "";
  const tags = ((p as unknown as { tags?: string[] }).tags ?? []).join(" ");
  return `${p.name} ${p.color} ${p.category} ${p.description ?? ""} ${extra} ${tags}`.toLowerCase();
}

export function filterProducts(all: Product[], query: string, cat: string): Product[] {
  const term = query.trim().toLowerCase();
  return all.filter((p) => {
    const matchCat = cat === "Todos" || p.category === cat;
    const matchTerm = !term || productHaystack(p).includes(term);
    return matchCat && matchTerm;
  });
}

export function groupVariants(products: Product[]): Product[][] {
  const map = new Map<string, Product[]>();
  for (const p of products) {
    const key = `${p.name}__${p.category}`;
    const arr = map.get(key) ?? [];
    arr.push(p);
    map.set(key, arr);
  }
  return Array.from(map.values());
}

/**
 * Group-aware search: matches any variant (name, color, SKU, categoria,
 * descrição, tags), returns a single card per grupo, e devolve também qual cor
 * bateu com o termo — para destacar via swatch/preferredColor.
 */
export function searchAndGroup(
  all: Product[],
  query: string,
  cat: string,
): Array<{ variants: Product[]; matchedColor?: string }> {
  const term = query.trim().toLowerCase();
  const catFiltered = cat === "Todos" ? all : all.filter((p) => p.category === cat);

  // group everything by name+category first — a single lookup, sem duplicatas
  const groups = groupVariants(catFiltered);
  if (!term) return groups.map((variants) => ({ variants }));

  const results: Array<{ variants: Product[]; matchedColor?: string }> = [];
  for (const variants of groups) {
    const groupHay = `${variants[0].name} ${variants[0].category}`.toLowerCase();
    const groupHit = groupHay.includes(term);
    const matched = variants.find((v) => productHaystack(v).includes(term));
    if (groupHit || matched) {
      results.push({ variants, matchedColor: matched?.color });
    }
  }
  return results;
}

/** Retorna { min, max } de preços das variantes. */
export function priceRange(variants: Product[]): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const v of variants) {
    const n = Number(v.price);
    if (!Number.isFinite(n)) continue;
    if (n < min) min = n;
    if (n > max) max = n;
  }
  if (!Number.isFinite(min)) return { min: 0, max: 0 };
  return { min, max };
}

export type SortKey = "category" | "price-asc" | "price-desc" | "name";

export function sortGroups(groups: Product[][], key: SortKey = "category"): Product[][] {
  const head = (g: Product[]) => g.find((v) => v.is_primary) ?? g[0];
  const copy = groups.slice();
  copy.sort((a, b) => {
    const A = head(a);
    const B = head(b);
    switch (key) {
      case "price-asc":
        return Number(A.price) - Number(B.price);
      case "price-desc":
        return Number(B.price) - Number(A.price);
      case "name":
        return A.name.localeCompare(B.name);
      case "category":
      default:
        return A.category.localeCompare(B.category) || A.name.localeCompare(B.name);
    }
  });
  return copy;
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  if (pageSize <= 0) return items;
  const p = Math.max(1, Math.floor(page));
  const start = (p - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function pageCount(total: number, pageSize: number): number {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}