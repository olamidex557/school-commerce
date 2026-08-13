import "server-only";

import { redirect } from "next/navigation";
import { resolveAdminAccess } from "./admin-access";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: isAdmin } = user
    ? await supabase.rpc("is_admin")
    : { data: false };
  const access = resolveAdminAccess(user?.id, isAdmin === true);
  if (!access.allowed) redirect(access.redirectTo);
  return { supabase, user: user! };
}
