import { ButtonLink } from "@/components/ui/button-link";

export default function AdminHomePage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-kicker">Administration</p>
      <h1 className="font-display mt-3 text-5xl font-bold">
        Catalogue administration
      </h1>
      <p className="mt-4 max-w-xl leading-7 text-[var(--muted)]">
        Add the real products and categories that customers see in the
        storefront.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <ButtonLink admin href="/admin/products" size="lg">
          Manage products
        </ButtonLink>
        <ButtonLink admin href="/admin/categories" size="lg" variant="secondary">
          Manage categories
        </ButtonLink>
      </div>
    </section>
  );
}
