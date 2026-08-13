export type AdminLoginActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: { email?: string; password?: string };
};

export const initialAdminLoginState: AdminLoginActionState = {
  status: "idle",
};
