import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, anonKey);

if (!process.env.TEST_LOGIN_EMAIL || !process.env.TEST_LOGIN_PASSWORD) {
  console.error("Set TEST_LOGIN_EMAIL and TEST_LOGIN_PASSWORD.");
  process.exit(1);
}

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.TEST_LOGIN_EMAIL,
    password: process.env.TEST_LOGIN_PASSWORD
  });
  console.log(error?.message || "Success");
}
test();
