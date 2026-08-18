"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { createCategory } from "@/app/admin/(protected)/catalogue-actions";
import { initialAdminCatalogueActionState } from "@/lib/admin/catalogue-state";

export function AdminCategoryManager() {
  const [state, action, pending] = useActionState(
    createCategory,
    initialAdminCatalogueActionState,
  );
  return (
    <form
      action={action}
      className="mt-5 grid gap-3 rounded-[var(--radius-md)] bg-[var(--surface-strong)] p-4 md:grid-cols-4"
      noValidate
    >
      <label className="form-label">
        Name
        <input className="form-input" name="name" required disabled={pending} />
      </label>
      <label className="form-label">
        Slug
        <input
          className="form-input"
          name="slug"
          placeholder="phone-cases"
          required
          disabled={pending}
        />
      </label>
      <label className="form-label">
        Description
        <input className="form-input" name="description" disabled={pending} />
      </label>
      <div className="flex items-end">
        <button
          className="admin-button-primary admin-button-lg focus-ring w-full"
          type="submit"
          disabled={pending}
        >
          <Plus size={16} /> {pending ? "Saving…" : "Add category"}
        </button>
      </div>
      {state.message ? (
        <p className="text-sm text-red-800 md:col-span-4" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
