import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Gated corporate resources are streamed from private/resources (never public
// static assets). The website-development-checklist backs the /checklist lead
// magnet, and the jobs/leadership one-pager is a direct download from
// public/docs. Keep this list in sync with src/config/pdfs.ts.
const PRIVATE_RESOURCES_DIR = path.join(rootDir, 'private/resources');
const PUBLIC_DOCS_DIR = path.join(rootDir, 'public/docs');

const EXPECTED = [
  { dir: PRIVATE_RESOURCES_DIR, file: 'company-profile.pdf' },
  { dir: PRIVATE_RESOURCES_DIR, file: 'services-brochure.pdf' },
  { dir: PRIVATE_RESOURCES_DIR, file: 'ai-rpa-capabilities.pdf' },
  { dir: PRIVATE_RESOURCES_DIR, file: 'portfolio.pdf' },
  { dir: PRIVATE_RESOURCES_DIR, file: 'pricing-guide.pdf' },
  { dir: PRIVATE_RESOURCES_DIR, file: 'case-studies.pdf' },
  { dir: PRIVATE_RESOURCES_DIR, file: 'onboarding-guide.pdf' },
  { dir: PRIVATE_RESOURCES_DIR, file: 'technology-stack.pdf' },
  { dir: PRIVATE_RESOURCES_DIR, file: 'founder-profile.pdf' },
  { dir: PRIVATE_RESOURCES_DIR, file: 'security-compliance.pdf' },
  { dir: PRIVATE_RESOURCES_DIR, file: 'faq.pdf' },
  { dir: PRIVATE_RESOURCES_DIR, file: 'contact-engagement.pdf' },
  { dir: PRIVATE_RESOURCES_DIR, file: 'brand-book.pdf' },
  { dir: PRIVATE_RESOURCES_DIR, file: 'investor-briefing.pdf' },
  { dir: PRIVATE_RESOURCES_DIR, file: 'knowledge-assistant.pdf' },
  { dir: PRIVATE_RESOURCES_DIR, file: 'website-development-checklist.pdf' },
  { dir: PUBLIC_DOCS_DIR, file: 'jobs-leadership.pdf' },
];

console.log('--- LOGIC INTELLIGENCE TECHNOLOGIES PDF VERIFICATION ---');

let hasErrors = false;

for (const { dir, file } of EXPECTED) {
  const filePath = path.join(dir, file);
  const rel = path.relative(rootDir, filePath);

  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: Missing PDF file: ${rel}`);
    hasErrors = true;
    continue;
  }

  const stat = fs.statSync(filePath);
  if (stat.size === 0) {
    console.error(`FAIL: PDF file is empty (0 bytes): ${rel}`);
    hasErrors = true;
    continue;
  }

  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(10);
  fs.readSync(fd, buffer, 0, 10, 0);
  fs.closeSync(fd);

  const header = buffer.toString('utf-8');
  if (!header.startsWith('%PDF-')) {
    console.error(`FAIL: File ${rel} does not start with %PDF- header (saw: ${header})`);
    hasErrors = true;
    continue;
  }

  console.log(`PASS: ${rel} (Size: ${stat.size} bytes, Header: ${header.slice(0, 8)})`);
}

if (hasErrors) {
  console.error('\nPDF Verification FAILED. Please correct missing or invalid PDF resources.');
  process.exit(1);
}

console.log(`\nALL ${EXPECTED.length} OFFICIAL CORPORATE PDFS VERIFIED SUCCESSFULLY.`);
