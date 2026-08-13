import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { initialAdminLoginState } from "./admin-login-state";

describe("admin login action boundary", () => {
  it("keeps initial useActionState data outside the use-server module", async () => {
    const actionSource = await readFile(
      path.join(process.cwd(), "app/admin/login/actions.ts"),
      "utf8",
    );
    expect(initialAdminLoginState).toEqual({ status: "idle" });
    expect(actionSource).not.toContain("initialAdminLoginState");
    expect(actionSource).toMatch(/export async function adminLoginAction/);
  });
});
