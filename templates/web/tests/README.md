# E2E Testing with Playwright

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

```bash
# Run all tests
npm run e2e

# Run tests in UI mode (interactive)
npm run e2e:ui

# Run tests in headed mode (see browser)
npm run e2e:headed

# Run tests in debug mode
npm run e2e:debug

# Run specific test file
npx playwright test tests/e2e/home.spec.ts

# Run tests on specific browser
npx playwright test --project=chromium
```

## Project Structure

```
tests/
├── e2e/                    # E2E test files
│   ├── home.spec.ts       # Homepage tests
│   ├── api.spec.ts        # API endpoint tests
│   └── components.spec.ts # UI component tests
├── page-objects/          # Page Object Models
│   ├── HomePage.ts        # Home page POM
│   └── ComponentsPage.ts  # Components page POM
├── helpers/               # Test utilities
│   └── test-utils.ts      # Common test functions
├── fixtures/              # Test data
│   └── test-data.ts       # Mock data and fixtures
└── README.md             # This file
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Using Page Objects

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';

test('should navigate using page object', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  const heading = await homePage.getHeadingText();
  expect(heading).toBeTruthy();
});
```

### Using Test Helpers

```typescript
import { test } from '@playwright/test';
import { waitForNetworkIdle, checkMetaTags } from '../helpers/test-utils';

test('should have proper meta tags', async ({ page }) => {
  await page.goto('/');
  await waitForNetworkIdle(page);
  await checkMetaTags(page);
});
```

### Using Test Fixtures

```typescript
import { test, expect } from '@playwright/test';
import { createTestUser, testUrls } from '../fixtures/test-data';

test('should create user', async ({ request }) => {
  const user = createTestUser();

  const response = await request.post(testUrls.api.users, {
    data: user,
  });

  expect(response.ok()).toBeTruthy();
});
```

## Best Practices

### 1. Use Page Object Model (POM)

Encapsulate page interactions in page objects:

```typescript
// page-objects/LoginPage.ts
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[name="email"]');
    this.passwordInput = page.locator('[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### 2. Use Test Data Fixtures

Centralize test data:

```typescript
// fixtures/test-data.ts
export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'SecurePass123!',
  },
};
```

### 3. Use Helper Functions

Create reusable test utilities:

```typescript
// helpers/test-utils.ts
export async function waitForNetworkIdle(page: Page) {
  await page.waitForLoadState('networkidle');
}
```

### 4. Test User Flows

Test complete user journeys:

```typescript
test('user registration flow', async ({ page }) => {
  // 1. Navigate to signup
  await page.goto('/signup');

  // 2. Fill form
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'Password123!');

  // 3. Submit
  await page.click('button[type="submit"]');

  // 4. Verify redirect
  await expect(page).toHaveURL('/dashboard');
});
```

### 5. Test Accessibility

Include accessibility checks:

```typescript
test('should be keyboard navigable', async ({ page }) => {
  await page.goto('/');

  // Tab through elements
  await page.keyboard.press('Tab');

  // Verify focus
  await expect(page.locator(':focus')).toBeVisible();
});
```

### 6. Test Responsive Design

```typescript
test('should work on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

## API Testing

Playwright supports API testing:

```typescript
test('should create user via API', async ({ request }) => {
  const response = await request.post('/api/users', {
    data: {
      name: 'Test User',
      email: 'test@example.com',
    },
  });

  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  expect(data.success).toBe(true);
});
```

## Debugging

### Visual Debugging

```bash
# Run with UI mode
npm run e2e:ui

# Run in headed mode (see browser)
npm run e2e:headed
```

### Using Debug Mode

```bash
# Run in debug mode with Playwright Inspector
npm run e2e:debug
```

### Screenshots and Videos

Playwright automatically captures:
- Screenshots on failure
- Videos on retry
- Traces on first retry

Find them in `test-results/` directory.

### Console Output

```typescript
test('should log console messages', async ({ page }) => {
  page.on('console', msg => console.log('Browser log:', msg.text()));
  await page.goto('/');
});
```

## CI/CD Integration

Playwright tests run automatically in CI:

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run e2e
```

## Configuration

Configuration is in `playwright.config.ts`:

- Test directory: `./tests/e2e`
- Browsers: Chromium, Firefox, WebKit
- Base URL: `http://localhost:3000`
- Retries: 2 on CI, 0 locally
- Workers: 1 on CI, unlimited locally

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Examples](https://playwright.dev/docs/test-components)
