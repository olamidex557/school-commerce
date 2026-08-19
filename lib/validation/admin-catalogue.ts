import { z } from "zod";

export const adminSlugSchema = z
  .string()
  .trim()
  .min(2, "Use at least 2 characters.")
  .max(120, "Use 120 characters or fewer.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and single hyphens only.",
  );

const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required.`).max(max);

export const categoryInputSchema = z.object({
  name: requiredText("Category name", 80),
  slug: adminSlugSchema,
  description: z.string().trim().max(500).optional().default(""),
});

export const variantInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: requiredText("Variant name", 120),
  sku: z
    .string()
    .trim()
    .min(1, "SKU is required.")
    .max(100)
    .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, "Use a safe SKU format."),
  priceMinor: z.coerce
    .number()
    .int("Price must be a whole number of kobo.")
    .min(0, "Price cannot be negative.")
    .max(100_000_000, "Price is too large."),
  stockQuantity: z.coerce
    .number()
    .int("Stock must be a whole number.")
    .min(0, "Stock cannot be negative.")
    .max(1_000_000, "Stock is too large."),
});

export const productInputSchema = z.object({
  name: requiredText("Product name", 160),
  slug: adminSlugSchema,
  description: z.string().trim().max(5_000).default(""),
  categoryId: z.string().uuid("Choose a valid category."),
  featured: z.boolean(),
  archived: z.boolean(),
  // Products may be created before purchasable options are known. Once an
  // option is explicitly added, every pricing/inventory field is required.
  variants: z.array(variantInputSchema).max(30),
});

export type ProductInput = z.infer<typeof productInputSchema>;

function checkbox(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

export function parseCategoryForm(formData: FormData) {
  return categoryInputSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || "",
  });
}

export function parseProductForm(formData: FormData) {
  let variants: unknown = [];
  try {
    variants = JSON.parse(String(formData.get("variants") ?? "[]"));
  } catch {
    variants = [];
  }
  return productInputSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || "",
    categoryId: formData.get("categoryId"),
    featured: checkbox(formData.get("featured")),
    archived: checkbox(formData.get("archived")),
    variants,
  });
}

export function formErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string[] | undefined> = {
    ...error.flatten().fieldErrors,
  };
  for (const issue of error.issues) {
    if (!issue.path.length) continue;
    const key = issue.path.join(".");
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }
  return fieldErrors;
}
