import 'dotenv/config';

/**
 * Puppeteer supports boolean headless modes and, in newer versions,
 * the special "shell" mode that maps to chrome-headless-shell.
 */
export type HeadlessMode = boolean | 'shell';

/**
 * Parses common boolean-like strings into a Puppeteer-compatible headless value.
 * Defaults to `false` to keep local debugging easy unless explicitly enabled.
 */
function parseHeadless(value: string | undefined): HeadlessMode {
  const v = (value ?? 'false').toLowerCase().trim();

  if (v === 'true' || v === '1' || v === 'yes') return true;
  if (v === 'false' || v === '0' || v === 'no') return false;

  // Allow HEADLESS=shell when supported by the installed Puppeteer version.
  if (v === 'shell') return 'shell';

  return false;
}

/**
 * Coerces environment values into finite numbers.
 * Falls back to a safe default when parsing fails.
 */
function parseNumber(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Centralized runtime configuration for the automation entrypoint and tests.
 */
export const env = {
  baseUrl: process.env.SAUCE_URL ?? 'https://www.saucedemo.com/',
  username: process.env.SAUCE_USER ?? 'standard_user',
  password: process.env.SAUCE_PASS ?? 'secret_sauce',
  headless: parseHeadless(process.env.HEADLESS),
  slowMo: parseNumber(process.env.SLOWMO, 50),
  screenshotDir: process.env.SCREENSHOT_DIR ?? 'artifacts/screenshots',
};
