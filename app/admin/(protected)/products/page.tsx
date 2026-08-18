import Link from "next/link";
import { Archive, ArchiveRestore, Pencil, Plus, Search } from "lucide-react";
import { toggleProductArchive } from "@/app/admin/(protected)/catalogue-actions";
import {
  getAdminCategories,
  getAdminLowStockThreshold,
  getAdminProducts,
} from "@/lib/admin/catalogue";
import { productImagePublicUrl } from "@/lib/admin/product-images";
import { ProductImage } from "@/components/storefront/product-image";

function price(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(value / 100);
}

export default async function AdminProductsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const params = await searchParams;
  const search =
    typeof params.search === "string"
      ? params.search.trim().slice(0, 80)
      : undefined;
  const category =
    typeof params.category === "string" &&
    /^[0-9a-f-]{36}$/i.test(params.category)
      ? params.category
      : undefined;
  const status =
    params.status === "active" || params.status === "archived"
      ? params.status
      : undefined;
  const [rawProducts, categories, lowStockThreshold] = await Promise.all([
    getAdminProducts({ search, category, status }),
    getAdminCategories(),
    getAdminLowStockThreshold(),
  ]);
  const products = await Promise.all(
    rawProducts.map(async (product) => ({
      ...product,
      primaryImageUrl: product.images[0]
        ? await productImagePublicUrl(product.images[0].path)
        : null,
    })),
  );

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-kicker">Catalogue</p>
          <h1 className="font-display mt-2 text-5xl font-bold">Products</h1>
        </div>
        <Link
          className="admin-button-primary admin-button-lg focus-ring"
          href="/admin/products/new"
        >
          <Plus size={17} /> Add product
        </Link>
      </div>
      <form className="surface-card mt-8 grid gap-3 p-4 md:grid-cols-4">
        <label className="relative block">
          <span className="sr-only">Search products</span>
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--muted)]"
            size={17}
          />
          <input
            className="form-input mt-0 py-2 pr-3 pl-9"
            defaultValue={search}
            name="search"
            placeholder="Search products"
          />
        </label>
        <select
          className="form-select mt-0 py-2"
          defaultValue={category || ""}
          name="category"
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          className="form-select mt-0 py-2"
          defaultValue={status || ""}
          name="status"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <button className="admin-button-secondary focus-ring" type="submit">
          Apply filters
        </button>
      </form>
      {products.length ? (
        <div className="surface-card mt-6 overflow-hidden">
          <div className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_auto] gap-4 border-b border-[var(--line)] px-5 py-3 text-xs font-bold tracking-wide text-[var(--muted)] uppercase">
            <span>Product</span>
            <span>Price / stock</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {products.map((product) => {
            const active = product.variants.filter((variant) => variant.active);
            const lowest = active.length
              ? Math.min(...active.map((variant) => variant.priceMinor))
              : 0;
            const stock = active.reduce(
              (total, variant) => total + variant.stockQuantity,
              0,
            );
            const stockState =
              stock === 0
                ? "Out of stock"
                : stock <= lowStockThreshold
                  ? "Low stock"
                  : "In stock";
            return (
              <article
                className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_auto] gap-4 border-b border-[var(--line)] px-5 py-4 last:border-0"
                key={product.id}
              >
                <div className="flex min-w-0 gap-3">
                  <div className="w-14 shrink-0">
                    <ProductImage
                      alt={product.name}
                      src={product.primaryImageUrl}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-black">{product.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {product.categoryName} · {product.variants.length} variant
                      {product.variants.length === 1 ? "" : "s"}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Updated{" "}
                      {new Intl.DateTimeFormat("en-NG", {
                        dateStyle: "medium",
                      }).format(new Date(product.updatedAt))}
                    </p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-bold">{price(lowest)}</p>
                  <p className="mt-1 text-[var(--muted)]">
                    {stock} units · {stockState}
                  </p>
                </div>
                <span className="text-sm font-bold">
                  {product.archived ? "Archived" : "Active"}
                  {product.featured ? " · Featured" : ""}
                </span>
                <div className="flex flex-col items-start gap-1">
                  <Link
                    className="admin-button-ghost admin-button-sm focus-ring"
                    href={`/admin/products/${product.id}`}
                  >
                    <Pencil size={14} /> Edit
                  </Link>
                  <form
                    action={toggleProductArchive.bind(
                      null,
                      product.id,
                      !product.archived,
                    )}
                  >
                    <button
                      className="admin-button-ghost admin-button-sm focus-ring"
                      type="submit"
                    >
                      {product.archived ? (
                        <ArchiveRestore size={14} />
                      ) : (
                        <Archive size={14} />
                      )}
                      {product.archived ? "Restore" : "Archive"}
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="surface-card mt-8 p-10 text-center">
          <h2 className="text-xl font-black">No products yet</h2>
          <p className="mt-2 text-[var(--muted)]">
            Create the first real product when its details are ready.
          </p>
          <Link
            className="admin-button-primary admin-button-lg focus-ring mt-5"
            href="/admin/products/new"
          >
            <Plus size={17} /> Add product
          </Link>
        </div>
      )}
    </section>
  );
}
