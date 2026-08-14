import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { LockKeyhole, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-[var(--ink)] px-5 py-8">
      <div className="absolute top-[-8rem] left-[-7rem] h-72 w-72 rounded-full bg-[var(--brand)] opacity-30 blur-3xl" />
      <section className="relative grid w-full max-w-4xl overflow-hidden rounded-[var(--radius-xl)] border border-white/15 bg-[var(--surface)] shadow-[var(--shadow-lg)] md:grid-cols-[.85fr_1.15fr]">
        <aside className="hidden bg-[var(--highlight)] p-10 text-[var(--highlight-ink)] md:block"><Sparkles size={26} /><p className="font-display mt-16 text-5xl font-bold leading-none">Run the store with clarity.</p><p className="mt-6 leading-7">A focused workspace for the products students rely on.</p></aside>
        <div className="p-7 sm:p-10">
        <p className="text-kicker">Campus Accessories / Operations</p>
        <div className="mt-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-[var(--brand)] text-white"><LockKeyhole size={18} /></span><div><h1 className="font-display text-4xl font-bold">
          Admin sign in
        </h1><p className="text-sm text-[var(--muted)]">Protected workspace</p></div></div>
        <p className="mt-5 text-[var(--muted)]">
          Use an administrator account to access operations.
        </p>
        <AdminLoginForm />
        </div>
      </section>
    </main>
  );
}
