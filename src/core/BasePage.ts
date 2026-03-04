import { Page } from 'puppeteer';

/**
 * Base abstraction for page objects.
 * Provides minimal, consistent interaction helpers with implicit waits.
 */
export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to a target URL and waits for network to settle.
   * `networkidle2` is usually stable for traditional multi-resource pages.
   */
  async navigate(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'networkidle2' });
  }

  /**
   * Waits for the selector before clicking to reduce race conditions.
   */
  async click(selector: string): Promise<void> {
    await this.page.waitForSelector(selector);
    await this.page.click(selector);
  }

  /**
   * Waits for the selector before typing to avoid "element not found" flakiness.
   */
  async type(selector: string, value: string): Promise<void> {
    await this.page.waitForSelector(selector);
    await this.page.type(selector, value);
  }
}
