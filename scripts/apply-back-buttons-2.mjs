import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '../src/app');

const targets = {
  '(marketing)/services/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/services/[slug]/page.tsx': '<BackToHome href="/services" label="Back to Solutions" />',
  '(marketing)/industries/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/industries/[slug]/page.tsx': '<BackToHome href="/industries" label="Back to Industries" />',
  '(marketing)/resources/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/resources/[slug]/page.tsx': '<BackToHome href="/resources" label="Back to Resources" />',
  '(marketing)/support/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/support/new/page.tsx': '<BackToHome href="/support" label="Back to Support Hub" inline />',
  '(marketing)/support/[ticketId]/page.tsx': '<BackToHome href="/support" label="Back to Support Hub" inline />',
  '(marketing)/careers/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/press/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/products/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/proposal/[secureToken]/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/book-consultation/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  '(marketing)/cookie-policy/page.tsx': '<BackToHome href="/" label="Back to Home" />',
  'client/projects/[id]/page.tsx': '<BackToHome href="/client" label="Back to Projects" inline />',
  'admin/proposals/[id]/page.tsx': '<BackToHome href="/admin/proposals" label="Back to Proposals" inline />',
  'admin/proposals/new/page.tsx': '<BackToHome href="/admin/proposals" label="Back to Proposals" inline />',
  'admin/leads/[id]/page.tsx': '<BackToHome href="/admin/leads" label="Back to Leads Ledger" inline />',
};

for (const [relPath, tag] of Object.entries(targets)) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) continue;
  let code = fs.readFileSync(fullPath, 'utf8');

  if (code.includes(tag)) {
    console.log(`Already has exact tag: ${relPath}`);
    continue;
  }

  // replace return ( \n <div...> with return ( \n <div...> \n tag
  // wait, safer to just replace `return (` followed by whitespace and a tag
  const returnRegex = /(return\s*\(\s*<[a-zA-Z0-9_.\-]+[^>]*>)/;
  if (returnRegex.test(code)) {
    code = code.replace(returnRegex, `$1\n      ${tag}`);
    fs.writeFileSync(fullPath, code);
    console.log(`Fixed: ${relPath}`);
  } else {
    // maybe there's no wrapper, like return <> 
    const fragmentRegex = /(return\s*\(\s*<>)/;
    if (fragmentRegex.test(code)) {
        code = code.replace(fragmentRegex, `$1\n      ${tag}`);
        fs.writeFileSync(fullPath, code);
        console.log(`Fixed fragment: ${relPath}`);
    } else {
        console.log(`Still failed: ${relPath}`);
    }
  }
}
