"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import {
  initialAdminOrderActionState,
  type AdminOrderActionState,
} from "@/lib/admin/order-state";
import {
  orderStatusLabel,
  type OrderStatus,
} from "@/lib/admin/order-transitions";

type OrderStatusAction = (
  state: AdminOrderActionState,
  data: FormData,
) => Promise<AdminOrderActionState>;

export function AdminOrderStatusForm({
  orderId,
  updatedAt,
  transitions,
  action,
}: Readonly<{
  orderId: string;
  updatedAt: string;
  transitions: OrderStatus[];
  action: OrderStatusAction;
}>) {
  const [state, formAction, pending] = useActionState(
    action,
    initialAdminOrderActionState,
  );
  if (!transitions.length)
    return (
      <p className="mt-3 text-sm text-[var(--muted)]">
        No further operational transition is available. Payment status remains
        read-only.
      </p>
    );

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input name="id" type="hidden" value={orderId} />
      <input name="expectedUpdatedAt" type="hidden" value={updatedAt} />
      <label className="block text-sm font-bold">
        Next operational status
        <select
          className="form-select"
          defaultValue=""
          disabled={pending}
          name="nextStatus"
          required
        >
          <option disabled value="">
            Choose a status
          </option>
          {transitions.map((status) => (
            <option key={status} value={status}>
              {orderStatusLabel(status)}
            </option>
          ))}
        </select>
      </label>
      {state.message ? (
        <p
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}
      {state.success ? (
        <p
          className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-900"
          role="status"
        >
          Operational status updated.
        </p>
      ) : null}
      <button
        className="admin-button-primary admin-button-sm focus-ring"
        disabled={pending}
        type="submit"
      >
        <Save size={15} /> {pending ? "Updating…" : "Update status"}
      </button>
    </form>
  );
}
