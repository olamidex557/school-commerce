"use client";

import { useActionState, useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import { updateCategory } from "@/app/admin/(protected)/catalogue-actions";
import { initialAdminCatalogueActionState } from "@/lib/admin/catalogue-state";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export function AdminCategoryEditForm({
  category,
}: Readonly<{ category: Category }>) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(
    updateCategory,
    initialAdminCatalogueActionState,
  );
  if (!editing)
    return (
      <button
        className="admin-button-ghost admin-button-sm focus-ring"
        type="button"
        onClick={() => setEditing(true)}
      >
        <Pencil size={15} /> Edit
      </button>
    );
  return (
    <form
      action={action}
      className="mt-4 grid gap-3 rounded-[var(--radius-md)] bg-[var(--surface-strong)] p-4 sm:grid-cols-3"
      noValidate
    >
      <input name="id" type="hidden" value={category.id} />
      <label className="text-sm font-bold">
        Name
        <input
          className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2"
          defaultValue={category.name}
          name="name"
          disabled={pending}
        />
      </label>
      <label className="text-sm font-bold">
        Slug
        <input
          className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2"
          defaultValue={category.slug}
          name="slug"
          disabled={pending}
        />
      </label>
      <label className="text-sm font-bold">
        Description
        <input
          className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2"
          defaultValue={category.description ?? ""}
          name="description"
          disabled={pending}
        />
      </label>
      <div className="flex gap-2 sm:col-span-3">
        <button
          className="admin-button-primary admin-button-sm focus-ring"
          type="submit"
          disabled={pending}
        >
          <Save size={15} /> Save
        </button>
        <button
          className="admin-button-secondary admin-button-sm focus-ring"
          type="button"
          onClick={() => setEditing(false)}
          disabled={pending}
        >
          <X size={15} /> Cancel
        </button>
      </div>
      {state.message ? (
        <p className="text-sm text-red-800 sm:col-span-3" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
