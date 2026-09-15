import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isCompanyEmail(email: string): boolean {
  return email.toLowerCase().endsWith("@logicintelligencetechnologies.in");
}

/** Only portal / admin areas require a session. Marketing site is public. */
function requiresAuth(path: string): boolean {
  return (
    path.startsWith("/dashboard") ||
    path.startsWith("/admin") ||
    path.startsWith("/client") ||
    path.startsWith("/profile") ||
    path.startsWith("/omni")
  );
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;

  // Static assets — never block
  if (
    path.startsWith("/_next/") ||
    path.startsWith("/assets/") ||
    path.startsWith("/images/") ||
    path.startsWith("/resources/") ||
    path.startsWith("/favicon") ||
    path.startsWith("/icon") ||
    path.startsWith("/apple-")
  ) {
    return res;
  }

  // Public marketing + auth + form APIs — no session lookup required
  if (!requiresAuth(path)) {
    // Still redirect authenticated users away from login
    if (path === "/login" || path === "/reset-password") {
      try {
        const supabase = createMiddlewareClient({ req, res });
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const next = req.nextUrl.searchParams.get("next");
          const dest =
            next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
          return NextResponse.redirect(new URL(dest, req.url));
        }
      } catch {
        // Auth helper failure must not take the site down
      }
    }
    return res;
  }

  // Protected routes
  try {
    const supabase = createMiddlewareClient({ req, res });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", path);
      return NextResponse.redirect(loginUrl);
    }

    if (path.startsWith("/dashboard") || path.startsWith("/admin")) {
      const email = session.user.email || "";
      if (!isCompanyEmail(email)) {
        return NextResponse.redirect(new URL("/profile", req.url));
      }
    }
  } catch {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?)$).*)",
  ],
};
