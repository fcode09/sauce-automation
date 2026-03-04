import puppeteer, { Browser, Page, Viewport } from 'puppeteer';
import { env, HeadlessMode } from '@config/env';

/**
 * Optional launch/runtime overrides used by tests and specialized flows.
 */
export interface BrowserManagerOptions {
  /** Overrides `env.headless` when provided. */
  headless?: HeadlessMode;
  /** Adds a delay (ms) between Puppeteer actions for easier debugging. */
  slowMo?: number;
  /** Sets the viewport for the created page (`null` uses full window). */
  defaultViewport?: Viewport | null;
  /** Default timeout applied to selectors and actions on the managed page. */
  defaultTimeoutMs?: number;
  /** Chromium launch arguments. */
  args?: string[];
}

/**
 * Owns browser lifecycle and exposes exactly one managed page.
 * Keeps startup/teardown concerns out of page objects and flows.
 */
export class BrowserManager {
  private browser: Browser | undefined;
  private page: Page | undefined;
  private readonly defaultLaunchArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-save-password-bubble',
    '--disable-notifications',
    '--disable-popup-blocking',
    '--disable-extensions',
    '--disable-sync',
    '--password-store=basic',
    '--use-mock-keychain',
    '--disable-features=PasswordLeakDetection,PasswordManagerOnboarding,Translate,AutofillServerCommunication',
  ];

  constructor(private readonly options: BrowserManagerOptions = {}) {}

  /**
   * Boots a browser instance and prepares a single page with a default timeout.
   * Throws if called twice on the same manager to prevent hidden state bugs.
   */
  async init(): Promise<void> {
    if (this.browser) {
      throw new Error('BrowserManager is already initialized.');
    }

    // Always keep default anti-popup/automation-safe args even when custom args are provided.
    const launchArgs = Array.from(
      new Set([...this.defaultLaunchArgs, ...(this.options.args ?? [])]),
    );

    this.browser = await puppeteer.launch({
      headless: this.options.headless ?? env.headless,
      slowMo: this.options.slowMo ?? env.slowMo,
      defaultViewport: this.options.defaultViewport ?? null,
      args: launchArgs,
    });

    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(this.options.defaultTimeoutMs ?? 20000);
  }

  /**
   * Returns the managed page after initialization.
   * Fails fast with a clear message when initialization was skipped.
   */
  getPage(): Page {
    if (!this.page) {
      throw new Error('BrowserManager is not initialized. Call init() first.');
    }

    return this.page;
  }

  /**
   * Closes browser resources and resets internal state for safety.
   * Safe to call multiple times.
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
      this.page = undefined;
    }
  }
}
