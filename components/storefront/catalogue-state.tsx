import Link from "next/link";
import { PackageSearch, TriangleAlert } from "lucide-react";

export function CatalogueEmptyState({
  filtered = false,
}: Readonly<{ filtered?: boolean }>) {
  return (
    <section className="rounded-3xl border border-dashed border-black/20 bg-white px-6 py-16 text-center">
      <PackageSearch
        className="mx-auto text-[#5b665f]"
        size={36}
        aria-hidden="true"
      />
      <h2 className="mt-5 text-2xl font-black">
        {filtered
          ? "No products matched your search"
          : "No products are available yet"}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[#5b665f]">
        {filtered
          ? "Try a different search or clear your filters."
          : "Please check back soon for campus-ready accessories."}
      </p>
      {filtered ? (
        <Link
          className="mt-6 inline-flex rounded-full bg-[#17211d] px-5 py-3 text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-[#c7ff3d]"
          href="/shop"
        >
          Clear filters
        </Link>
      ) : null}
    </section>
  );
}

export function CatalogueErrorState() {
  return (
    <section className="rounded-3xl border border-red-200 bg-red-50 px-6 py-14 text-center">
      <TriangleAlert
        className="mx-auto text-red-800"
        size={36}
        aria-hidden="true"
      />
      <h2 className="mt-5 text-2xl font-black">
        We could not load the catalogue
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[#5b665f]">
        Please refresh the page or try again shortly.
      </p>
    </section>
  );
}
