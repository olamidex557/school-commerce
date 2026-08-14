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
          ? "status-in-stock inline-flex items-center gap-1.5 text-sm font-bold"
          : "status-out-of-stock inline-flex items-center gap-1.5 text-sm font-bold"
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
