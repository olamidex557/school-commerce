import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { updateOrderOperationalStatus } from "@/app/admin/(protected)/order-actions";
import { AdminOrderStatusForm } from "@/components/admin/admin-order-status-form";
import {
  adminOrderTransitions,
  orderStatusLabel,
  paymentStatusLabel,
} from "@/lib/admin/order-transitions";
import { getAdminOrder } from "@/lib/admin/orders";

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(value / 100);
}

function dateTime(value: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminOrderDetailPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const order = await getAdminOrder(id);
  if (!order) notFound();
  const transitions = adminOrderTransitions(
    order.status,
    order.fulfillmentMethod,
  );

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <Link
        className="admin-button-ghost admin-button-sm focus-ring"
        href="/admin/orders"
      >
        <ArrowLeft size={16} /> Orders
      </Link>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-kicker">Order operations</p>
          <h1 className="font-display mt-2 text-4xl font-bold sm:text-5xl">
            {order.orderNumber}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Created {dateTime(order.createdAt)}
          </p>
        </div>
        <div className="rounded-xl bg-[var(--surface-strong)] px-4 py-3 text-sm">
          <p className="font-bold">
            {orderStatusLabel(order.status, order.fulfillmentMethod)}
          </p>
          <p className="mt-1 text-[var(--muted)]">
            Payment: {paymentStatusLabel(order.paymentStatus)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.45fr_.9fr]">
        <div className="space-y-6">
          <section className="surface-card p-5 sm:p-7">
            <h2 className="text-xl font-black">Items</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b border-[var(--line)] text-xs tracking-wide text-[var(--muted)] uppercase">
                  <tr>
                    <th className="pb-3">Item</th>
                    <th className="pb-3">SKU</th>
                    <th className="pb-3">Unit price</th>
                    <th className="pb-3">Qty</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr
                      className="border-b border-[var(--line)] last:border-0"
                      key={item.id}
                    >
                      <td className="py-4 font-bold">
                        {item.productName}
                        <span className="block text-xs font-normal text-[var(--muted)]">
                          {item.variantName}
                        </span>
                      </td>
                      <td className="py-4 font-mono text-xs">{item.sku}</td>
                      <td className="py-4">
                        {money(item.unitPriceMinor, order.currency)}
                      </td>
                      <td className="py-4">{item.quantity}</td>
                      <td className="py-4 text-right font-bold">
                        {money(item.lineTotalMinor, order.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="mt-5 ml-auto grid max-w-xs gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">Subtotal</dt>
                <dd>{money(order.subtotalMinor, order.currency)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">Delivery</dt>
                <dd>{money(order.deliveryFeeMinor, order.currency)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-[var(--line)] pt-2 text-base font-black">
                <dt>Total</dt>
                <dd>{money(order.totalMinor, order.currency)}</dd>
              </div>
            </dl>
          </section>

          <section className="surface-card p-5 sm:p-7">
            <h2 className="text-xl font-black">Customer and fulfilment</h2>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold tracking-wide text-[var(--muted)] uppercase">
                  Customer
                </dt>
                <dd className="mt-1 font-bold">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold tracking-wide text-[var(--muted)] uppercase">
                  Phone
                </dt>
                <dd className="mt-1">{order.customerPhone}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold tracking-wide text-[var(--muted)] uppercase">
                  Email
                </dt>
                <dd className="mt-1">
                  {order.customerEmail ?? "Not supplied"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold tracking-wide text-[var(--muted)] uppercase">
                  Method
                </dt>
                <dd className="mt-1 capitalize">{order.fulfillmentMethod}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold tracking-wide text-[var(--muted)] uppercase">
                  Campus location
                </dt>
                <dd className="mt-1">{order.location}</dd>
              </div>
              {order.note ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold tracking-wide text-[var(--muted)] uppercase">
                    Customer note
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap">{order.note}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="surface-card p-5 sm:p-7">
            <h2 className="text-xl font-black">Operational history</h2>
            {order.statusEvents.length ? (
              <ol className="mt-5 space-y-4 text-sm">
                {order.statusEvents.map((event) => (
                  <li
                    className="border-l-2 border-[var(--brand)] pl-4"
                    key={event.id}
                  >
                    <p className="font-bold">
                      {orderStatusLabel(
                        event.fromStatus,
                        order.fulfillmentMethod,
                      )}{" "}
                      →{" "}
                      {orderStatusLabel(
                        event.toStatus,
                        order.fulfillmentMethod,
                      )}
                    </p>
                    <p className="mt-1 text-[var(--muted)]">
                      {dateTime(event.changedAt)} · Admin record{" "}
                      {event.changedBy}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted)]">
                No operational status changes have been recorded.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="surface-card p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 text-[var(--brand)]" size={21} />
              <div>
                <h2 className="text-xl font-black">Fulfilment status</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Only validated {order.fulfillmentMethod} transitions are
                  available. This never changes payment or stock.
                </p>
              </div>
            </div>
            <AdminOrderStatusForm
              action={updateOrderOperationalStatus}
              orderId={order.id}
              transitions={transitions}
              updatedAt={order.updatedAt}
            />
          </section>

          {order.fulfillmentMethod === "pickup" ? (
            <section className="surface-card p-5 sm:p-7">
              <h2 className="text-xl font-black">Pickup instructions</h2>
              <p className="mt-3 text-sm whitespace-pre-wrap text-[var(--muted)]">
                {order.pickupInformation ??
                  "Pickup instructions have not been configured."}
              </p>
            </section>
          ) : null}

          <section className="surface-card p-5 sm:p-7">
            <h2 className="text-xl font-black">Payment record</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[var(--muted)]">Order payment state</dt>
                <dd className="mt-1 font-bold">
                  {paymentStatusLabel(order.paymentStatus)}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Verified at</dt>
                <dd className="mt-1">{dateTime(order.paymentVerifiedAt)}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Reference</dt>
                <dd className="mt-1 font-mono text-xs break-all">
                  {order.paymentReference ?? "Not assigned"}
                </dd>
              </div>
            </dl>
            <div className="mt-5 space-y-4 border-t border-[var(--line)] pt-5">
              {order.paymentAttempts.map((attempt) => (
                <div className="text-sm" key={attempt.id}>
                  <p className="font-bold capitalize">{attempt.status}</p>
                  <p className="mt-1 font-mono text-xs break-all text-[var(--muted)]">
                    {attempt.reference}
                  </p>
                  <p className="mt-1 text-[var(--muted)]">
                    {money(attempt.amountMinor, attempt.currency)} ·{" "}
                    {dateTime(attempt.paidAt ?? attempt.initializedAt)}
                  </p>
                  {attempt.transactionId ? (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Transaction ID: {attempt.transactionId}
                    </p>
                  ) : null}
                </div>
              ))}
              {!order.paymentAttempts.length ? (
                <p className="text-sm text-[var(--muted)]">
                  No payment attempt is available.
                </p>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
