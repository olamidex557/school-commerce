export const orderStatuses = [
  "pending",
  "pending_payment",
  "paid",
  "confirmed",
  "out_for_delivery",
  "completed",
  "cancelled",
] as const;

export const paymentStatuses = [
  "unpaid",
  "pending",
  "initialized",
  "paid",
  "success",
  "failed",
  "abandoned",
  "reversed",
  "refunded",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];
export type PaymentStatus = (typeof paymentStatuses)[number];
export type FulfillmentMethod = "delivery" | "pickup";

const pickupTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
  paid: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
};
const deliveryTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
  paid: ["confirmed", "cancelled"],
  confirmed: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["completed", "cancelled"],
};

export function adminOrderTransitions(
  status: OrderStatus,
  fulfillmentMethod: FulfillmentMethod,
) {
  const transitions =
    fulfillmentMethod === "pickup" ? pickupTransitions : deliveryTransitions;
  return transitions[status] ?? [];
}

export function canAdminTransition(
  from: OrderStatus,
  to: OrderStatus,
  fulfillmentMethod: FulfillmentMethod,
) {
  return adminOrderTransitions(from, fulfillmentMethod).includes(to);
}

export function orderStatusLabel(
  status: OrderStatus,
  fulfillmentMethod?: FulfillmentMethod,
) {
  return {
    pending: "Pending",
    pending_payment: "Awaiting payment",
    paid: "Paid · awaiting operations",
    confirmed:
      fulfillmentMethod === "pickup"
        ? "Ready for pickup"
        : fulfillmentMethod === "delivery"
          ? "Preparing delivery"
          : "Processing / ready",
    out_for_delivery: "Out for delivery",
    completed:
      fulfillmentMethod === "pickup"
        ? "Collected"
        : fulfillmentMethod === "delivery"
          ? "Delivered"
          : "Completed",
    cancelled: "Cancelled",
  }[status];
}

export function paymentStatusLabel(status: PaymentStatus) {
  return {
    unpaid: "Unpaid",
    pending: "Pending",
    initialized: "Payment started",
    paid: "Paid",
    success: "Verified paid",
    failed: "Failed",
    abandoned: "Abandoned",
    reversed: "Reversed",
    refunded: "Refunded",
  }[status];
}
