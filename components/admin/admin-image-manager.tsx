"use client";

import Image from "next/image";
import { useActionState, useTransition } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import {
  deleteProductImage,
  uploadProductImage,
} from "@/app/admin/(protected)/catalogue-actions";
import { initialAdminCatalogueActionState } from "@/lib/admin/catalogue-state";

type ImageItem = { id: string; path: string; alt: string | null; position: number; url: string };

export function AdminImageManager({ productId, images }: Readonly<{ productId: string; images: ImageItem[] }>) {
  const [state, action, pending] = useActionState(uploadProductImage, initialAdminCatalogueActionState);
  const [deleting, startTransition] = useTransition();
  return <section className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7">
    <h2 className="text-xl font-black">Product images</h2>
    <p className="mt-1 text-sm text-[#5b665f]">Upload a JPG, PNG, or WebP image. The first image is used as the storefront primary image.</p>
    <form action={action} className="mt-5 grid gap-3 sm:grid-cols-3" noValidate>
      <input name="productId" type="hidden" value={productId} />
      <label className="text-sm font-bold">Image file<input className="mt-1 block w-full text-sm" name="image" type="file" accept="image/jpeg,image/png,image/webp" required disabled={pending} /></label>
      <label className="text-sm font-bold">Alt text (optional)<input className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2" name="altText" disabled={pending} /></label>
      <div className="flex items-end"><button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#17211d] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60" type="submit" disabled={pending}><ImagePlus size={16} /> {pending ? "Uploading…" : "Upload image"}</button></div>
      {state.message ? <p className="text-sm text-red-800 sm:col-span-3" role="alert">{state.message}</p> : null}
    </form>
    {images.length ? <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">{images.map((image, index) => <li className="overflow-hidden rounded-2xl border border-black/10" key={image.id}>
      <div className="relative aspect-square bg-[#e7ebe0]"><Image alt={image.alt || "Product image"} className="object-cover" fill sizes="(max-width: 640px) 50vw, 33vw" src={image.url} /></div>
      <div className="flex items-center justify-between gap-2 p-3"><span className="text-xs font-bold text-[var(--muted)]">{index === 0 ? "Primary" : `Image ${index + 1}`}</span><button className="focus-ring inline-flex items-center gap-1 rounded-md p-1 text-sm font-bold text-[var(--danger)]" type="button" disabled={deleting} onClick={() => startTransition(() => deleteProductImage(productId, image.id))}><Trash2 size={15} /> Remove</button></div>
    </li>)}</ul> : <p className="mt-6 rounded-2xl bg-[#f7f8f2] p-5 text-sm text-[#5b665f]">No images yet. Upload the first product photo above.</p>}
  </section>;
}
