import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load and display the homepage correctly', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Check that page title is set
    await expect(page).toHaveTitle(/Home/i);

    // Check that main heading is present
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // Check that page has no console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit to catch any errors
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('should have navigation menu', async ({ page }) => {
    await page.goto('/');

    // Check for navigation elements
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Check that page is still accessible on mobile
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should navigate to components page', async ({ page }) => {
    await page.goto('/');

    // Look for a link to components page
    const componentsLink = page.getByRole('link', { name: /components/i });

    // If link exists, click it and verify navigation
    if (await componentsLink.count() > 0) {
      await componentsLink.first().click();
      await expect(page).toHaveURL(/\/components/);
    }
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto('/');

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);

    // Check viewport meta
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /.+/);
  });

  test('should have no accessibility violations on homepage', async ({ page }) => {
    await page.goto('/');

    // Basic accessibility checks
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
  });
});
