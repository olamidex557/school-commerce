export const orderStatuses = [
  "pending",
  "pending_payment",
  "paid",
  "confirmed",
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

const transitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
  paid: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
};

export function adminOrderTransitions(status: OrderStatus) {
  return transitions[status] ?? [];
}

export function canAdminTransition(from: OrderStatus, to: OrderStatus) {
  return adminOrderTransitions(from).includes(to);
}

export function orderStatusLabel(status: OrderStatus) {
  return {
    pending: "Pending",
    pending_payment: "Awaiting payment",
    paid: "Paid · awaiting operations",
    confirmed: "Processing / ready",
    completed: "Completed",
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
