import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isInvalidRefreshTokenError,
  supabaseAuthCookieNames,
} from "./auth-recovery";
import { supabaseCookieOptions } from "./cookie-options";
import { getSupabasePublicEnv } from "./env";

const ADMIN_LOGIN_PATH = "/admin/login";

function loginRedirect(request: NextRequest) {
  const url = new URL(ADMIN_LOGIN_PATH, request.url);
  return NextResponse.redirect(url);
}

function clearInvalidAuthSession(
  request: NextRequest,
  response: NextResponse,
  supabaseUrl: string,
) {
  const cookieNames = supabaseAuthCookieNames(
    request.cookies.getAll().map(({ name }) => name),
    supabaseUrl,
  );
  cookieNames.forEach((name) => {
    response.cookies.set({
      name,
      value: "",
      ...supabaseCookieOptions,
      maxAge: 0,
    });
  });
  return response;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabasePublicEnv();
  const supabase = createServerClient(url, anonKey, {
    cookieOptions: supabaseCookieOptions,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (isInvalidRefreshTokenError(userError)) {
    if (request.nextUrl.pathname === ADMIN_LOGIN_PATH) {
      return clearInvalidAuthSession(request, response, url);
    }
    return clearInvalidAuthSession(request, loginRedirect(request), url);
  }

  if (request.nextUrl.pathname === ADMIN_LOGIN_PATH) {
    if (!user) return response;
    const { data: isAdmin } = await supabase.rpc("is_admin");
    return isAdmin
      ? NextResponse.redirect(new URL("/admin", request.url))
      : response;
  }

  if (!user) return loginRedirect(request);
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) return loginRedirect(request);
  return response;
}
