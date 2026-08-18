import type { CheckoutDetails } from "@/lib/validation/checkout";

export type CheckoutReviewLine = {
  productId: string;
  variantId: string;
  quantity: number;
  productName: string;
  productSlug: string;
  variantName: string;
  unitPriceMinor: number;
  lineTotalMinor: number;
  stockQuantity: number;
  imageUrl: string | null;
};

export type CheckoutReview = {
  lines: CheckoutReviewLine[];
  issues: { productId: string; variantId: string; message: string }[];
  subtotalMinor: number;
  deliveryFeeMinor: number;
  totalMinor: number;
  details?: CheckoutDetails;
};

export type CheckoutActionState = {
  fieldErrors?: Record<string, string[]>;
  message?: string;
  review?: CheckoutReview;
};

export const initialCheckoutActionState: CheckoutActionState = {};
