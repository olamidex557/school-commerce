import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .transform((value) => {
    const compact = value.replace(/[\s().-]/g, "");
    if (compact.startsWith("234")) return `+${compact}`;
    return compact;
  })
  .refine(
    (value) => /^(?:\+234|0)[7-9]\d{9}$/.test(value),
    "Enter a valid Nigerian mobile number.",
  );

export const checkoutSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name.").max(120),
    email: z.string().trim().email("Enter a valid email address.").max(254),
    phone: phoneSchema,
    location: z.string().trim().max(200),
    fulfillmentMethod: z.enum(["delivery", "pickup"]),
    note: z.string().trim().max(500).optional(),
  })
  .superRefine((value, context) => {
    if (value.fulfillmentMethod === "delivery" && value.location.length < 2) {
      context.addIssue({
        code: "custom",
        path: ["location"],
        message: "Enter your campus delivery location.",
      });
    }
  });

export type CheckoutDetails = z.infer<typeof checkoutSchema>;
