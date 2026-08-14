import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const actionSource = readFileSync(
  resolve(process.cwd(), "app/admin/(protected)/catalogue-actions.ts"),
  "utf8",
);

describe("admin catalogue action boundary", () => {
  it("authorizes every mutation through the server-side admin guard", () => {
    for (const action of [
      "createCategory", "updateCategory", "toggleCategoryArchive", "createProduct",
      "updateProduct", "toggleProductArchive", "uploadProductImage", "deleteProductImage",
    ]) {
      const section = actionSource.slice(actionSource.indexOf(`function ${action}`));
      expect(section).toContain("requireAdmin()");
    }
  });

  it("does not use or expose a service-role credential", () => {
    expect(actionSource).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(actionSource).not.toContain("createClient(");
  });

  it("builds product-scoped Storage paths server-side", () => {
    expect(actionSource).toContain("`products/${productId}/${randomUUID()}.${extension}`");
    expect(actionSource).toContain("validImageBytes");
  });
});
