import assert from 'node:assert/strict';
import { BrowserManager } from '@core/BrowserManager';
import { env } from '@config/env';
import { LoginPage } from '@pages/LoginPage';

/**
 * Smoke scenario: known-valid credentials must reach the inventory screen.
 */
async function runSuccessfulLoginScenario(): Promise<void> {
  const browserManager = new BrowserManager({
    headless: true,
    slowMo: 0,
    defaultTimeoutMs: 30000,
  });

  try {
    await browserManager.init();

    const page = browserManager.getPage();
    const loginPage = new LoginPage(page);

    await loginPage.navigate(env.baseUrl);
    await loginPage.login(env.username, env.password);
    // Extra assertion to guarantee we really landed on inventory.
    await page.waitForSelector('.inventory_list', { timeout: 15000 });
  } finally {
    await browserManager.close();
  }
}

/**
 * Smoke scenario: invalid credentials must produce a clear validation error.
 */
async function runFailedLoginScenario(): Promise<void> {
  const browserManager = new BrowserManager({
    headless: true,
    slowMo: 0,
    defaultTimeoutMs: 30000,
  });

  try {
    await browserManager.init();

    const page = browserManager.getPage();
    const loginPage = new LoginPage(page);

    await loginPage.navigate(env.baseUrl);

    let capturedMessage = '';

    try {
      await loginPage.login(env.username, '__invalid_password__');
    } catch (error) {
      // Convert unknown throwables into a comparable string payload.
      capturedMessage = error instanceof Error ? error.message : String(error);
    }

    assert.notEqual(
      capturedMessage,
      '',
      'Expected login with invalid credentials to fail with an error message.',
    );
    assert.match(
      capturedMessage,
      /Epic sadface/i,
      `Unexpected error message for invalid login: ${capturedMessage}`,
    );
  } finally {
    await browserManager.close();
  }
}

/**
 * Runs the smoke suite sequentially so logs stay readable and deterministic.
 */
async function main(): Promise<void> {
  console.log('Running smoke test: successful login scenario');
  await runSuccessfulLoginScenario();

  console.log('Running smoke test: invalid login scenario');
  await runFailedLoginScenario();

  console.log('Smoke tests passed.');
}

void main().catch((error) => {
  // Non-zero exit code is required for CI visibility on failures.
  console.error('Smoke test failed:', error);
  process.exitCode = 1;
});
