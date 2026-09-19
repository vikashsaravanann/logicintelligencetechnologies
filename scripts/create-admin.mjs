import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const emails = [
    "vikash@logicintelligencetechnologies.in",
    "hello@logicintelligencetechnologies.in",
    "admin@logicintelligencetechnologies.in",
    "contact@logicintelligencetechnologies.in",
    "no-reply@logicintelligencetechnologies.in",
    "sales@logicintelligencetechnologies.in",
    "ceo@logicintelligencetechnologies.in",
    "hr@logicintelligencetechnologies.in",
    "founder@logicintelligencetechnologies.in",
    "invoice@logicintelligencetechnologies.in"
  ];
  const password = "AdminDashboard2026!";

  for (const email of emails) {
    console.log(`\n--- Processing ${email} ---`);
    
    // Create user and auto-confirm email
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: "LIT Staff" }
    });

    if (userError) {
      if (userError.message.includes("already exists")) {
        console.log("User already exists, updating password and auto-confirming...");
        
        // Get the user ID to update them
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;
        
        const existingUser = users.users.find(u => u.email === email);
        if (existingUser) {
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            { password: password, email_confirm: true }
          );
          if (updateError) throw updateError;
          
          // Ensure their profile is super_admin
          await supabaseAdmin.from('profiles').update({ role: 'super_admin' }).eq('id', existingUser.id);
          console.log("Successfully updated existing user password and role to super_admin.");
        }
      } else {
        console.error("Error creating user:", userError);
      }
    } else if (user?.user) {
      // New user created successfully, now update their profile to super_admin
      console.log("User created! Setting role to super_admin...");
      
      // Sometimes profile creation via trigger takes a second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'super_admin' })
        .eq('id', user.user.id);
        
      if (profileError) {
        console.error("Error updating profile role:", profileError);
      } else {
        console.log("Successfully set user role to super_admin.");
      }
    }
  }

  console.log(`\nDONE! All accounts provisioned. You can now login perfectly with:\nEmails: ${emails.join(", ")}\nPassword: ${password}`);
}

main().catch(console.error);
