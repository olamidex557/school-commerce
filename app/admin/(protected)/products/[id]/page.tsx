import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { updateProduct } from "@/app/admin/(protected)/catalogue-actions";
import { AdminImageManager } from "@/components/admin/admin-image-manager";
import { AdminProductForm } from "@/components/admin/admin-product-form";
import { getAdminCategories, getAdminProduct } from "@/lib/admin/catalogue";
import { productImagePublicUrl } from "@/lib/admin/product-images";

export default async function EditProductPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
  ]);
  if (!product) notFound();
  const images = await Promise.all(
    product.images.map(async (image) => ({
      ...image,
      url: await productImagePublicUrl(image.path),
    })),
  );
  return (
    <section className="mx-auto max-w-4xl px-5 py-10">
      <Link
        className="admin-button-ghost admin-button-sm focus-ring"
        href="/admin/products"
      >
        <ArrowLeft size={16} /> Products
      </Link>
      <p className="text-kicker mt-8">Catalogue</p>
      <h1 className="font-display mt-2 text-5xl font-bold">Edit product</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[var(--muted)]">
        <span>{product.name}</span>
        <Link
          className="admin-button-ghost admin-button-sm focus-ring"
          href={`/shop/${product.slug}`}
          target="_blank"
        >
          <ExternalLink size={15} /> View storefront page
        </Link>
      </div>
      <div className="mt-8">
        <AdminProductForm
          action={updateProduct}
          categories={categories}
          product={product}
        />
      </div>
      <div className="mt-8">
        <AdminImageManager images={images} productId={product.id} />
      </div>
    </section>
  );
}
