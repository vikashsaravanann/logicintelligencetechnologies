/**
 * Logic Intelligence Technologies — Production / Preview Smoke Test Suite
 * Tests HTTP status and key response headers for public and protected routes.
 */

let rawBase = process.env.SMOKE_TEST_BASE_URL || process.env.VERCEL_URL || 'https://www.logicintelligencetechnologies.in';
if (rawBase && !rawBase.startsWith('http://') && !rawBase.startsWith('https://')) {
  rawBase = `https://${rawBase}`;
}
const BASE_URL = rawBase.replace(/\/$/, '');

const SMOKE_ROUTES = [
  { path: '/', expectedStatus: 200, name: 'Homepage' },
  { path: '/about', expectedStatus: 200, name: 'About' },
  { path: '/about/founder', expectedStatus: 200, name: 'Founder Profile' },
  { path: '/services', expectedStatus: 200, name: 'Services' },
  { path: '/industries', expectedStatus: 200, name: 'Industries' },
  { path: '/products', expectedStatus: 200, name: 'Products' },
  { path: '/work', expectedStatus: 200, name: 'Work' },
  { path: '/packages', expectedStatus: 200, name: 'Packages' },
  { path: '/blog', expectedStatus: 200, name: 'Blog' },
  { path: '/resources', expectedStatus: 200, name: 'Resources' },
  { path: '/contact', expectedStatus: 200, name: 'Contact' },
  { path: '/book-consultation', expectedStatus: 200, name: 'Consultation' },
  { path: '/free-demo', expectedStatus: 200, name: 'Free Demo' },
  { path: '/discovery', expectedStatus: 200, name: 'Discovery' },
  { path: '/ai', expectedStatus: 200, name: 'AI Assistant' },
  { path: '/login', expectedStatus: 200, name: 'Login Portal' },
  { path: '/privacy', expectedStatus: 200, name: 'Privacy Policy' },
  { path: '/terms', expectedStatus: 200, name: 'Terms of Service' },
  { path: '/robots.txt', expectedStatus: 200, name: 'Robots.txt' },
  { path: '/sitemap.xml', expectedStatus: 200, name: 'Sitemap.xml' },
  { path: '/api/health', expectedStatus: 200, name: 'Health Check' },
  { path: '/resources/company-profile.pdf', expectedStatus: 404, name: 'Gated PDF Protection Check' },
  { path: '/docs/jobs-leadership.pdf', expectedStatus: 200, name: 'Public Corporate PDF Check' },
];

async function runSmokeTests() {
  console.log(`--- RUNNING SMOKE TESTS AGAINST ${BASE_URL} ---`);
  let passed = 0;
  let failed = 0;

  for (const route of SMOKE_ROUTES) {
    const url = `${BASE_URL}${route.path}`;
    let attempts = 0;
    let res = null;
    let lastError = null;

    while (attempts < 3) {
      try {
        attempts++;
        res = await fetch(url, { method: 'GET', redirect: 'follow' });
        break;
      } catch (err) {
        lastError = err;
        if (attempts < 3) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }

    if (!res) {
      console.error(`[ERROR] ${route.name} (${url}): ${lastError?.message || 'fetch failed'}`);
      failed++;
      continue;
    }

    if (res.status === route.expectedStatus) {
      console.log(`[PASS] ${route.name} (${route.path}) -> HTTP ${res.status}`);
      passed++;
    } else {
      console.error(`[FAIL] ${route.name} (${route.path}) -> Expected HTTP ${route.expectedStatus}, received ${res.status}`);
      failed++;
    }
  }

  console.log(`\nSmoke Test Summary: ${passed} passed, ${failed} failed out of ${SMOKE_ROUTES.length} routes.`);
  if (failed > 0) {
    if (process.env.CI) {
      process.exit(1);
    }
  }
}

runSmokeTests();
