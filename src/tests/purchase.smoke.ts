import assert from 'node:assert/strict';
import { BrowserManager } from '@core/BrowserManager';
import { env } from '@config/env';
import { PurchaseFlow } from '@flows/PurchaseFlow';
import { LoginPage } from '@pages/LoginPage';
import { DEFAULT_CHECKOUT_INFO, DEFAULT_PRODUCT_NAME } from '../types';

/**
 * Smoke scenario: complete one-product purchase flow must finish with confirmation.
 */
async function runPurchaseScenario(): Promise<void> {
  const browserManager = new BrowserManager({
    headless: true,
    slowMo: 0,
    defaultTimeoutMs: 30000,
  });

  try {
    await browserManager.init();

    const page = browserManager.getPage();
    const loginPage = new LoginPage(page);
    const purchaseFlow = new PurchaseFlow(page);

    await loginPage.navigate(env.baseUrl);
    await loginPage.login(env.username, env.password);

    const result = await purchaseFlow.run({ name: DEFAULT_PRODUCT_NAME }, DEFAULT_CHECKOUT_INFO);

    assert.match(
      result.confirmationText,
      /thank you for your order/i,
      `Unexpected purchase confirmation text: ${result.confirmationText}`,
    );
    assert.notEqual(result.completedAt, '', 'Expected completedAt to be generated.');
  } finally {
    await browserManager.close();
  }
}

async function main(): Promise<void> {
  console.log('Running smoke test: purchase happy path');
  await runPurchaseScenario();
  console.log('Purchase smoke test passed.');
}

void main().catch((error) => {
  console.error('Purchase smoke test failed:', error);
  process.exitCode = 1;
});
