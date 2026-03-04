import { BrowserManager } from '@core/BrowserManager';
import { LoginPage } from '@pages/LoginPage';
import { env } from '@config/env';
import { PurchaseFlow } from '@flows/PurchaseFlow';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { Page } from 'puppeteer';
import { DEFAULT_CHECKOUT_INFO, DEFAULT_PRODUCT_NAME } from './types';

/**
 * Formats timestamps as `YYYYMMDD-HHmmss` to keep artifact names sortable.
 */
function buildTimestamp(date: Date): string {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${yyyy}${mm}${dd}-${hh}${min}${ss}`;
}

/**
 * Captures a full-page screenshot on failures so flaky states can be inspected later.
 */
async function captureErrorScreenshot(page: Page): Promise<void> {
  const timestamp = buildTimestamp(new Date());
  const screenshotPath = path.join(env.screenshotDir, `error-${timestamp}.png`);

  await mkdir(env.screenshotDir, { recursive: true });
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.error(`Screenshot saved at ${screenshotPath}`);
}

/**
 * Application entrypoint:
 * - initialize browser
 * - run login and full purchase flow
 * - collect diagnostics on failure
 * - always close resources
 */
async function bootstrap() {
  const browserManager = new BrowserManager();
  let page: Page | undefined;

  try {
    await browserManager.init();

    page = browserManager.getPage();
    const loginPage = new LoginPage(page);
    const purchaseFlow = new PurchaseFlow(page);

    await loginPage.navigate(env.baseUrl);
    await loginPage.login(env.username, env.password);
    const purchaseResult = await purchaseFlow.run(
      { name: DEFAULT_PRODUCT_NAME },
      DEFAULT_CHECKOUT_INFO,
    );

    console.log(
      `Purchase completed successfully: product="${DEFAULT_PRODUCT_NAME}", confirmation="${purchaseResult.confirmationText}", completedAt="${purchaseResult.completedAt}"`,
    );
  } catch (error) {
    // Set process exit code so CI/shell scripts can detect automation failure.
    console.error('Automation failed:', error);
    process.exitCode = 1;

    if (page) {
      await captureErrorScreenshot(page).catch((screenshotError) => {
        console.error('Failed to capture screenshot:', screenshotError);
      });
    }
  } finally {
    await browserManager.close().catch((closeError) => {
      console.error('Failed to close browser:', closeError);
    });
  }
}

void bootstrap();
