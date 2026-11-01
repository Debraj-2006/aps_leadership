import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { WORKING_ALLOWED_PATHS, WORKING_HOME } from "@/lib/roles";
import { REQUIRE_APPROVAL } from "@/lib/config";

const ROLE_COOKIE = "aps-role";
const ROLE_TTL_SECONDS = 600;

// Carry refreshed auth cookies over to a redirect so the session isn't lost.
function redirectWithCookies(url: URL, from: NextResponse) {
  const response = NextResponse.redirect(url);
  from.cookies.getAll().forEach((c) => response.cookies.set(c));
  return response;
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(process.env.SUPABASE_SERVICE_ROLE_KEY!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[+/=]/g, (c) => ({ "+": "-", "/": "_", "=": "" })[c]!);
}

// The role is cached in a signed cookie so most requests skip a database round trip.
// Format: userId.role.expiresAt.signature
async function readCachedRole(request: NextRequest, userId: string): Promise<string | null> {
  const raw = request.cookies.get(ROLE_COOKIE)?.value;
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 4) return null;
  const [id, role, expires, sig] = parts;
  if (id !== userId || Number(expires) < Date.now() / 1000) return null;
  return (await sign(`${id}.${role}.${expires}`)) === sig ? role : null;
}

async function cachedRoleCookie(userId: string, role: string) {
  const expires = Math.floor(Date.now() / 1000) + ROLE_TTL_SECONDS;
  const payload = `${userId}.${role}.${expires}`;
  return `${payload}.${await sign(payload)}`;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verifies the session JWT locally with the project's signing keys (no Auth server call),
  // refreshing the session first if it has expired.
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub ?? null;

  const isPublicPath =
    request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup");

  if (!userId && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const response = NextResponse.redirect(url);
    response.cookies.delete(ROLE_COOKIE);
    return response;
  }

  if (userId && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return redirectWithCookies(url, supabaseResponse);
  }

  if (userId) {
    // "inactive" is cached in place of the role for accounts awaiting approval or deactivated.
    let role = await readCachedRole(request, userId);
    if (!role) {
      const { data: profile } = await supabase.from("profiles").select("role, is_active").eq("id", userId).single();
      role = profile ? (REQUIRE_APPROVAL && !profile.is_active ? "inactive" : profile.role) : null;
      if (role) {
        supabaseResponse.cookies.set(ROLE_COOKIE, await cachedRoleCookie(userId, role), {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: ROLE_TTL_SECONDS,
        });
      }
    }

    if (role === "inactive") {
      await supabase.auth.signOut({ scope: "local" });
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "?status=inactive";
      const response = redirectWithCookies(url, supabaseResponse);
      response.cookies.delete(ROLE_COOKIE);
      return response;
    }

    const path = request.nextUrl.pathname;
    const allowed = WORKING_ALLOWED_PATHS.some((p) => path === p || path.startsWith(p + "/"));
    if (role === "working" && !allowed) {
      const url = request.nextUrl.clone();
      url.pathname = WORKING_HOME;
      url.search = "";
      return redirectWithCookies(url, supabaseResponse);
    }
  }

  return supabaseResponse;
}
