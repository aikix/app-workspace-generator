import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Home Page
 * Encapsulates page interactions and element locators
 */
export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly navigation: Locator;
  readonly componentsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1').first();
    this.navigation = page.locator('nav').first();
    this.componentsLink = page.getByRole('link', { name: /components/i });
  }

  /**
   * Navigate to the home page
   */
  async goto() {
    await this.page.goto('/');
  }

  /**
   * Get the main heading text
   */
  async getHeadingText(): Promise<string> {
    return await this.heading.textContent() || '';
  }

  /**
   * Check if navigation is visible
   */
  async isNavigationVisible(): Promise<boolean> {
    return await this.navigation.isVisible();
  }

  /**
   * Navigate to components page
   */
  async goToComponents() {
    if (await this.componentsLink.count() > 0) {
      await this.componentsLink.first().click();
    }
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }
}
