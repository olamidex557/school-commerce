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
        className="mt-7 inline-flex rounded-full bg-[#17211d] px-5 py-3 text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-[#c7ff3d]"
        href="/shop"
      >
        Browse products
      </Link>
    </Container>
  );
}
