import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./env";

export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Missing required server payment configuration.");
  const { url } = getSupabasePublicEnv();
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
