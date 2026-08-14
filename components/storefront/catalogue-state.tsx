import Link from "next/link";
import { PackageSearch, TriangleAlert } from "lucide-react";

export function CatalogueEmptyState({
  filtered = false,
}: Readonly<{ filtered?: boolean }>) {
  return (
    <section className="surface-card border-dashed px-6 py-16 text-center">
      <PackageSearch
        className="mx-auto text-[var(--muted)]"
        size={36}
        aria-hidden="true"
      />
      <h2 className="font-display mt-5 text-3xl font-bold">
        {filtered
          ? "No products matched your search"
          : "No products are available yet"}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[var(--muted)]">
        {filtered
          ? "Try a different search or clear your filters."
          : "Please check back soon for campus-ready accessories."}
      </p>
      {filtered ? (
        <Link
          className="button-primary focus-ring mt-6"
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
    <section className="alert-error px-6 py-14 text-center">
      <TriangleAlert
        className="mx-auto text-[var(--danger)]"
        size={36}
        aria-hidden="true"
      />
      <h2 className="font-display mt-5 text-3xl font-bold">
        We could not load the catalogue
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[var(--muted)]">
        Please refresh the page or try again shortly.
      </p>
    </section>
  );
}
