import Link from "next/link";
import { Search } from "lucide-react";
import { buildShopHref, type ShopQuery } from "@/lib/catalogue/query";
import { type CatalogueCategory } from "@/lib/catalogue/types";

export function CatalogueFilters({
  categories,
  query,
}: Readonly<{ categories: CatalogueCategory[]; query: ShopQuery }>) {
  return (
    <form
      action="/shop"
      className="surface-card grid gap-2.5 p-3 sm:p-4 md:grid-cols-[1.5fr_1fr_1fr_auto]"
    >
      <label className="relative">
        <span className="sr-only">Search products</span>
        <Search
          className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--muted)]"
          size={18}
          aria-hidden="true"
        />
        <input
          className="form-input mt-0 py-2.5 pr-3 pl-10 text-sm"
          name="search"
          defaultValue={query.search}
          placeholder="Search accessories"
        />
      </label>
      <label>
        <span className="sr-only">Filter by category</span>
        <select
          className="form-select mt-0 py-2.5 text-sm"
          name="category"
          defaultValue={query.category ?? ""}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">Sort products</span>
        <select
          className="form-select mt-0 py-2.5 text-sm"
          name="sort"
          defaultValue={query.sort}
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name">Name</option>
        </select>
      </label>
      <div className="flex gap-2">
        <button className="button-primary focus-ring flex-1" type="submit">
          Apply
        </button>
        {query.category || query.search || query.sort !== "featured" ? (
          <Link
            className="button-secondary focus-ring"
            href={buildShopHref({ sort: "featured" })}
          >
            Reset
          </Link>
        ) : null}
      </div>
    </form>
  );
}
