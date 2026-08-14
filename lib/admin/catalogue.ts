import "server-only";

import { requireAdmin } from "@/lib/auth/admin";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  archived: boolean;
  updatedAt: string;
  productCount: number;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName: string;
  featured: boolean;
  archived: boolean;
  updatedAt: string;
  variants: Array<{ id: string; name: string; sku: string; priceMinor: number; stockQuantity: number; active: boolean }>;
  images: Array<{ id: string; path: string; alt: string | null; position: number }>;
};

type ProductRow = {
  id: string; name: string; slug: string; description: string; category_id: string;
  is_featured: boolean; is_archived: boolean; updated_at: string;
  category: { name: string } | Array<{ name: string }> | null;
  variants: Array<{ id: string; name: string; sku: string; price_minor: number; stock_quantity: number; is_active: boolean }> | null;
  images: Array<{ id: string; storage_path: string; alt_text: string | null; position: number }> | null;
};

type CategoryRow = {
  id: string; name: string; slug: string; description: string | null;
  is_archived: boolean; updated_at: string;
  products: Array<{ count: number }> | null;
};

function mapProduct(row: ProductRow): AdminProduct {
  const category = Array.isArray(row.category) ? row.category[0] : row.category;
  return {
    id: row.id, name: row.name, slug: row.slug, description: row.description,
    categoryId: row.category_id, categoryName: category?.name ?? "Uncategorised",
    featured: row.is_featured, archived: row.is_archived, updatedAt: row.updated_at,
    variants: (row.variants ?? []).map((variant) => ({
      id: variant.id, name: variant.name, sku: variant.sku, priceMinor: variant.price_minor,
      stockQuantity: variant.stock_quantity, active: variant.is_active,
    })),
    images: (row.images ?? []).map((image) => ({
      id: image.id, path: image.storage_path, alt: image.alt_text, position: image.position,
    })).sort((a: { position: number }, b: { position: number }) => a.position - b.position),
  };
}

export async function getAdminCategories() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description,is_archived,updated_at,products(count)")
    .order("name");
  if (error) throw new Error("Unable to load categories.");
  return (data as CategoryRow[]).map((row): AdminCategory => ({
    id: row.id, name: row.name, slug: row.slug, description: row.description,
    archived: row.is_archived, updatedAt: row.updated_at,
    productCount: row.products?.[0]?.count ?? 0,
  }));
}

export async function getAdminProducts(filters: { search?: string; category?: string; status?: "active" | "archived" } = {}) {
  const { supabase } = await requireAdmin();
  let request = supabase
    .from("products")
    .select("id,name,slug,description,category_id,is_featured,is_archived,updated_at,category:categories(name),variants:product_variants(id,name,sku,price_minor,stock_quantity,is_active),images:product_images(id,storage_path,alt_text,position)")
    .order("updated_at", { ascending: false });
  if (filters.search) request = request.ilike("name", `%${filters.search}%`);
  if (filters.category) request = request.eq("category_id", filters.category);
  if (filters.status === "active") request = request.eq("is_archived", false);
  if (filters.status === "archived") request = request.eq("is_archived", true);
  const { data, error } = await request;
  if (error) throw new Error("Unable to load products.");
  return (data as ProductRow[]).map(mapProduct);
}

export async function getAdminProduct(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("id,name,slug,description,category_id,is_featured,is_archived,updated_at,category:categories(name),variants:product_variants(id,name,sku,price_minor,stock_quantity,is_active),images:product_images(id,storage_path,alt_text,position)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Unable to load product.");
  return data ? mapProduct(data as ProductRow) : null;
}

export async function getAdminLowStockThreshold() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("settings")
    .select("low_stock_threshold")
    .eq("id", true)
    .maybeSingle();
  if (error || !data) throw new Error("Unable to load stock settings.");
  return data.low_stock_threshold;
}
