import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { updateProduct } from "@/app/admin/(protected)/catalogue-actions";
import { AdminImageManager } from "@/components/admin/admin-image-manager";
import { AdminProductForm } from "@/components/admin/admin-product-form";
import { getAdminCategories, getAdminProduct } from "@/lib/admin/catalogue";
import { productImagePublicUrl } from "@/lib/admin/product-images";

export default async function EditProductPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [product, categories] = await Promise.all([getAdminProduct(id), getAdminCategories()]);
  if (!product) notFound();
  const images = await Promise.all(product.images.map(async (image) => ({ ...image, url: await productImagePublicUrl(image.path) })));
  return <section className="mx-auto max-w-4xl px-5 py-10"><Link className="inline-flex items-center gap-2 text-sm font-bold" href="/admin/products"><ArrowLeft size={16} /> Products</Link><p className="mt-8 text-sm font-bold tracking-[0.16em] text-[#5b665f] uppercase">Catalogue</p><h1 className="mt-2 text-4xl font-black tracking-tight">Edit product</h1><p className="mt-3 text-[#5b665f]">{product.name} · <Link className="underline" href={`/shop/${product.slug}`} target="_blank">View storefront page</Link></p><div className="mt-8"><AdminProductForm action={updateProduct} categories={categories} product={product} /></div><div className="mt-8"><AdminImageManager images={images} productId={product.id} /></div></section>;
}
