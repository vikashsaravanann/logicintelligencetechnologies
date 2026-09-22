import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/safe-next";

function isCompanyEmail(email: string): boolean {
  return email.toLowerCase().endsWith("@logicintelligencetechnologies.in");
}

/**
 * Paths that require a signed-in session.
 * All marketing, product, and legal pages are public by default.
 */
function requiresAuth(path: string): boolean {
  if (path.startsWith("/dashboard")) return true;
  if (path.startsWith("/admin")) return true;
  if (path.startsWith("/portal")) return true;
  if (path.startsWith("/profile")) return true;
  if (path.startsWith("/client")) return true;
  return false;
}

function isAuthShellPath(path: string): boolean {
  return (
    path.startsWith("/login") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/auth/")
  );
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;
  const requested = `${path}${req.nextUrl.search}`;

  // Public marketing / product / assets — never gate behind login
  if (!requiresAuth(path) && !isAuthShellPath(path)) {
    return res;
  }

  // Login / reset: if already signed in, bounce to safe next
  if (isAuthShellPath(path)) {
    try {
      const supabase = createMiddlewareClient({ req, res });
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session && (path === "/login" || path === "/reset-password")) {
        const dest = safeNextPath(req.nextUrl.searchParams.get("next"), "/");
        return NextResponse.redirect(new URL(dest, req.url));
      }
    } catch {
      /* keep auth pages reachable */
    }
    return res;
  }

  // Protected surfaces
  try {
    const supabase = createMiddlewareClient({ req, res });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", safeNextPath(requested, path));
      return NextResponse.redirect(loginUrl);
    }

    if (path.startsWith("/dashboard") || path.startsWith("/admin")) {
      let isAllowed = false;

      if (session.user.email && isCompanyEmail(session.user.email)) {
        isAllowed = true;
      } else if (session.user.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (
          profile &&
          (profile.role === "admin" || profile.role === "super_admin")
        ) {
          isAllowed = true;
        }
      }

      if (!isAllowed) {
        return NextResponse.redirect(new URL("/profile", req.url));
      }
    }
  } catch {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", safeNextPath(requested, path));
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?)$).*)",
  ],
};
