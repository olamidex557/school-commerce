type AuthErrorLike = {
  message?: string;
  code?: string;
};

export function isInvalidRefreshTokenError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const { message = "", code = "" } = error as AuthErrorLike;
  return (
    /invalid refresh token|refresh token not found/i.test(message) ||
    /refresh_token_not_found|invalid_refresh_token/i.test(code)
  );
}

export function supabaseAuthCookieNames(
  cookieNames: Iterable<string>,
  supabaseUrl: string,
) {
  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  const prefix = `sb-${projectRef}-auth-token`;
  return [...cookieNames].filter(
    (name) => name === prefix || name.startsWith(`${prefix}.`),
  );
}
