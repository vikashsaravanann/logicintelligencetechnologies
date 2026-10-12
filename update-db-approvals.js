const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocalPath = '.env.local';
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lcmbwalrupoyparxsnjw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.log('No SUPABASE_SERVICE_ROLE_KEY found in .env.local, checking system env...');
}

// I can just query the remote db directly through psql since I have the connection string from task-256: 
// `host=db.lcmbwalrupoyparxsnjw.supabase.co user=cli_login_postgres database=postgres`? 
// No, I can use the supabase cli to query remote: `npx supabase query "..."` maybe?
// Let's just create a SQL script and run it through `psql` using the connection string from Supabase settings if I can find it.
