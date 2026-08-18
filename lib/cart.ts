import { z } from "zod";

export const CART_STORAGE_KEY = "campus-accessories.cart";
export const CART_VERSION = 1;
export const MAX_CART_QUANTITY = 20;

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(MAX_CART_QUANTITY),
});

export const cartSchema = z.object({
  version: z.literal(CART_VERSION),
  items: z.array(cartItemSchema).max(50),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type PersistedCart = z.infer<typeof cartSchema>;
export type CartLine = { quantity: number; unitPrice: number };

export function normalizeCartItems(items: unknown): CartItem[] {
  const parsed = z.array(cartItemSchema).max(50).safeParse(items);
  if (!parsed.success) return [];
  const merged = new Map<string, CartItem>();
  for (const item of parsed.data) {
    const key = `${item.productId}:${item.variantId}`;
    const previous = merged.get(key);
    merged.set(key, {
      ...item,
      quantity: Math.min(
        MAX_CART_QUANTITY,
        item.quantity + (previous?.quantity ?? 0),
      ),
    });
  }
  return [...merged.values()];
}

export function deserializeCart(value: string | null): PersistedCart {
  if (!value) return { version: CART_VERSION, items: [] };
  try {
    const parsed = cartSchema.safeParse(JSON.parse(value));
    return parsed.success
      ? { version: CART_VERSION, items: normalizeCartItems(parsed.data.items) }
      : { version: CART_VERSION, items: [] };
  } catch {
    return { version: CART_VERSION, items: [] };
  }
}

export function serializeCart(items: CartItem[]) {
  return JSON.stringify({
    version: CART_VERSION,
    items: normalizeCartItems(items),
  });
}

export function calculateCartSubtotal(lines: CartLine[]) {
  return lines.reduce(
    (total, line) => total + line.unitPrice * line.quantity,
    0,
  );
}

export function calculateCartTotal(
  lines: CartLine[],
  deliveryFee: number,
  fulfillmentMethod: "delivery" | "pickup",
) {
  return (
    calculateCartSubtotal(lines) +
    (fulfillmentMethod === "delivery" ? deliveryFee : 0)
  );
}
