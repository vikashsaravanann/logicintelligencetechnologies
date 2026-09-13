import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isCompanyEmail(email: string): boolean {
  return email.toLowerCase().endsWith("@logicintelligencetechnologies.in");
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;
  const url = req.nextUrl;

  // AI Chat workspace guard — the landing page (/ai) is public,
  // but the chat workspace (?chat=1) or shared session (?c=...) requires auth.
  if (path === "/ai") {
    const isWorkspace =
      url.searchParams.get("chat") === "1" ||
      url.searchParams.has("c");
    if (isWorkspace && !session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", "/ai");
      return NextResponse.redirect(loginUrl);
    }
  }

  if (path.startsWith("/dashboard") || path.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", path);
      return NextResponse.redirect(loginUrl);
    }
    const email = session.user.email || "";
    if (!isCompanyEmail(email)) {
      return NextResponse.redirect(new URL("/profile", req.url));
    }
  }

  if (path.startsWith("/profile")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/ai",
    "/dashboard",
    "/dashboard/:path*",
    "/profile",
    "/profile/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
