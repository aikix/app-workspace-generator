import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Components Showcase Page
 */
export class ComponentsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly buttons: Locator;
  readonly cards: Locator;
  readonly forms: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1');
    this.buttons = page.locator('button');
    this.cards = page.locator('[class*="card"]').or(page.locator('article'));
    this.forms = page.locator('form');
  }

  /**
   * Navigate to the components page
   */
  async goto() {
    await this.page.goto('/components');
  }

  /**
   * Get the first button element
   */
  getFirstButton(): Locator {
    return this.buttons.first();
  }

  /**
   * Click a button by index
   */
  async clickButton(index: number = 0) {
    await this.buttons.nth(index).click();
  }

  /**
   * Get all cards on the page
   */
  async getCards(): Promise<Locator[]> {
    return await this.cards.all();
  }

  /**
   * Fill a form input by label
   */
  async fillFormInput(label: string, value: string) {
    const input = this.page.getByLabel(label);
    await input.fill(value);
  }

  /**
   * Submit the first form on the page
   */
  async submitForm() {
    const submitButton = this.forms.first().locator('button[type="submit"]');
    await submitButton.click();
  }

  /**
   * Check if a specific component section is visible
   */
  async isComponentSectionVisible(sectionName: string): Promise<boolean> {
    const section = this.page.getByRole('heading', { name: new RegExp(sectionName, 'i') });
    return await section.isVisible();
  }
}
