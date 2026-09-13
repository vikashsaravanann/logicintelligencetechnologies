/**
 * Logic Intelligence Technologies — Safe Environment Configuration Validator
 * Validates presence and shape of environment variables without printing secret values.
 */

const MODE = process.env.VERIFY_ENV_MODE || process.env.NODE_ENV || 'development';

const CORE_VARS = [
  { name: 'NEXT_PUBLIC_SITE_URL', required: false, default: 'https://www.logicintelligencetechnologies.in' },
  { name: 'NEXT_PUBLIC_SUPABASE_URL', required: true, hint: 'Configured in Supabase project API settings' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, hint: 'Configured in Supabase project API settings' },
];

const SERVER_VARS = [
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: MODE === 'production', hint: 'Required on server for admin and backend tasks' },
  { name: 'SMTP_HOST', required: false, default: 'smtppro.zoho.in' },
  { name: 'SMTP_PORT', required: false, default: '465' },
  { name: 'SMTP_USER', required: false, hint: 'Zoho Mail user (e.g. no-reply@logicintelligencetechnologies.in)' },
  { name: 'SMTP_PASSWORD', required: false, hint: 'Zoho Mail application-specific password' },
];

console.log(`--- ENVIRONMENT VALIDATION (Target Mode: ${MODE}) ---`);

let missingRequired = [];

for (const v of [...CORE_VARS, ...SERVER_VARS]) {
  const val = process.env[v.name];
  const isSet = Boolean(val && val.trim().length > 0);

  if (!isSet) {
    if (v.required) {
      missingRequired.push(v);
      console.error(`[FAIL] MISSING REQUIRED: ${v.name} — ${v.hint}`);
    } else {
      console.warn(`[WARN] OPTIONAL NOT SET: ${v.name} (${v.default ? 'Default: ' + v.default : v.hint || 'optional'})`);
    }
  } else {
    // Masked validation report — never print values
    const masked = val.length > 8 ? `${val.slice(0, 3)}...${val.slice(-3)}` : '***';
    console.log(`[PASS] ${v.name} is configured (Length: ${val.length}, Masked: ${masked})`);
  }
}

if (missingRequired.length > 0) {
  console.error(`\nEnvironment validation FAILED with ${missingRequired.length} missing required variable(s).`);
  console.error('Configure these in your Vercel Project Settings or local .env.local before deploying.');
  if (MODE === 'production') {
    process.exit(1);
  } else {
    console.warn('\nRunning in development/build mode: proceeding with fallback mock boundaries.');
  }
} else {
  console.log('\nENVIRONMENT VALIDATION PASSED.');
}
