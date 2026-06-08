import type { Product } from "@/components/ProductCard";

export function filterProducts(all: Product[], query: string, cat: string): Product[] {
  const term = query.trim().toLowerCase();
  return all.filter((p) => {
    const matchCat = cat === "Todos" || p.category === cat;
    const matchTerm =
      !term ||
      `${p.name} ${p.color} ${p.category} ${p.description ?? ""}`
        .toLowerCase()
        .includes(term);
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