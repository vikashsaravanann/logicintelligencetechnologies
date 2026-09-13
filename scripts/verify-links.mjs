import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const VALID_STATIC_ROUTES = new Set([
  '/',
  '/about',
  '/about/founder',
  '/services',
  '/industries',
  '/products',
  '/work',
  '/packages',
  '/blog',
  '/resources',
  '/careers',
  '/press',
  '/investors',
  '/contact',
  '/book-consultation',
  '/free-demo',
  '/discovery',
  '/checklist',
  '/support',
  '/support/new',
  '/search',
  '/ai',
  '/ai-assistant',
  '/login',
  '/reset-password',
  '/profile',
  '/client/dashboard',
  '/client/projects',
  '/client/documents',
  '/client/invoices',
  '/client/messages',
  '/client/support',
  '/privacy',
  '/terms',
  '/refund-policy',
  '/cookie-policy',
  '/accessibility',
  '/admin/command-center',
  '/admin/leads',
  '/admin/bookings',
  '/admin/proposals',
  '/admin/support',
]);

console.log('--- LOGIC INTELLIGENCE TECHNOLOGIES ROUTE LINK AUDIT ---');
console.log(`Auditing ${VALID_STATIC_ROUTES.size} registered static routes...`);

let ok = true;
for (const r of VALID_STATIC_ROUTES) {
  // Check that either a folder exists in src/app or a route handler exists
  // Removing leading /
  const subPath = r === '/' ? 'page.tsx' : `${r}/page.tsx`;
  // Next.js route groups might have (marketing), (portal), (auth)
  const candidates = [
    path.join(rootDir, 'src/app', subPath),
    path.join(rootDir, 'src/app/(marketing)', subPath),
    path.join(rootDir, 'src/app/(portal)', subPath),
    path.join(rootDir, 'src/app/(auth)', subPath),
  ];

  const found = candidates.some((c) => fs.existsSync(c));
  if (!found) {
    // Check if it's handled by a redirect or dynamic route
    if (r === '/client/profile' || r === '/client/login') {
      console.log(`[INFO] Route ${r} is handled via 301 redirect to canonical destination.`);
    } else {
      console.warn(`[WARN] Route candidate check: ${r}`);
    }
  } else {
    console.log(`[PASS] Route verified: ${r}`);
  }
}

console.log('\nROUTE VERIFICATION COMPLETED.');
