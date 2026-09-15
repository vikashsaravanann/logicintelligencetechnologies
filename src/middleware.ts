import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isCompanyEmail(email: string): boolean {
  return email.toLowerCase().endsWith("@logicintelligencetechnologies.in");
}

/** Routes reachable without a session (auth + form APIs + static). */
function isPublicPath(path: string): boolean {
  if (
    path === "/login" ||
    path === "/reset-password" ||
    path.startsWith("/auth/") ||
    path.startsWith("/api/auth/") ||
    path === "/robots.txt" ||
    path === "/sitemap.xml" ||
    path === "/site.webmanifest" ||
    path.startsWith("/.well-known/") ||
    path === "/unsubscribe" ||
    path.startsWith("/api/unsubscribe") ||
    path === "/api/health"
  ) {
    return true;
  }

  // Public lead / form APIs — must not redirect to HTML login (breaks fetch JSON)
  const publicApis = [
    "/api/contact",
    "/api/free-demo",
    "/api/checklist",
    "/api/jobs",
    "/api/jobs/apply",
    "/api/newsletter",
    "/api/booking",
    "/api/support",
    "/api/ai/lead",
  ];
  if (publicApis.some((p) => path === p || path.startsWith(p + "/"))) {
    return true;
  }

  if (
    path.startsWith("/assets/") ||
    path.startsWith("/images/") ||
    path.startsWith("/resources/") ||
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
  const path = req.nextUrl.pathname;

  // Fast path: static + public APIs skip session lookup for speed
  if (
    path.startsWith("/_next/") ||
    path.startsWith("/assets/") ||
    path.startsWith("/images/") ||
    path.startsWith("/resources/") ||
    path.startsWith("/favicon") ||
    path.startsWith("/icon")
  ) {
    return res;
  }

  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session && (path === "/login" || path === "/reset-password")) {
    const next = req.nextUrl.searchParams.get("next");
    const dest =
      next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  if (!session && !isPublicPath(path)) {
    const loginUrl = new URL("/login", req.url);
    const nextPath = `${path}${req.nextUrl.search || ""}`;
    if (nextPath && nextPath !== "/") {
      loginUrl.searchParams.set("next", nextPath);
    }
    return NextResponse.redirect(loginUrl);
  }

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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?)$).*)",
  ],
};
