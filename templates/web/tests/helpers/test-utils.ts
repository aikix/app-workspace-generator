import { Page, expect } from '@playwright/test';

/**
 * Test utility functions for common operations
 */

/**
 * Wait for network to be idle (no ongoing requests)
 */
export async function waitForNetworkIdle(page: Page, timeout: number = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Check if page has no console errors
 */
export async function assertNoConsoleErrors(page: Page) {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Wait a bit to catch any errors
  await page.waitForTimeout(1000);

  expect(errors).toHaveLength(0);
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}

/**
 * Check if element is visible in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    if (!rect) return false;

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  });
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 10000
) {
  return await page.waitForResponse((response) => {
    const url = response.url();
    return typeof urlPattern === 'string'
      ? url.includes(urlPattern)
      : urlPattern.test(url);
  }, { timeout });
}

/**
 * Mock API response
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  mockData: any,
  status: number = 200
) {
  await page.route(urlPattern, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(mockData),
    });
  });
}

/**
 * Fill form with data object
 */
export async function fillForm(page: Page, formData: Record<string, string>) {
  for (const [name, value] of Object.entries(formData)) {
    const input = page.locator(`[name="${name}"]`);
    await input.fill(value);
  }
}

/**
 * Get all text content from elements matching selector
 */
export async function getAllTextContent(page: Page, selector: string): Promise<string[]> {
  const elements = await page.locator(selector).all();
  return Promise.all(elements.map(async (el) => (await el.textContent()) || ''));
}

/**
 * Check if page has proper meta tags
 */
export async function checkMetaTags(page: Page) {
  // Check description
  const metaDescription = page.locator('meta[name="description"]');
  await expect(metaDescription).toHaveAttribute('content', /.+/);

  // Check viewport
  const viewport = page.locator('meta[name="viewport"]');
  await expect(viewport).toHaveAttribute('content', /.+/);

  // Check charset
  const charset = page.locator('meta[charset]');
  await expect(charset).toHaveCount(1);
}

/**
 * Test responsive breakpoints
 */
export async function testResponsiveBreakpoints(
  page: Page,
  callback: (viewport: { width: number; height: number }) => Promise<void>
) {
  const breakpoints = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1024, height: 768, name: 'laptop' },
    { width: 1920, height: 1080, name: 'desktop' },
  ];

  for (const breakpoint of breakpoints) {
    await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
    await callback(breakpoint);
  }
}

/**
 * Wait for animation to complete
 */
export async function waitForAnimation(page: Page, selector: string) {
  await page.locator(selector).evaluate((element) => {
    return Promise.all(
      element.getAnimations().map((animation) => animation.finished)
    );
  });
}

/**
 * Get computed style of element
 */
export async function getComputedStyle(
  page: Page,
  selector: string,
  property: string
): Promise<string> {
  return await page.locator(selector).evaluate((element, prop) => {
    return window.getComputedStyle(element).getPropertyValue(prop);
  }, property);
}

/**
 * Check accessibility - basic checks
 */
export async function checkBasicAccessibility(page: Page) {
  // Check for main landmark
  const main = page.locator('main');
  await expect(main).toBeVisible();

  // Check that all images have alt text or aria-label
  const images = await page.locator('img').all();
  for (const img of images) {
    const alt = await img.getAttribute('alt');
    const ariaLabel = await img.getAttribute('aria-label');
    expect(alt !== null || ariaLabel !== null).toBeTruthy();
  }

  // Check heading hierarchy (should have at least one h1)
  const h1 = page.locator('h1');
  await expect(h1).toHaveCount(1);
}
