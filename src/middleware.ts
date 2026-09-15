import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isCompanyEmail(email: string): boolean {
  return email.toLowerCase().endsWith("@logicintelligencetechnologies.in");
}

/** Routes reachable without a session (auth flows + critical infrastructure). */
function isPublicPath(path: string): boolean {
  if (
    path === "/login" ||
    path === "/reset-password" ||
    path.startsWith("/auth/") ||
    path.startsWith("/api/auth/") ||
    path.startsWith("/api/webhooks/") ||
    path === "/robots.txt" ||
    path === "/sitemap.xml" ||
    path === "/site.webmanifest" ||
    path.startsWith("/.well-known/")
  ) {
    return true;
  }
  // Static public assets under /assets, /images, icons
  if (
    path.startsWith("/assets/") ||
    path.startsWith("/images/") ||
    path.startsWith("/icon") ||
    path.startsWith("/favicon") ||
    path.startsWith("/apple-") ||
    path.startsWith("/_next/")
  ) {
    return true;
  }
  return false;
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  // Authenticated users hitting login → home (or safe next)
  if (session && (path === "/login" || path === "/reset-password")) {
    const next = req.nextUrl.searchParams.get("next");
    const dest =
      next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // Everything else requires a session
  if (!session && !isPublicPath(path)) {
    const loginUrl = new URL("/login", req.url);
    // Preserve intended destination after login
    const nextPath = `${path}${req.nextUrl.search || ""}`;
    if (nextPath && nextPath !== "/") {
      loginUrl.searchParams.set("next", nextPath);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Company-only admin / dashboard
  if (session && (path.startsWith("/dashboard") || path.startsWith("/admin"))) {
    const email = session.user.email || "";
    if (!isCompanyEmail(email)) {
      return NextResponse.redirect(new URL("/profile", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Run on all routes except Next internals and common static file extensions.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?)$).*)",
  ],
};
