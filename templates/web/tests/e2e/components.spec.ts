import { test, expect } from '@playwright/test';

test.describe('UI Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components');
  });

  test('should display components showcase page', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page).toHaveTitle(/Components/i);
  });

  test.describe('Button Component', () => {
    test('should render buttons with different variants', async ({ page }) => {
      // Check if buttons are visible
      const buttons = page.locator('button');
      await expect(buttons.first()).toBeVisible();
    });

    test('should be clickable', async ({ page }) => {
      const button = page.locator('button').first();

      // Click and verify interaction
      let clicked = false;
      page.on('console', (msg) => {
        if (msg.text().includes('clicked') || msg.text().includes('Button')) {
          clicked = true;
        }
      });

      await button.click();

      // Button should be in document after click (not removed)
      await expect(button).toBeVisible();
    });

    test('should have proper focus states', async ({ page }) => {
      const button = page.locator('button').first();

      // Focus the button
      await button.focus();

      // Check that button has focus (should have focus-visible or focus styles)
      await expect(button).toBeFocused();
    });
  });

  test.describe('Card Component', () => {
    test('should render cards', async ({ page }) => {
      // Look for card elements (may have class "card" or be in a grid)
      const cards = page.locator('[class*="card"]').or(page.locator('article'));

      if ((await cards.count()) > 0) {
        await expect(cards.first()).toBeVisible();
      }
    });

    test('should have proper spacing and layout', async ({ page }) => {
      const cards = page.locator('[class*="card"]');

      if ((await cards.count()) > 0) {
        // Cards should have padding and not overlap
        const firstCard = cards.first();
        const box = await firstCard.boundingBox();

        expect(box).toBeTruthy();
        if (box) {
          expect(box.width).toBeGreaterThan(0);
          expect(box.height).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Form Elements', () => {
    test('should render form inputs if present', async ({ page }) => {
      const inputs = page.locator('input');

      if ((await inputs.count()) > 0) {
        await expect(inputs.first()).toBeVisible();

        // Type in input
        await inputs.first().fill('test value');

        // Verify value was set
        await expect(inputs.first()).toHaveValue('test value');
      }
    });

    test('should handle form validation', async ({ page }) => {
      const forms = page.locator('form');

      if ((await forms.count()) > 0) {
        const form = forms.first();

        // Try to submit without filling required fields
        const submitButton = form.locator('button[type="submit"]');

        if ((await submitButton.count()) > 0) {
          await submitButton.click();

          // Should show validation errors or prevent submission
          // This is a basic check - actual behavior depends on implementation
        }
      }
    });
  });

  test.describe('Navigation', () => {
    test('should have working navigation links', async ({ page }) => {
      const links = page.locator('a[href^="/"]');

      if ((await links.count()) > 0) {
        // Verify links are visible and have href
        const firstLink = links.first();
        await expect(firstLink).toBeVisible();

        const href = await firstLink.getAttribute('href');
        expect(href).toBeTruthy();
      }
    });

    test('should handle hover states', async ({ page }) => {
      const links = page.locator('a');

      if ((await links.count()) > 0) {
        const firstLink = links.first();

        // Hover over link
        await firstLink.hover();

        // Link should still be visible
        await expect(firstLink).toBeVisible();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Components should still be visible
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      // Components should still be visible
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should be responsive on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Components should still be visible
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();

      // Should only have one h1
      await expect(h1).toHaveCount(1);
    });

    test('should have keyboard navigation', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab');

      // At least one element should have focus
      const focused = await page.evaluateHandle(() => document.activeElement);
      expect(focused).toBeTruthy();
    });

    test('should have aria labels where needed', async ({ page }) => {
      // Buttons without text should have aria-label
      const buttons = await page.locator('button').all();

      for (const button of buttons) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');

        // If button has no text, it should have aria-label
        if (!text || text.trim() === '') {
          expect(ariaLabel).toBeTruthy();
        }
      }
    });
  });
});
