import Link from "next/link";
import { clsx } from "clsx";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  admin = false,
}: Readonly<{
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  admin?: boolean;
}>) {
  return (
    <Link
      href={href}
      className={clsx(
        "focus-ring",
        admin
          ? variant === "primary"
            ? "admin-button-primary"
            : variant === "secondary"
              ? "admin-button-secondary"
              : "admin-button-ghost"
          : variant === "primary"
            ? "button-primary"
            : "button-secondary",
        admin && size === "lg" && "admin-button-lg",
        admin && size === "sm" && "admin-button-sm",
      )}
    >
      {children}
    </Link>
  );
}
