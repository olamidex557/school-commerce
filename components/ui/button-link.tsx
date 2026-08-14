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
        "focus-ring inline-flex items-center gap-2",
        variant === "primary"
          ? "button-primary"
          : "button-secondary",
      )}
    >
      {children}
    </Link>
  );
}
