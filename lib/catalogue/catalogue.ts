import "server-only";

import { createClient } from "@/lib/supabase/server";
import { type ShopQuery } from "./query";
import {
  type CatalogueCategory,
  type CatalogueProduct,
  productPriceMinor,
} from "./types";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_featured: boolean;
  created_at: string;
  category:
    | { name: string; slug: string }
    | Array<{ name: string; slug: string }>
    | null;
  variants: Array<{
    id: string;
    name: string;
    price_minor: number;
    stock_quantity: number;
  }>;
  images: Array<{
    storage_path: string;
    alt_text: string | null;
    position: number;
  }>;
};

export class CatalogueDataError extends Error {}

const imageBucket = process.env.SUPABASE_PRODUCT_IMAGES_BUCKET;

function mapCategory(row: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}): CatalogueCategory {
  return row;
}

function mapProduct(
  row: ProductRow,
  imageBaseUrl: string,
): CatalogueProduct | null {
  const category = Array.isArray(row.category) ? row.category[0] : row.category;
  if (!category || row.variants.length === 0) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    createdAt: row.created_at,
    featured: row.is_featured,
    category,
    variants: row.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      priceMinor: variant.price_minor,
      stockQuantity: variant.stock_quantity,
    })),
    images: row.images
      .sort((left, right) => left.position - right.position)
      .map((image) => ({
        path: image.storage_path,
        alt: image.alt_text?.trim() || row.name,
        position: image.position,
        url: imageBucket
          ? `${imageBaseUrl}/${encodeURI(image.storage_path)}`
          : null,
      })),
  };
}

function sortProducts(products: CatalogueProduct[], sort: ShopQuery["sort"]) {
  return [...products].sort((left, right) => {
    if (sort === "name") return left.name.localeCompare(right.name);
    if (sort === "newest") return right.createdAt.localeCompare(left.createdAt);
    if (sort === "price-asc")
      return productPriceMinor(left) - productPriceMinor(right);
    if (sort === "price-desc")
      return productPriceMinor(right) - productPriceMinor(left);
    return (
      Number(right.featured) - Number(left.featured) ||
      right.createdAt.localeCompare(left.createdAt)
    );
  });
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description")
    .order("name");
  if (error) throw new CatalogueDataError();
  return data.map(mapCategory);
}

export async function getProducts(query: ShopQuery = { sort: "featured" }) {
  const supabase = await createClient();
  let request = supabase
    .from("products")
    .select(
      "id,name,slug,description,is_featured,created_at,category:categories!inner(name,slug),variants:product_variants(id,name,price_minor,stock_quantity),images:product_images(storage_path,alt_text,position)",
    )
    .order("created_at", { ascending: false });

  if (query.category) request = request.eq("category.slug", query.category);
  if (query.search) {
    const pattern = `%${query.search}%`;
    request = request.or(`name.ilike.${pattern},description.ilike.${pattern}`);
  }

  const { data, error } = await request;
  if (error) throw new CatalogueDataError();
  const imageBaseUrl = imageBucket
    ? supabase.storage
        .from(imageBucket)
        .getPublicUrl("")
        .data.publicUrl.replace(/\/$/, "")
    : "";
  const products = data
    .map((row) => mapProduct(row as unknown as ProductRow, imageBaseUrl))
    .filter((product): product is CatalogueProduct => product !== null);
  return sortProducts(products, query.sort);
}

export async function getFeaturedProducts(limit = 4) {
  const products = await getProducts({ sort: "featured" });
  return products.filter((product) => product.featured).slice(0, limit);
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,slug,description,is_featured,created_at,category:categories!inner(name,slug),variants:product_variants(id,name,price_minor,stock_quantity),images:product_images(storage_path,alt_text,position)",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new CatalogueDataError();
  if (!data) return null;
  const imageBaseUrl = imageBucket
    ? supabase.storage
        .from(imageBucket)
        .getPublicUrl("")
        .data.publicUrl.replace(/\/$/, "")
    : "";
  return mapProduct(data as unknown as ProductRow, imageBaseUrl);
}
