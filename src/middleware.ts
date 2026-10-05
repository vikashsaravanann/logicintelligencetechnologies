import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/safe-next";
import { isCompanyOnlyPath, isProtectedPath, isPublicPath } from "@/lib/routing/public-paths";

function isCompanyEmail(email: string): boolean {
  return email.toLowerCase().endsWith("@logicintelligencetechnologies.in");
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

  // Not a signed-in area: unknown paths fall through to the 404 page.
  if (!isProtectedPath(path)) return res;

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

    if (isCompanyOnlyPath(path)) {
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
