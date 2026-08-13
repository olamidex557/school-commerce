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
      className="grid gap-3 rounded-3xl border border-black/10 bg-white p-4 md:grid-cols-[1.5fr_1fr_1fr_auto]"
    >
      <label className="relative">
        <span className="sr-only">Search products</span>
        <Search
          className="absolute top-1/2 left-3 -translate-y-1/2 text-[#5b665f]"
          size={18}
          aria-hidden="true"
        />
        <input
          className="w-full rounded-xl border border-black/15 bg-white py-3 pr-3 pl-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#c7ff3d]"
          name="search"
          defaultValue={query.search}
          placeholder="Search accessories"
        />
      </label>
      <label>
        <span className="sr-only">Filter by category</span>
        <select
          className="w-full rounded-xl border border-black/15 bg-white px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#c7ff3d]"
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
          className="w-full rounded-xl border border-black/15 bg-white px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#c7ff3d]"
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
        <button
          className="flex-1 rounded-xl bg-[#17211d] px-4 py-3 text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-[#c7ff3d]"
          type="submit"
        >
          Apply
        </button>
        {query.category || query.search || query.sort !== "featured" ? (
          <Link
            className="rounded-xl border border-black/15 px-4 py-3 text-sm font-bold focus-visible:ring-2 focus-visible:ring-[#c7ff3d]"
            href={buildShopHref({ sort: "featured" })}
          >
            Reset
          </Link>
        ) : null}
      </div>
    </form>
  );
}
