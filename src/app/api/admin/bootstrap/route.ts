import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  return handleBootstrap(req);
}

export async function GET(req: Request) {
  return handleBootstrap(req);
}

async function handleBootstrap(req: Request) {
  const url = new URL(req.url);
  const secretParam = url.searchParams.get("secret");
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const cronSecret = process.env.CRON_SECRET;

  const providedSecret = secretParam || token || req.headers.get("x-bootstrap-secret");

  if (!cronSecret || providedSecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const defaultPassword = "AdminDashboard2026!";
  const accountsToBootstrap = [
    {
      email: "vikash@logicintelligencetechnologies.in",
      fullName: "Vikash Saravanan",
      role: "super_admin",
    },
    {
      email: "admin@logicintelligencetechnologies.in",
      fullName: "LIT Administrator",
      role: "super_admin",
    },
    {
      email: "hello@logicintelligencetechnologies.in",
      fullName: "LIT Operations",
      role: "super_admin",
    },
  ];

  const results: any[] = [];

  for (const acct of accountsToBootstrap) {
    try {
      // 1. List users to check if user already exists
      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) {
        results.push({ email: acct.email, error: listError.message });
        continue;
      }

      let user = usersData.users.find((u) => u.email?.toLowerCase() === acct.email.toLowerCase());

      if (user) {
        // Update user password and auto-confirm email
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          user.id,
          {
            password: defaultPassword,
            email_confirm: true,
            user_metadata: { full_name: acct.fullName },
          }
        );
        if (updateError) {
          results.push({ email: acct.email, step: "update_user", error: updateError.message });
          continue;
        }
        user = updateData.user;
      } else {
        // Create new user
        const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: acct.email,
          password: defaultPassword,
          email_confirm: true,
          user_metadata: { full_name: acct.fullName },
        });
        if (createError) {
          results.push({ email: acct.email, step: "create_user", error: createError.message });
          continue;
        }
        user = createData.user;
      }

      if (!user) {
        results.push({ email: acct.email, error: "User object not returned" });
        continue;
      }

      // 2. Set profile role to super_admin
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: acct.email,
            role: acct.role,
            full_name: acct.fullName,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (profileError) {
        results.push({ email: acct.email, step: "profile_upsert", error: profileError.message });
      } else {
        results.push({
          email: acct.email,
          status: "provisioned_as_super_admin",
          userId: user.id,
          role: acct.role,
        });
      }
    } catch (err: any) {
      results.push({ email: acct.email, exception: err?.message || String(err) });
    }
  }

  return NextResponse.json({
    success: true,
    message: "Admin accounts bootstrapped successfully",
    accounts: results,
    password: defaultPassword,
  });
}
