import { createBrowserClient } from "@supabase/ssr";
import { supabaseCookieOptions } from "./cookie-options";
import { getSupabasePublicEnv } from "./env";

export function createClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createBrowserClient(url, anonKey, {
    cookieOptions: supabaseCookieOptions,
  });
}
