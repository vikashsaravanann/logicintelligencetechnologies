import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/safe-next";

function isCompanyEmail(email: string): boolean {
  return email.toLowerCase().endsWith("@logicintelligencetechnologies.in");
}

function isPublicPath(path: string): boolean {
  if (path === "/") return true;
  if (path.startsWith("/login")) return true;
  if (path.startsWith("/reset-password")) return true;
  if (path.startsWith("/auth/")) return true;
  if (path.startsWith("/api/")) return true;
  if (path.startsWith("/unsubscribe")) return true;
  if (path.startsWith("/_next/")) return true;
  if (path.startsWith("/assets/")) return true;
  if (path.startsWith("/images/")) return true;
  if (path.startsWith("/favicon")) return true;
  if (path.startsWith("/icon")) return true;
  if (path.startsWith("/apple-")) return true;
  if (path.startsWith("/sitemap")) return true;
  if (path.startsWith("/robots")) return true;
  if (path.startsWith("/manifest")) return true;
  const marketing = [
    "/about", "/services", "/industries", "/products", "/work", "/packages",
    "/blog", "/resources", "/careers", "/press", "/investors", "/contact",
    "/book-consultation", "/free-demo", "/discovery", "/checklist", "/support",
    "/search", "/ai", "/privacy", "/terms", "/refund-policy", "/cookie-policy",
    "/accessibility", "/certifications", "/expertise",
  ];
  if (marketing.some((p) => path === p || path.startsWith(p + "/"))) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;
  const requested = `${path}${req.nextUrl.search}`;

  if (
    path.startsWith("/resources/") &&
    path.toLowerCase().endsWith(".pdf") &&
    !path.toLowerCase().endsWith("/press-kit.pdf")
  ) {
    return new NextResponse("Not Found", { status: 404 });
  }
  if (path === "/checklist.pdf" || path === "/resources/website-development-checklist.pdf") {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (isPublicPath(path)) {
    if (path === "/login" || path === "/reset-password") {
      try {
        const supabase = createMiddlewareClient({ req, res });
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const dest = safeNextPath(req.nextUrl.searchParams.get("next"), "/");
          return NextResponse.redirect(new URL(dest, req.url));
        }
      } catch {
        /* keep login reachable */
      }
    }
    return res;
  }

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
      const email = session.user.email || "";
      if (!isCompanyEmail(email)) {
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
