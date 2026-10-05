import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const resourceDirs = [
  path.join(rootDir, 'private/resources'),
  path.join(rootDir, 'public/resources'),
];

const EXPECTED_PDFS = [
  'company-profile.pdf',
  'services-brochure.pdf',
  'capability-statement.pdf',
  'website-development-checklist.pdf',
  'ai-readiness-assessment.pdf',
  'business-automation-guide.pdf',
  'technology-roadmap-template.pdf',
  'project-proposal-template.pdf',
  'statement-of-work.pdf',
  'case-study.pdf',
  'press-kit.pdf',
  'investor-partnership-information-memorandum.pdf',
];

console.log('--- LOGIC INTELLIGENCE TECHNOLOGIES PDF VERIFICATION ---');

let hasErrors = false;

const existingResourceDirs = resourceDirs.filter((dir) => fs.existsSync(dir));

if (existingResourceDirs.length === 0) {
  console.error(`FAIL: Neither private/resources nor public/resources directories exist.`);
  process.exit(1);
}

for (const filename of EXPECTED_PDFS) {
  const filePath = existingResourceDirs
    .map((dir) => path.join(dir, filename))
    .find((candidatePath) => fs.existsSync(candidatePath));

  if (!filePath) {
    console.error(`FAIL: Missing PDF file: ${filename}`);
    hasErrors = true;
    continue;
  }

  const stat = fs.statSync(filePath);
  if (stat.size === 0) {
    console.error(`FAIL: PDF file is empty (0 bytes): ${filename}`);
    hasErrors = true;
    continue;
  }

  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(10);
  fs.readSync(fd, buffer, 0, 10, 0);
  fs.closeSync(fd);

  const header = buffer.toString('utf-8');
  if (!header.startsWith('%PDF-')) {
    console.error(`FAIL: File ${filename} does not start with %PDF- header (saw: ${header})`);
    hasErrors = true;
    continue;
  }

  console.log(`PASS: ${filename} (Size: ${stat.size} bytes, Header: ${header.slice(0, 8)})`);
}

if (hasErrors) {
  console.error('\nPDF Verification FAILED. Please correct missing or invalid PDF resources.');
  process.exit(1);
}

console.log(`\nALL ${EXPECTED_PDFS.length} OFFICIAL CORPORATE PDFS VERIFIED SUCCESSFULLY.`);
