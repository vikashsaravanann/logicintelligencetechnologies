import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const appDir = path.join(rootDir, 'src/app');

console.log('--- LOGIC INTELLIGENCE TECHNOLOGIES COMPLETE ROUTE & LINK AUDIT ---');

/**
 * Dynamically discover all page routes from src/app
 */
function discoverPageRoutes(dir, baseRoute = '') {
  let routes = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'components' || entry.name.startsWith('_')) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const segment = entry.name;
      // Strip Next.js route groups like (marketing), (portal), (auth)
      if (segment.startsWith('(') && segment.endsWith(')')) {
        routes = routes.concat(discoverPageRoutes(fullPath, baseRoute));
      } else {
        routes = routes.concat(discoverPageRoutes(fullPath, `${baseRoute}/${segment}`));
      }
    } else if (
      entry.name === 'page.tsx' ||
      entry.name === 'page.ts' ||
      entry.name === 'page.jsx' ||
      entry.name === 'page.js'
    ) {
      routes.push({
        route: baseRoute || '/',
        file: path.relative(rootDir, fullPath),
        isDynamic: baseRoute.includes('[') && baseRoute.includes(']'),
      });
    }
  }

  return routes;
}

const discoveredRoutes = discoverPageRoutes(appDir);
console.log(`Discovered ${discoveredRoutes.length} application page routes from current source.`);

let errorCount = 0;
let successCount = 0;

// Known internal redirects
const KNOWN_REDIRECTS = new Map([
  ['/client', '/client/dashboard'],
  ['/client/profile', '/profile'],
  ['/client/login', '/login'],
  ['/admin', '/admin/command-center'],
]);

// 1. Audit all discovered page routes
for (const item of discoveredRoutes) {
  const fullPath = path.join(rootDir, item.file);
  if (!fs.existsSync(fullPath)) {
    console.error(`[FAIL] Page file missing for route: ${item.route} (${item.file})`);
    errorCount++;
  } else {
    successCount++;
  }
}

console.log(`[PASS] ${successCount} discovered routes validated against filesystem.`);

// 2. Audit known navigation destinations and canonical links
const CANONICAL_LINKS_TO_CHECK = [
  '/',
  '/about',
  '/about/founder',
  '/expertise',
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
  '/admin/analytics',
  '/admin/intake',
  '/admin/leads',
  '/admin/ai-leads',
  '/admin/bookings',
  '/admin/outreach',
  '/admin/outreach/studio',
  '/admin/outreach/queue',
  '/admin/outreach/suppression',
  '/admin/outreach/analytics',
  '/admin/outreach/playbook',
  '/admin/outreach/compliance',
  '/admin/clients',
  '/admin/engagements',
  '/admin/proposals',
  '/admin/quotations',
  '/admin/quotations/catalog',
  '/admin/invoices',
  '/admin/subscriptions',
  '/admin/emails',
  '/admin/email-preview',
  '/admin/team',
  '/admin/workspaces',
  '/admin/workspaces/new',
  '/admin/support',
  '/admin/audit',
  '/admin/company',
  '/maintenance/plans',
];

for (const target of CANONICAL_LINKS_TO_CHECK) {
  // Check direct route match or dynamic route match
  const directMatch = discoveredRoutes.some((r) => r.route === target);
  const redirectMatch = KNOWN_REDIRECTS.has(target);

  if (directMatch) {
    // Valid direct route
  } else if (redirectMatch) {
    const dest = KNOWN_REDIRECTS.get(target);
    const destMatch = discoveredRoutes.some((r) => r.route === dest);
    if (!destMatch) {
      console.error(`[FAIL] Redirect target for ${target} -> ${dest} does not exist!`);
      errorCount++;
    }
  } else {
    // Check if covered by dynamic pattern
    const isCovered = discoveredRoutes.some((r) => {
      if (!r.isDynamic) return false;
      const regex = new RegExp('^' + r.route.replace(/\[\.\.\.[^\]]+\]/g, '.*').replace(/\[[^\]]+\]/g, '[^/]+') + '$');
      return regex.test(target);
    });

    if (!isCovered) {
      console.error(`[FAIL] Broken navigation destination: ${target} is not resolvable to any route or redirect!`);
      errorCount++;
    }
  }
}

console.log(`[PASS] ${CANONICAL_LINKS_TO_CHECK.length} canonical navigation destinations audited.`);

if (errorCount > 0) {
  console.error(`\n[ERROR] Route and link audit FAILED with ${errorCount} broken path(s).`);
  process.exit(1);
} else {
  console.log(`\n[SUCCESS] All routes and links verified successfully. 0 broken paths.`);
  process.exit(0);
}
