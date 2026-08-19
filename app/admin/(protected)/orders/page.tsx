import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  orderStatusLabel,
  orderStatuses,
  paymentStatusLabel,
  paymentStatuses,
} from "@/lib/admin/order-transitions";
import { getAdminOrders } from "@/lib/admin/orders";
import { parseAdminOrderQuery } from "@/lib/validation/admin-orders";

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(value / 100);
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminOrdersPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const query = parseAdminOrderQuery(await searchParams);
  const { orders, page, pageSize, total } = await getAdminOrders(query);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageUrl = (nextPage: number) => {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.payment) params.set("payment", query.payment);
    if (query.status) params.set("status", query.status);
    if (query.from) params.set("from", query.from);
    if (query.to) params.set("to", query.to);
    if (query.sort !== "newest") params.set("sort", query.sort);
    params.set("page", String(nextPage));
    return `/admin/orders?${params.toString()}`;
  };

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div>
        <p className="text-kicker">Operations</p>
        <h1 className="font-display mt-2 text-5xl font-bold">Orders</h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          Review verified payments and progress paid orders through fulfilment.
          Payment information is read-only.
        </p>
      </div>

      <form className="surface-card mt-8 grid gap-3 p-4 md:grid-cols-3 lg:grid-cols-6">
        <label className="relative block md:col-span-2">
          <span className="sr-only">Search orders</span>
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--muted)]"
            size={17}
          />
          <input
            className="form-input mt-0 py-2 pr-3 pl-9"
            defaultValue={query.search}
            name="search"
            placeholder="Order, reference, customer"
          />
        </label>
        <select
          className="form-select mt-0 py-2"
          defaultValue={query.payment ?? ""}
          name="payment"
        >
          <option value="">All payment states</option>
          {paymentStatuses.map((status) => (
            <option key={status} value={status}>
              {paymentStatusLabel(status)}
            </option>
          ))}
        </select>
        <select
          className="form-select mt-0 py-2"
          defaultValue={query.status ?? ""}
          name="status"
        >
          <option value="">All operational states</option>
          {orderStatuses.map((status) => (
            <option key={status} value={status}>
              {orderStatusLabel(status)}
            </option>
          ))}
        </select>
        <label className="text-xs font-bold text-[var(--muted)]">
          From
          <input
            className="form-input mt-1 py-2"
            defaultValue={query.from}
            name="from"
            type="date"
          />
        </label>
        <label className="text-xs font-bold text-[var(--muted)]">
          To
          <input
            className="form-input mt-1 py-2"
            defaultValue={query.to}
            name="to"
            type="date"
          />
        </label>
        <select
          className="form-select mt-0 py-2"
          defaultValue={query.sort}
          name="sort"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        <button className="admin-button-secondary focus-ring" type="submit">
          Apply filters
        </button>
      </form>

      {orders.length ? (
        <>
          <div className="surface-card mt-6 overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[1.25fr_1fr_1fr_1fr_auto] gap-4 border-b border-[var(--line)] px-5 py-3 text-xs font-bold tracking-wide text-[var(--muted)] uppercase">
                <span>Order</span>
                <span>Customer / fulfilment</span>
                <span>Payment</span>
                <span>Operations</span>
                <span>Action</span>
              </div>
              {orders.map((order) => (
                <article
                  className="grid grid-cols-[1.25fr_1fr_1fr_1fr_auto] gap-4 border-b border-[var(--line)] px-5 py-4 last:border-0"
                  key={order.id}
                >
                  <div>
                    <p className="font-mono text-sm font-black">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {dateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold">{order.customerName}</p>
                    <p className="mt-1 text-[var(--muted)] capitalize">
                      {order.fulfillmentMethod}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold">
                      {paymentStatusLabel(order.paymentStatus)}
                    </p>
                    <p className="mt-1 text-[var(--muted)]">
                      {money(order.totalMinor, order.currency)}
                    </p>
                  </div>
                  <p className="text-sm font-bold">
                    {orderStatusLabel(order.status, order.fulfillmentMethod)}
                  </p>
                  <Link
                    className="admin-button-ghost admin-button-sm focus-ring"
                    href={`/admin/orders/${order.id}`}
                  >
                    View
                  </Link>
                </article>
              ))}
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4 text-sm">
            <p className="text-[var(--muted)]">
              {total} order{total === 1 ? "" : "s"} · Page {page} of{" "}
              {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  className="admin-button-ghost admin-button-sm focus-ring"
                  href={pageUrl(page - 1)}
                >
                  <ChevronLeft size={15} /> Previous
                </Link>
              ) : null}
              {page < totalPages ? (
                <Link
                  className="admin-button-ghost admin-button-sm focus-ring"
                  href={pageUrl(page + 1)}
                >
                  Next <ChevronRight size={15} />
                </Link>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <div className="surface-card mt-8 p-10 text-center">
          <h2 className="text-xl font-black">No matching orders</h2>
          <p className="mt-2 text-[var(--muted)]">
            {query.search ||
            query.payment ||
            query.status ||
            query.from ||
            query.to
              ? "Try clearing a filter or search term."
              : "Paid and pending-payment orders will appear here when customers check out."}
          </p>
        </div>
      )}
    </section>
  );
}
