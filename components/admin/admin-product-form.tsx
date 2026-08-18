"use client";

import { useActionState, useState } from "react";
import { Minus, Plus, Save } from "lucide-react";
import {
  initialAdminCatalogueActionState,
  type AdminCatalogueActionState,
} from "@/lib/admin/catalogue-state";

type Variant = {
  id?: string;
  name: string;
  sku: string;
  priceMinor: number;
  stockQuantity: number;
};
type Category = { id: string; name: string; archived: boolean };
type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  featured: boolean;
  archived: boolean;
  variants: Variant[];
};

type ProductAction = (
  state: AdminCatalogueActionState,
  data: FormData,
) => Promise<AdminCatalogueActionState>;

const blankVariant = (): Variant => ({
  name: "Default",
  sku: "",
  priceMinor: 0,
  stockQuantity: 0,
});

function errorFor(state: AdminCatalogueActionState, name: string) {
  return state.fieldErrors?.[name]?.[0];
}

export function AdminProductForm({
  categories,
  product,
  action,
}: Readonly<{
  categories: Category[];
  product?: Product;
  action: ProductAction;
}>) {
  const [variants, setVariants] = useState<Variant[]>(
    product?.variants ?? [blankVariant()],
  );
  const [state, formAction, pending] = useActionState(
    action,
    initialAdminCatalogueActionState,
  );
  const usableCategories = categories.filter(
    (category) => !category.archived || category.id === product?.categoryId,
  );
  const updateVariant = (
    index: number,
    field: keyof Variant,
    value: string | number,
  ) => {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant,
      ),
    );
  };
  return (
    <form action={formAction} className="space-y-8" noValidate>
      {product ? <input name="id" type="hidden" value={product.id} /> : null}
      <input name="variants" type="hidden" value={JSON.stringify(variants)} />
      <section className="surface-card p-5 sm:p-7">
        <h2 className="text-xl font-black">Product information</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-bold">
            Name
            <input
              className="form-input"
              name="name"
              required
              defaultValue={product?.name}
              disabled={pending}
            />
            {errorFor(state, "name") ? (
              <span className="mt-1 block text-red-800">
                {errorFor(state, "name")}
              </span>
            ) : null}
          </label>
          <label className="block text-sm font-bold">
            URL slug
            <input
              className="form-input font-mono text-sm"
              name="slug"
              required
              defaultValue={product?.slug}
              placeholder="usb-c-cable"
              disabled={pending}
            />
            {errorFor(state, "slug") ? (
              <span className="mt-1 block text-red-800">
                {errorFor(state, "slug")}
              </span>
            ) : null}
          </label>
          <label className="block text-sm font-bold sm:col-span-2">
            Description
            <textarea
              className="form-textarea"
              name="description"
              defaultValue={product?.description}
              disabled={pending}
            />
          </label>
          <label className="block text-sm font-bold">
            Category
            <select
              className="form-select"
              name="categoryId"
              required
              defaultValue={product?.categoryId}
              disabled={pending}
            >
              <option value="">Choose a category</option>
              {usableCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.archived ? " (archived)" : ""}
                </option>
              ))}
            </select>
            {errorFor(state, "categoryId") ? (
              <span className="mt-1 block text-red-800">
                {errorFor(state, "categoryId")}
              </span>
            ) : null}
          </label>
          <div className="flex items-end gap-6 pb-3 text-sm font-bold">
            <label className="flex items-center gap-2">
              <input
                name="featured"
                type="checkbox"
                defaultChecked={product?.featured}
                disabled={pending}
              />{" "}
              Featured on home
            </label>
            <label className="flex items-center gap-2">
              <input
                name="archived"
                type="checkbox"
                defaultChecked={product?.archived}
                disabled={pending}
              />{" "}
              Archived
            </label>
          </div>
        </div>
      </section>
      <section className="surface-card p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Variants, prices, and stock</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Prices are whole kobo minor units; 150000 = ₦1,500.00.
            </p>
          </div>
          <button
            className="admin-button-secondary focus-ring"
            type="button"
            onClick={() =>
              setVariants((current) => [...current, blankVariant()])
            }
            disabled={pending}
          >
            <Plus size={16} /> Add variant
          </button>
        </div>
        {errorFor(state, "variants") ? (
          <p className="mt-3 text-sm text-red-800">
            {errorFor(state, "variants")}
          </p>
        ) : null}
        <div className="mt-6 space-y-4">
          {variants.map((variant, index) => (
            <div
              className="grid gap-3 rounded-[var(--radius-md)] bg-[var(--surface-strong)] p-4 sm:grid-cols-2 lg:grid-cols-5"
              key={variant.id ?? `new-${index}`}
            >
              <label className="text-sm font-bold">
                Name
                <input
                  className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2"
                  value={variant.name}
                  onChange={(event) =>
                    updateVariant(index, "name", event.target.value)
                  }
                  disabled={pending}
                />
              </label>
              <label className="text-sm font-bold">
                SKU
                <input
                  className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2"
                  value={variant.sku}
                  onChange={(event) =>
                    updateVariant(index, "sku", event.target.value)
                  }
                  disabled={pending}
                />
              </label>
              <label className="text-sm font-bold">
                Price (kobo)
                <input
                  className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2"
                  min="0"
                  type="number"
                  value={variant.priceMinor}
                  onChange={(event) =>
                    updateVariant(
                      index,
                      "priceMinor",
                      Number(event.target.value),
                    )
                  }
                  disabled={pending}
                />
              </label>
              <label className="text-sm font-bold">
                Stock
                <input
                  className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2"
                  min="0"
                  type="number"
                  value={variant.stockQuantity}
                  onChange={(event) =>
                    updateVariant(
                      index,
                      "stockQuantity",
                      Number(event.target.value),
                    )
                  }
                  disabled={pending}
                />
              </label>
              <div className="flex items-end">
                <button
                  className="admin-button-danger admin-button-sm focus-ring"
                  type="button"
                  onClick={() =>
                    setVariants((current) =>
                      current.length > 1
                        ? current.filter(
                            (_, currentIndex) => currentIndex !== index,
                          )
                        : current,
                    )
                  }
                  disabled={pending || variants.length === 1}
                >
                  <Minus size={16} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      {state.message ? (
        <p
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}
      <button
        className="admin-button-primary admin-button-lg focus-ring"
        type="submit"
        disabled={pending}
      >
        <Save size={17} />{" "}
        {pending ? "Saving…" : product ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
