"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import {
  initialAdminCatalogueActionState,
  type AdminCatalogueActionState,
} from "@/lib/admin/catalogue-state";
import { productImagesBucket } from "@/lib/admin/product-images";
import {
  adminSlugSchema,
  formErrors,
  parseCategoryForm,
  parseProductForm,
  type ProductInput,
} from "@/lib/validation/admin-catalogue";

const uploadTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const maxImageBytes = Number(process.env.PRODUCT_IMAGE_MAX_BYTES || 5 * 1024 * 1024);

function failure(message: string): AdminCatalogueActionState {
  return { message };
}

function databaseFailure(error: { code?: string } | null) {
  if (error?.code === "23505") return "That slug or SKU is already in use.";
  return "We could not save those changes. Please try again.";
}

function refreshCatalogue(slug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/shop/[slug]", "page");
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  if (slug) revalidatePath(`/shop/${slug}`);
}

async function saveVariants(
  productId: string,
  variants: ProductInput["variants"],
) {
  const { supabase } = await requireAdmin();
  const { data: existing, error: existingError } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);
  if (existingError) return databaseFailure(existingError);
  const submittedIds = new Set(variants.flatMap((variant) => (variant.id ? [variant.id] : [])));
  const existingIds = new Set(existing?.map((variant) => variant.id) ?? []);
  if ([...submittedIds].some((id) => !existingIds.has(id))) {
    return "One of the variants no longer belongs to this product.";
  }
  if (existing?.some((variant) => submittedIds.has(variant.id) === false)) {
    const { error } = await supabase
      .from("product_variants")
      .update({ is_active: false })
      .eq("product_id", productId)
      .in("id", existing.filter((variant) => !submittedIds.has(variant.id)).map((variant) => variant.id));
    if (error) return databaseFailure(error);
  }
  for (const variant of variants) {
    if (variant.id) {
      const { error } = await supabase
        .from("product_variants")
        .update({
          name: variant.name, sku: variant.sku, price_minor: variant.priceMinor,
          stock_quantity: variant.stockQuantity, is_active: true,
        })
        .eq("id", variant.id)
        .eq("product_id", productId);
      if (error) return databaseFailure(error);
    } else {
      const { error } = await supabase.from("product_variants").insert({
        product_id: productId, name: variant.name, sku: variant.sku,
        price_minor: variant.priceMinor, stock_quantity: variant.stockQuantity,
      });
      if (error) return databaseFailure(error);
    }
  }
}

async function categoryCanContainProduct(categoryId: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("id,is_archived")
    .eq("id", categoryId)
    .maybeSingle();
  return !error && data?.is_archived === false;
}

export async function createCategory(
  _previous: AdminCatalogueActionState,
  formData: FormData,
): Promise<AdminCatalogueActionState> {
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) return { fieldErrors: formErrors(parsed.error) };
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").insert({
    ...parsed.data,
    description: parsed.data.description || null,
  });
  if (error) return failure(databaseFailure(error));
  refreshCatalogue();
  return initialAdminCatalogueActionState;
}

export async function updateCategory(
  _previous: AdminCatalogueActionState,
  formData: FormData,
): Promise<AdminCatalogueActionState> {
  const id = String(formData.get("id") ?? "");
  if (!adminSlugSchema.safeParse(String(formData.get("slug") ?? "")).success || !/^[0-9a-f-]{36}$/i.test(id)) {
    return failure("Enter valid category details.");
  }
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) return { fieldErrors: formErrors(parsed.error) };
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").update({
    ...parsed.data, description: parsed.data.description || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) return failure(databaseFailure(error));
  refreshCatalogue();
  return initialAdminCatalogueActionState;
}

export async function toggleCategoryArchive(id: string, archived: boolean) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  const { supabase } = await requireAdmin();
  if (archived) {
    const { count, error } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", id).eq("is_archived", false);
    if (error || (count ?? 0) > 0) return;
  }
  await supabase.from("categories").update({ is_archived: archived, updated_at: new Date().toISOString() }).eq("id", id);
  refreshCatalogue();
}

export async function createProduct(
  _previous: AdminCatalogueActionState,
  formData: FormData,
): Promise<AdminCatalogueActionState> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) return { fieldErrors: formErrors(parsed.error) };
  if (!(await categoryCanContainProduct(parsed.data.categoryId))) {
    return failure("Choose an active category.");
  }
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("products").insert({
    name: parsed.data.name, slug: parsed.data.slug, description: parsed.data.description,
    category_id: parsed.data.categoryId, is_featured: parsed.data.featured,
    is_archived: parsed.data.archived,
  }).select("id,slug").single();
  if (error) return failure(databaseFailure(error));
  const variantError = await saveVariants(data.id, parsed.data.variants);
  if (variantError) {
    await supabase.from("products").delete().eq("id", data.id);
    return failure(variantError);
  }
  refreshCatalogue(data.slug);
  redirect(`/admin/products/${data.id}`);
}

