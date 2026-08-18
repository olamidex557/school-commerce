import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createProduct } from "@/app/admin/(protected)/catalogue-actions";
import { AdminProductForm } from "@/components/admin/admin-product-form";
import { getAdminCategories } from "@/lib/admin/catalogue";

export default async function NewProductPage() {
  const categories = await getAdminCategories();
  return (
    <section className="mx-auto max-w-4xl px-5 py-10">
      <Link
        className="admin-button-ghost admin-button-sm focus-ring"
        href="/admin/products"
      >
        <ArrowLeft size={16} /> Products
      </Link>
      <p className="text-kicker mt-8">Catalogue</p>
      <h1 className="font-display mt-2 text-5xl font-bold">Add product</h1>
      <p className="mt-3 text-[var(--muted)]">
        Enter real inventory details. The product becomes public only when it is
        active.
      </p>
      {categories.some((category) => !category.archived) ? (
        <div className="mt-8">
          <AdminProductForm action={createProduct} categories={categories} />
        </div>
      ) : (
        <div className="surface-card mt-8 p-7">
          <h2 className="text-xl font-black">Create a category first</h2>
          <p className="mt-2 text-[var(--muted)]">
            Products must belong to an active category.
          </p>
          <Link
            className="admin-button-primary admin-button-lg focus-ring mt-5"
            href="/admin/categories"
          >
            Manage categories
          </Link>
        </div>
      )}
    </section>
  );
}
