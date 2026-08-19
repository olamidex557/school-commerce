import { z } from "zod";
import {
  adminOrderTransitions,
  orderStatuses,
  paymentStatuses,
  type OrderStatus,
} from "@/lib/admin/order-transitions";

const uuid = z.string().uuid();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timestamp = z.string().datetime({ offset: true });

export const adminOrderQuerySchema = z.object({
  search: z.string().trim().max(80).optional(),
  payment: z.enum(paymentStatuses).optional(),
  status: z.enum(orderStatuses).optional(),
  from: date.optional(),
  to: date.optional(),
  sort: z.enum(["newest", "oldest"]).default("newest"),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
});

export type AdminOrderQuery = z.infer<typeof adminOrderQuerySchema>;

export const adminOrderStatusFormSchema = z
  .object({
    id: uuid,
    nextStatus: z.enum(orderStatuses),
    expectedUpdatedAt: timestamp,
  })
  .superRefine((value, context) => {
    // The current status is re-read and validated under a database row lock.
    // This rejects targets that could never be an operational admin action.
    if (!["confirmed", "completed", "cancelled"].includes(value.nextStatus))
      context.addIssue({
        code: "custom",
        path: ["nextStatus"],
        message: "Choose a valid operational status.",
      });
  });

export function parseAdminOrderQuery(
  params: Record<string, string | string[] | undefined>,
) {
  const value = (key: string) =>
    typeof params[key] === "string" ? params[key] : undefined;
  const parsed = adminOrderQuerySchema.safeParse({
    search: value("search") || undefined,
    payment: value("payment") || undefined,
    status: value("status") || undefined,
    from: value("from") || undefined,
    to: value("to") || undefined,
    sort: value("sort") || undefined,
    page: value("page") || undefined,
  });
  return parsed.success ? parsed.data : adminOrderQuerySchema.parse({});
}

export function parseAdminOrderStatusForm(formData: FormData) {
  return adminOrderStatusFormSchema.safeParse({
    id: formData.get("id"),
    nextStatus: formData.get("nextStatus"),
    expectedUpdatedAt: formData.get("expectedUpdatedAt"),
  });
}

export function potentialAdminTransition(status: OrderStatus) {
  return adminOrderTransitions(status);
}
