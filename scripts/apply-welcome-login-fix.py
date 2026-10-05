#!/usr/bin/env python3
from pathlib import Path

p = Path("src/app/(auth)/login/page.tsx")
t = p.read_text()

old_signup = '''        fetch("/api/auth/send-welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: data?.user?.id, email: email.trim() }),
        }).catch(() => {});'''

new_signup = '''        fetch("/api/auth/send-welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: data?.user?.id,
            email: email.trim(),
            fullName: name.trim() || data?.user?.user_metadata?.full_name || null,
          }),
        }).catch(() => {});'''

old_signin = '''        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        fetch("/api/auth/login-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            screenSize:
              typeof window !== "undefined"
                ? `${window.screen.width}x${window.screen.height}`
                : undefined,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        }).catch(() => {});'''

new_signin = '''        const { data: signInData, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        // Idempotent: covers users who signed up while SMTP was failing (no welcome ever sent)
        fetch("/api/auth/send-welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: signInData?.user?.id,
            email: email.trim(),
            fullName:
              (signInData?.user?.user_metadata?.full_name as string | undefined) ||
              (signInData?.user?.user_metadata?.name as string | undefined) ||
              null,
          }),
        }).catch(() => {});
        fetch("/api/auth/login-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            screenSize:
              typeof window !== "undefined"
                ? `${window.screen.width}x${window.screen.height}`
                : undefined,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        }).catch(() => {});'''

if "signInData" in t and "fullName: name.trim()" in t:
    print("already applied")
elif old_signup in t and old_signin in t:
    p.write_text(t.replace(old_signup, new_signup, 1).replace(old_signin, new_signin, 1))
    print("login welcome triggers applied")
else:
    print("pattern miss")
    raise SystemExit(1)
