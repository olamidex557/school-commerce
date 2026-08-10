export type CartLine = { quantity: number; unitPrice: number };
export function calculateCartSubtotal(lines: CartLine[]) {
  return lines.reduce(
    (total, line) => total + line.unitPrice * line.quantity,
    0,
  );
}
export function calculateCartTotal(
  lines: CartLine[],
  deliveryFee: number,
  fulfillmentMethod: "delivery" | "pickup",
) {
  return (
    calculateCartSubtotal(lines) +
    (fulfillmentMethod === "delivery" ? deliveryFee : 0)
  );
}
