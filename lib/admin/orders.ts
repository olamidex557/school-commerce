import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import type { OrderStatus, PaymentStatus } from "@/lib/admin/order-transitions";
import type { AdminOrderQuery } from "@/lib/validation/admin-orders";

const pageSize = 25;

export type AdminOrderSummary = {
  id: string;
  orderNumber: string;
  customerName: string;
  fulfillmentMethod: "delivery" | "pickup";
  totalMinor: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

export type AdminOrderDetail = AdminOrderSummary & {
  subtotalMinor: number;
  deliveryFeeMinor: number;
  location: string;
  customerPhone: string;
  customerEmail: string | null;
  note: string | null;
  pickupInformation: string | null;
  paymentReference: string | null;
  paymentVerifiedAt: string | null;
  updatedAt: string;
  items: Array<{
    id: string;
    productName: string;
    variantName: string;
    sku: string;
    unitPriceMinor: number;
    quantity: number;
    lineTotalMinor: number;
  }>;
  paymentAttempts: Array<{
    id: string;
    reference: string;
    transactionId: string | null;
    amountMinor: number;
    currency: string;
    status: string;
    initializedAt: string | null;
    paidAt: string | null;
    channel: string | null;
  }>;
  statusEvents: Array<{
    id: string;
    fromStatus: OrderStatus;
    toStatus: OrderStatus;
    changedBy: string;
    changedAt: string;
  }>;
};

type OrderSummaryRow = {
  id: string;
  order_number: string;
  customer_name_snapshot: string;
  fulfillment_method: "delivery" | "pickup";
  total_minor: number;
  currency: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
};

type OrderDetailRow = OrderSummaryRow & {
  subtotal_minor: number;
  delivery_fee_minor: number;
  location_snapshot: string;
  customer_phone_snapshot: string;
  customer_email_snapshot: string | null;
  note: string | null;
  payment_reference: string | null;
  payment_verified_at: string | null;
  updated_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    variant_name: string;
    sku: string;
    unit_price_minor: number;
    quantity: number;
    line_total_minor: number;
  }> | null;
  payment_attempts: Array<{
    id: string;
    paystack_reference: string;
    paystack_transaction_id: string | number | null;
    amount_minor: number;
    currency: string;
    status: string;
    initialized_at: string | null;
    paid_at: string | null;
    provider_channel: string | null;
  }> | null;
  order_status_events: Array<{
    id: string;
    from_status: OrderStatus;
    to_status: OrderStatus;
    changed_by: string;
    changed_at: string;
  }> | null;
};

function mapSummary(row: OrderSummaryRow): AdminOrderSummary {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name_snapshot,
    fulfillmentMethod: row.fulfillment_method,
    totalMinor: row.total_minor,
    currency: row.currency,
    status: row.status,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
  };
}

function safeSearch(value: string) {
  // PostgREST's `or` expression uses commas and parentheses structurally.
  // Remove those control characters before putting a bounded user term in it.
  return value.replace(/[(),%_]/g, "").trim();
}

function nextDay(value: string) {
  const day = new Date(`${value}T00:00:00.000Z`);
  day.setUTCDate(day.getUTCDate() + 1);
  return day.toISOString();
}

export async function getAdminOrders(query: AdminOrderQuery) {
  const { supabase } = await requireAdmin();
  let request = supabase
    .from("orders")
    .select(
      "id,order_number,customer_name_snapshot,fulfillment_method,total_minor,currency,status,payment_status,created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: query.sort === "oldest" });
  const search = query.search ? safeSearch(query.search) : "";
  if (search) {
    const term = `%${search}%`;
    request = request.or(
      [
        `order_number.ilike.${term}`,
        `payment_reference.ilike.${term}`,
        `customer_name_snapshot.ilike.${term}`,
        `customer_email_snapshot.ilike.${term}`,
        `customer_phone_snapshot.ilike.${term}`,
      ].join(","),
    );
  }
  if (query.payment) request = request.eq("payment_status", query.payment);
  if (query.status) request = request.eq("status", query.status);
  if (query.from)
    request = request.gte("created_at", `${query.from}T00:00:00.000Z`);
  if (query.to) request = request.lt("created_at", nextDay(query.to));
  const start = (query.page - 1) * pageSize;
  const { data, error, count } = await request.range(
    start,
    start + pageSize - 1,
  );
  if (error) throw new Error("Unable to load orders.");
  return {
    orders: (data as OrderSummaryRow[]).map(mapSummary),
    page: query.page,
    pageSize,
    total: count ?? 0,
  };
}

export async function getAdminOrder(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,order_number,customer_name_snapshot,fulfillment_method,total_minor,currency,status,payment_status,created_at,subtotal_minor,delivery_fee_minor,location_snapshot,customer_phone_snapshot,customer_email_snapshot,note,payment_reference,payment_verified_at,updated_at,order_items(id,product_name,variant_name,sku,unit_price_minor,quantity,line_total_minor),payment_attempts(id,paystack_reference,paystack_transaction_id,amount_minor,currency,status,initialized_at,paid_at,provider_channel),order_status_events(id,from_status,to_status,changed_by,changed_at)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Unable to load order.");
  if (!data) return null;
  const row = data as OrderDetailRow;
  const { data: settings } =
    row.fulfillment_method === "pickup"
      ? await supabase
          .from("settings")
          .select("pickup_information")
          .eq("id", true)
          .maybeSingle()
      : { data: null };
  return {
    ...mapSummary(row),
    subtotalMinor: row.subtotal_minor,
    deliveryFeeMinor: row.delivery_fee_minor,
    location: row.location_snapshot,
    customerPhone: row.customer_phone_snapshot,
    customerEmail: row.customer_email_snapshot,
    note: row.note,
    pickupInformation: settings?.pickup_information?.trim() || null,
    paymentReference: row.payment_reference,
    paymentVerifiedAt: row.payment_verified_at,
    updatedAt: row.updated_at,
    items: (row.order_items ?? []).map((item) => ({
      id: item.id,
      productName: item.product_name,
      variantName: item.variant_name,
      sku: item.sku,
      unitPriceMinor: item.unit_price_minor,
      quantity: item.quantity,
      lineTotalMinor: item.line_total_minor,
    })),
    paymentAttempts: (row.payment_attempts ?? [])
      .map((attempt) => ({
        id: attempt.id,
        reference: attempt.paystack_reference,
        transactionId:
          attempt.paystack_transaction_id === null
            ? null
            : String(attempt.paystack_transaction_id),
        amountMinor: attempt.amount_minor,
        currency: attempt.currency,
        status: attempt.status,
        initializedAt: attempt.initialized_at,
        paidAt: attempt.paid_at,
        channel: attempt.provider_channel,
      }))
      .sort((left, right) =>
        (right.initializedAt ?? "").localeCompare(left.initializedAt ?? ""),
      ),
    statusEvents: (row.order_status_events ?? [])
      .map((event) => ({
        id: event.id,
        fromStatus: event.from_status,
        toStatus: event.to_status,
        changedBy: event.changed_by,
        changedAt: event.changed_at,
      }))
      .sort((left, right) => right.changedAt.localeCompare(left.changedAt)),
  } satisfies AdminOrderDetail;
}
