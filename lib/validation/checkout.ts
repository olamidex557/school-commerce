import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(30),
  location: z.string().trim().min(2).max(200),
  fulfillmentMethod: z.enum(["delivery", "pickup"]),
  note: z.string().trim().max(500).optional(),
});