export async function updateProduct(
  _previous: AdminCatalogueActionState,
  formData: FormData,
): Promise<AdminCatalogueActionState> {
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return failure("Product was not found.");
  const parsed = parseProductForm(formData);
  if (!parsed.success) return { fieldErrors: formErrors(parsed.error) };
  if (!(await categoryCanContainProduct(parsed.data.categoryId))) {
    return failure("Choose an active category.");
  }
  const { supabase } = await requireAdmin();
  const { data: existing, error: existingError } = await supabase.from("products").select("slug").eq("id", id).maybeSingle();
  if (existingError || !existing) return failure("Product was not found.");
  const { error } = await supabase.from("products").update({
    name: parsed.data.name, slug: parsed.data.slug, description: parsed.data.description,
    category_id: parsed.data.categoryId, is_featured: parsed.data.featured,
    is_archived: parsed.data.archived, updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) return failure(databaseFailure(error));
  const variantError = await saveVariants(id, parsed.data.variants);
  if (variantError) return failure(variantError);
  refreshCatalogue(existing.slug);
  refreshCatalogue(parsed.data.slug);
  return initialAdminCatalogueActionState;
}

export async function toggleProductArchive(id: string, archived: boolean) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  const { supabase } = await requireAdmin();
  const { data: product } = await supabase
    .from("products")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  if (!product) return;
  await supabase.from("products").update({ is_archived: archived, updated_at: new Date().toISOString() }).eq("id", id);
  refreshCatalogue(product.slug);
}

function validImageBytes(bytes: Uint8Array, mime: string) {
  if (mime === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8;
  if (mime === "image/png") return bytes.slice(0, 8).every((value, index) => value === [137,80,78,71,13,10,26,10][index]);
  if (mime === "image/webp") return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  return false;
}

export async function uploadProductImage(
  _previous: AdminCatalogueActionState,
  formData: FormData,
): Promise<AdminCatalogueActionState> {
  const productId = String(formData.get("productId") ?? "");
  const file = formData.get("image");
  if (!/^[0-9a-f-]{36}$/i.test(productId) || !(file instanceof File)) return failure("Choose an image to upload.");
  const extension = uploadTypes[file.type];
  if (!extension || file.size === 0 || file.size > maxImageBytes) return failure("Use a JPG, PNG, or WebP image within the allowed size.");
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!validImageBytes(bytes, file.type)) return failure("The image file could not be verified.");
  const { supabase } = await requireAdmin();
  const { data: product } = await supabase.from("products").select("id,slug").eq("id", productId).maybeSingle();
  if (!product) return failure("Product was not found.");
  const { data: images, error: imageError } = await supabase.from("product_images").select("position").eq("product_id", productId).order("position", { ascending: false }).limit(1);
  if (imageError) return failure("We could not prepare the upload.");
  const path = `products/${productId}/${randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from(productImagesBucket).upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return failure("We could not upload that image.");
  const { error: rowError } = await supabase.from("product_images").insert({
    product_id: productId, storage_path: path, alt_text: String(formData.get("altText") ?? "").trim().slice(0, 160) || null,
    position: (images?.[0]?.position ?? -1) + 1,
  });
  if (rowError) {
    await supabase.storage.from(productImagesBucket).remove([path]);
    return failure(databaseFailure(rowError));
  }
  await supabase.from("products").update({ updated_at: new Date().toISOString() }).eq("id", productId);
  refreshCatalogue(product.slug);
  return initialAdminCatalogueActionState;
}

export async function deleteProductImage(productId: string, imageId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(productId) || !/^[0-9a-f-]{36}$/i.test(imageId)) return;
  const { supabase } = await requireAdmin();
  const { data: image } = await supabase.from("product_images").select("storage_path,products!inner(slug)").eq("id", imageId).eq("product_id", productId).maybeSingle();
  if (!image) return;
  await supabase.storage.from(productImagesBucket).remove([image.storage_path]);
  await supabase.from("product_images").delete().eq("id", imageId).eq("product_id", productId);
  await supabase.from("products").update({ updated_at: new Date().toISOString() }).eq("id", productId);
  const product = Array.isArray(image.products) ? image.products[0] : image.products;
  refreshCatalogue(product?.slug);
}
