import "server-only";

import { calculateCartSubtotal, type CartItem } from "@/lib/cart";
import { createClient } from "@/lib/supabase/server";

export type CheckoutLine = CartItem & {
  productName: string;
  productSlug: string;
  variantName: string;
  unitPriceMinor: number;
  lineTotalMinor: number;
  stockQuantity: number;
  imageUrl: string | null;
};
export type CheckoutIssue = {
  productId: string;
  variantId: string;
  message: string;
};
export type CheckoutSummary = {
  lines: CheckoutLine[];
  issues: CheckoutIssue[];
  subtotalMinor: number;
};

type ProductRow = { id: string; name: string; slug: string };
type VariantRow = {
  id: string;
  product_id: string;
  name: string;
  price_minor: number;
  stock_quantity: number;
};
type ImageRow = { product_id: string; storage_path: string; position: number };

export async function reconcileCart(
  items: CartItem[],
): Promise<CheckoutSummary> {
  if (!items.length) return { lines: [], issues: [], subtotalMinor: 0 };
  const supabase = await createClient();
  const productIds = [...new Set(items.map((item) => item.productId))];
  const variantIds = [...new Set(items.map((item) => item.variantId))];
  const [
    { data: products, error: productsError },
    { data: variants, error: variantsError },
    { data: images, error: imagesError },
  ] = await Promise.all([
    supabase.from("products").select("id,name,slug").in("id", productIds),
    supabase
      .from("product_variants")
      .select("id,product_id,name,price_minor,stock_quantity")
      .in("id", variantIds),
    supabase
      .from("product_images")
      .select("product_id,storage_path,position")
      .in("product_id", productIds)
      .order("position"),
  ]);
  if (productsError || variantsError || imagesError)
    throw new Error("Cart catalogue read failed");
  const productsById = new Map(
    (products as ProductRow[]).map((product) => [product.id, product]),
  );
  const variantsById = new Map(
    (variants as VariantRow[]).map((variant) => [variant.id, variant]),
  );
  const imagesByProductId = new Map<string, ImageRow>();
  for (const image of images as ImageRow[])
    if (!imagesByProductId.has(image.product_id))
      imagesByProductId.set(image.product_id, image);
  const bucket = process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images";
  const imageBaseUrl = bucket
    ? supabase.storage
        .from(bucket)
        .getPublicUrl("")
        .data.publicUrl.replace(/\/$/, "")
    : "";
  const lines: CheckoutLine[] = [];
  const issues: CheckoutIssue[] = [];
  for (const item of items) {
    const product = productsById.get(item.productId);
    const variant = variantsById.get(item.variantId);
    if (!product) {
      issues.push({ ...item, message: "This product is no longer available." });
      continue;
    }
    if (!variant || variant.product_id !== product.id) {
      issues.push({
        ...item,
        message: "This product option is no longer available.",
      });
      continue;
    }
    if (variant.stock_quantity < 1) {
      issues.push({ ...item, message: "This product option is out of stock." });
      continue;
    }
    if (item.quantity > variant.stock_quantity) {
      issues.push({
        ...item,
        message: `Only ${variant.stock_quantity} available. Adjust the quantity before checkout.`,
      });
      continue;
    }
    const image = imagesByProductId.get(product.id);
    lines.push({
      ...item,
      productName: product.name,
      productSlug: product.slug,
      variantName: variant.name,
      unitPriceMinor: variant.price_minor,
      lineTotalMinor: variant.price_minor * item.quantity,
      stockQuantity: variant.stock_quantity,
      imageUrl: image
        ? `${imageBaseUrl}/${encodeURI(image.storage_path)}`
        : null,
    });
  }
  return {
    lines,
    issues,
    subtotalMinor: calculateCartSubtotal(
      lines.map((line) => ({
        quantity: line.quantity,
        unitPrice: line.unitPriceMinor,
      })),
    ),
  };
}
