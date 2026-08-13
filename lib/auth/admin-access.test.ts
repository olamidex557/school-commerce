import { describe, expect, it } from "vitest";
import { resolveAdminAccess } from "./admin-access";

describe("admin access decisions", () => {
  it("redirects unauthenticated requests to the admin login", () => {
    expect(resolveAdminAccess(undefined, false)).toEqual({
      allowed: false,
      redirectTo: "/admin/login",
    });
  });

  it("rejects authenticated users who are not in admin_users", () => {
    expect(resolveAdminAccess("user-id", false)).toEqual({
      allowed: false,
      redirectTo: "/admin/login",
    });
  });

  it("allows an authenticated administrator", () => {
    expect(resolveAdminAccess("admin-id", true)).toEqual({
      allowed: true,
      userId: "admin-id",
    });
  });

  it("blocks access again after sign-out removes the session", () => {
    expect(resolveAdminAccess(undefined, false)).toEqual({
      allowed: false,
      redirectTo: "/admin/login",
    });
  });
});
