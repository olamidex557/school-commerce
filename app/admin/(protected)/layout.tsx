import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import { requireAdmin } from "@/lib/auth/admin";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await requireAdmin();
  return (
    <main className="min-h-screen bg-[#f7f8f2]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-lg font-black">Campus Accessories</p>
            <p className="text-sm text-[#5b665f]">Admin access: {user.email}</p>
          </div>
          <AdminSignOutButton />
        </div>
      </header>
      {children}
    </main>
  );
}
