import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sendLoginNotification } from "@/lib/email/send-login-notification";
import { ensureWelcomeEmail } from "@/lib/email/send-welcome";
import { env } from "@/config/env";

function safeNext(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/dashboard";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = safeNext(requestUrl.searchParams.get("next"));

  if (code) {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore as any },
      {
        supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    );
    try {
      const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);

      if (session?.user?.email) {
        try {
          await ensureWelcomeEmail({
            userId: session.user.id,
            email: session.user.email,
            fullName:
              (session.user.user_metadata?.full_name as string | undefined) ||
              (session.user.user_metadata?.name as string | undefined) ||
              null,
            avatarUrl:
              (session.user.user_metadata?.avatar_url as string | undefined) ||
              (session.user.user_metadata?.picture as string | undefined) ||
              null,
          });
        } catch (welcomeErr) {
          console.error("[Email Error] Welcome email failed:", welcomeErr);
        }

        const emailResult = await sendLoginNotification(session.user.email, request.headers);
        if (!emailResult.success) {
          console.error("[Email Error] Login notification failed:", emailResult.message);
        }

        const email = session.user.email;
        const dest =
          next === "/dashboard" && !email.endsWith("@logicintelligencetechnologies.in")
            ? "/profile"
            : next;
        return NextResponse.redirect(new URL(dest, request.url));
      }
    } catch (error: any) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`, request.url));
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
