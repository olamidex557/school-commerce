import "server-only";

import { createClient } from "@/lib/supabase/server";

export const productImagesBucket =
  process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images";

export async function productImagePublicUrl(path: string) {
  const supabase = await createClient();
  return supabase.storage.from(productImagesBucket).getPublicUrl(path).data
    .publicUrl;
}
