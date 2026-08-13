import { CheckCircle2, CircleX } from "lucide-react";
import { type Availability } from "@/lib/catalogue/types";

export function StockBadge({
  availability,
}: Readonly<{ availability: Availability }>) {
  const inStock = availability === "in-stock";
  return (
    <span
      className={
        inStock
          ? "inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800"
          : "inline-flex items-center gap-1.5 text-sm font-bold text-red-800"
      }
    >
      {inStock ? (
        <CheckCircle2 size={16} aria-hidden="true" />
      ) : (
        <CircleX size={16} aria-hidden="true" />
      )}
      {inStock ? "In stock" : "Out of stock"}
    </span>
  );
}
