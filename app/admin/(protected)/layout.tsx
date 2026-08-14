import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import { requireAdmin } from "@/lib/auth/admin";
import Link from "next/link";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await requireAdmin();
  return (
    <main className="min-h-screen bg-[var(--canvas)]">
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[color:var(--surface)]/94 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[.75rem] bg-[var(--ink)] text-xs font-black text-[var(--highlight)]">CA</span><div className="min-w-0">
            <p className="font-display text-xl font-bold">Campus Accessories</p>
            <p className="truncate text-xs text-[var(--muted)]">Admin access: {user.email}</p>
          </div></div>
          <div className="flex items-center gap-3">
            <nav aria-label="Admin navigation" className="hidden gap-1 text-sm font-bold sm:flex">
              <Link className="button-quiet focus-ring" href="/admin/products">Products</Link>
              <Link className="button-quiet focus-ring" href="/admin/categories">Categories</Link>
            </nav>
            <AdminSignOutButton />
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}
