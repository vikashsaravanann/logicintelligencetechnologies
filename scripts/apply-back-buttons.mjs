import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '../src/app');

const targets = {
  '(marketing)/blog/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/blog/[slug]/page.tsx': '<BackToHome href="/blog" label="Back to Blog" />',
  '(marketing)/work/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/work/[slug]/case-study-content.tsx': '<BackToHome href="/work" label="Back to Portfolio" />',
  '(marketing)/services/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/services/[slug]/page.tsx': '<BackToHome href="/services" label="Back to Solutions" />',
  '(marketing)/industries/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/industries/[slug]/page.tsx': '<BackToHome href="/industries" label="Back to Industries" />',
  '(marketing)/packages/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/packages/[slug]/page.tsx': '<BackToHome href="/packages" label="Back to Packages" />',
  '(marketing)/resources/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/resources/[slug]/page.tsx': '<BackToHome href="/resources" label="Back to Resources" />',
  '(marketing)/support/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/support/new/page.tsx': '<BackToHome href="/support" label="Back to Support Hub" inline />',
  '(marketing)/support/[ticketId]/page.tsx': '<BackToHome href="/support" label="Back to Support Hub" inline />',
  '(marketing)/careers/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/press/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/products/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/proposal/[secureToken]/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/search/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/booking/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/book-consultation/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/cookie-policy/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/accessibility/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(auth)/login/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(auth)/reset-password/page.tsx': '<BackToHome href="/login" label="Back to Sign In" />',
  'client/projects/[id]/page.tsx': '<BackToHome href="/client" label="Back to Projects" inline />',
  'admin/proposals/[id]/page.tsx': '<BackToHome href="/admin/proposals" label="Back to Proposals" inline />',
  'admin/proposals/new/page.tsx': '<BackToHome href="/admin/proposals" label="Back to Proposals" inline />',
  'admin/leads/[id]/page.tsx': '<BackToHome href="/admin/leads" label="Back to Leads Ledger" inline />',
};

const IMPORT_STMT = 'import BackToHome from "@/components/ui/back-to-home";';

for (const [relPath, tag] of Object.entries(targets)) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Missing: ${relPath}`);
    continue;
  }
  let code = fs.readFileSync(fullPath, 'utf8');

  if (relPath === '(marketing)/work/[slug]/case-study-content.tsx') {
    // replace raw inline text arrow
    code = code.replace(/<Link href="\/work".*?&larr;.*?<\/Link>/s, tag);
    if (!code.includes(IMPORT_STMT)) {
      code = code.replace(/(import .*?;[\r\n]+)/, `$1${IMPORT_STMT}\n`);
    }
    fs.writeFileSync(fullPath, code);
    console.log(`Updated: ${relPath}`);
    continue;
  }

  // Handle standard page.tsx
  if (!code.includes(IMPORT_STMT)) {
    code = code.replace(/(import .*?;[\r\n]+)/, `$1${IMPORT_STMT}\n`);
  }

  // Check if BackToHome is already inside
  if (code.includes('<BackToHome')) {
    code = code.replace(/<BackToHome\s*[^>]*\/>/, tag);
  } else {
    // Insert after <main ...> or similar wrapper
    const mainRegex = /(<main[^>]*>)/;
    if (mainRegex.test(code)) {
      code = code.replace(mainRegex, `$1\n      ${tag}`);
    } else {
      console.log(`Could not find <main> in ${relPath}`);
    }
  }

  fs.writeFileSync(fullPath, code);
  console.log(`Updated: ${relPath}`);
}
