import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, anonKey);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@logicintelligencetechnologies.in',
    password: 'wrongpassword'
  });
  console.log(error?.message || "Success");
}
test();
