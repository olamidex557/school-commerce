import { z } from "zod";

const searchSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[\p{L}\p{N}\s-]+$/u);

const sortSchema = z.enum([
  "featured",
  "newest",
  "price-asc",
  "price-desc",
  "name",
]);

export const catalogueSlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export type ShopQuery = {
  category?: string;
  search?: string;
  sort: z.infer<typeof sortSchema>;
};

export function parseShopQuery(
  input: Record<string, string | string[] | undefined>,
): ShopQuery {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const category = first(input.category);
  const search = first(input.search);
  const sort = first(input.sort);

  return {
    category:
      category && catalogueSlugSchema.safeParse(category).success
        ? category
        : undefined,
    search:
      search && searchSchema.safeParse(search).success
        ? search.trim()
        : undefined,
    sort: sortSchema.safeParse(sort).data ?? "featured",
  };
}

export function buildShopHref(query: ShopQuery) {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.search) params.set("search", query.search);
  if (query.sort !== "featured") params.set("sort", query.sort);
  const serialized = params.toString();
  return serialized ? `/shop?${serialized}` : "/shop";
}
