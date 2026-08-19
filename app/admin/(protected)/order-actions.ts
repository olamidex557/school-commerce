"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import {
  initialAdminOrderActionState,
  type AdminOrderActionState,
} from "@/lib/admin/order-state";
import { parseAdminOrderStatusForm } from "@/lib/validation/admin-orders";

function failure(message: string): AdminOrderActionState {
  return { message };
}

export async function updateOrderOperationalStatus(
  _previous: AdminOrderActionState,
  formData: FormData,
): Promise<AdminOrderActionState> {
  const parsed = parseAdminOrderStatusForm(formData);
  if (!parsed.success) return failure("Choose a valid order status update.");

  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("admin_update_order_status", {
    p_order_id: parsed.data.id,
    p_next_status: parsed.data.nextStatus,
    p_expected_updated_at: parsed.data.expectedUpdatedAt,
  });
  if (error) {
    if (error.message === "admin_order_stale")
      return failure(
        "This order changed elsewhere. Reload it before updating.",
      );
    if (error.message === "admin_order_invalid_transition")
      return failure("That operational transition is no longer available.");
    return failure("We could not update this order. Please try again.");
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.data.id}`);
  return { ...initialAdminOrderActionState, success: true };
}
