import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#e7ebe0] px-5">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl sm:p-10">
        <p className="text-sm font-bold tracking-[0.16em] text-[#5b665f] uppercase">
          Campus Accessories
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">
          Admin sign in
        </h1>
        <p className="mt-3 text-[#5b665f]">
          Use an administrator account to access operations.
        </p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
