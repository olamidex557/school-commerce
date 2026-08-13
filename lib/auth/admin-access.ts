export type AdminAccess =
  | { allowed: true; userId: string }
  | { allowed: false; redirectTo: "/admin/login" };

export function resolveAdminAccess(
  userId: string | undefined,
  isAdmin: boolean,
): AdminAccess {
  if (!userId) return { allowed: false, redirectTo: "/admin/login" };
  if (!isAdmin) return { allowed: false, redirectTo: "/admin/login" };
  return { allowed: true, userId };
}
