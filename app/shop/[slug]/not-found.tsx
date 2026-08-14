import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function ProductNotFound() {
  return (
    <Container className="py-20 text-center">
      <h1 className="text-4xl font-black">Product not found</h1>
      <p className="mt-4 text-[#5b665f]">
        This product may be unavailable or no longer listed.
      </p>
      <Link
        className="button-primary focus-ring mt-7"
        href="/shop"
      >
        Browse products
      </Link>
    </Container>
  );
}
