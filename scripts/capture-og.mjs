import { chromium } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

async function main() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2, // 2x device scale -> 2400x1260
  });

  const page = await context.newPage();
  console.log('Navigating to http://localhost:3042...');
  await page.goto('http://localhost:3042', { waitUntil: 'networkidle', timeout: 60000 });

  // Wait for loader to dismiss and fonts to stabilize
  console.log('Waiting for loader to dismiss and fonts to stabilize...');
  await page.waitForTimeout(3500);

  // Remove any Next.js development badges or overlays
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach((el) => {
      const tag = el.tagName ? el.tagName.toLowerCase() : '';
      if (tag.includes('nextjs') || tag.includes('next-route') || el.id?.includes('next')) {
        el.remove();
      }
    });
  });
  await page.waitForTimeout(500);

  const targetPng = path.resolve('public/assets/og-banner.png');
  const targetJpg = path.resolve('public/assets/og-banner.jpg');
  const ogImgPng = path.resolve('public/og-image.png');
  const ogImgJpg = path.resolve('public/og-image.jpg');

  await page.screenshot({ path: targetPng });
  console.log('Captured 2400x1260 PNG:', targetPng);

  await browser.close();

  // Copy to public/og-image.png
  execSync(`cp "${targetPng}" "${ogImgPng}"`);

  // Convert to JPEG
  execSync(`sips -s format jpeg -s formatOptions 92 "${targetPng}" --out "${targetJpg}"`);
  execSync(`sips -s format jpeg -s formatOptions 92 -z 630 1200 "${targetPng}" --out "${ogImgJpg}"`);

  console.log('Successfully generated updated OG banners:');
  console.log('- public/assets/og-banner.png (2400x1260)');
  console.log('- public/assets/og-banner.jpg (2400x1260)');
  console.log('- public/og-image.png (2400x1260)');
  console.log('- public/og-image.jpg (1200x630)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
