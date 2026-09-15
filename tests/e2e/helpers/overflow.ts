import { Page, expect } from "@playwright/test";

export type OverflowReport = {
  scrollWidth: number;
  clientWidth: number;
  scrollHeight: number;
  clientHeight: number;
  horizontalOverflow: number;
  verticalOverflow: number;
};

export async function measureOverflow(page: Page): Promise<OverflowReport> {
  return page.evaluate(() => {
    const el = document.documentElement;
    const scrollWidth = el.scrollWidth;
    const clientWidth = el.clientWidth;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;
    return {
      scrollWidth,
      clientWidth,
      scrollHeight,
      clientHeight,
      horizontalOverflow: Math.max(0, scrollWidth - clientWidth),
      verticalOverflow: Math.max(0, scrollHeight - clientHeight),
    };
  });
}

export async function assertNoHorizontalOverflow(page: Page, tolerance = 1) {
  const m = await measureOverflow(page);
  expect(
    m.horizontalOverflow,
    `Horizontal overflow ${m.horizontalOverflow}px (scroll=${m.scrollWidth} client=${m.clientWidth})`
  ).toBeLessThanOrEqual(tolerance);
  return m;
}

export async function assertLoginVerticalReasonable(
  page: Page,
  maxExtra = 120
) {
  const m = await measureOverflow(page);
  expect(
    m.verticalOverflow,
    `Vertical overflow ${m.verticalOverflow}px exceeds ${maxExtra}px budget`
  ).toBeLessThanOrEqual(maxExtra);
  return m;
}
