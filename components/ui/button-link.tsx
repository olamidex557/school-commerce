import Link from "next/link";
import { clsx } from "clsx";

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: Readonly<{
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}>) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition",
        variant === "primary"
          ? "bg-[#c7ff3d] text-[#17211d] hover:bg-[#dcff77]"
          : "border border-white/30 text-white hover:bg-white/10",
      )}
    >
      {children}
    </Link>
  );
}
