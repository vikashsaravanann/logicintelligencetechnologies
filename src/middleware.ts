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

  if (path.startsWith("/dashboard") || path.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    const email = session.user.email || "";
    if (!isCompanyEmail(email)) {
      return NextResponse.redirect(new URL("/profile", req.url));
    }
  }

  if (path.startsWith("/profile")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/profile",
    "/profile/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
