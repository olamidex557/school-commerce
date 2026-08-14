import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createProduct } from "@/app/admin/(protected)/catalogue-actions";
import { AdminProductForm } from "@/components/admin/admin-product-form";
import { getAdminCategories } from "@/lib/admin/catalogue";

export default async function NewProductPage() {
  const categories = await getAdminCategories();
  return <section className="mx-auto max-w-4xl px-5 py-10"><Link className="inline-flex items-center gap-2 text-sm font-bold" href="/admin/products"><ArrowLeft size={16} /> Products</Link><p className="mt-8 text-sm font-bold tracking-[0.16em] text-[#5b665f] uppercase">Catalogue</p><h1 className="mt-2 text-4xl font-black tracking-tight">Add product</h1><p className="mt-3 text-[#5b665f]">Enter real inventory details. The product becomes public only when it is active.</p>{categories.some((category) => !category.archived) ? <div className="mt-8"><AdminProductForm action={createProduct} categories={categories} /></div> : <div className="mt-8 rounded-3xl bg-white p-7"><h2 className="text-xl font-black">Create a category first</h2><p className="mt-2 text-[#5b665f]">Products must belong to an active category.</p><Link className="mt-5 inline-flex rounded-full bg-[#17211d] px-5 py-3 text-sm font-bold text-white" href="/admin/categories">Manage categories</Link></div>}</section>;
}
