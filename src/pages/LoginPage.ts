import { BasePage } from '@core/BasePage';

/**
 * Page Object for SauceDemo login behavior.
 */
export class LoginPage extends BasePage {
  private readonly selectors = {
    username: '#user-name',
    password: '#password',
    loginButton: '#login-button',
    error: '[data-test="error"]',
  };

  /**
   * Attempts login and validates the resulting state.
   *
   * Success condition:
   * - inventory container appears.
   *
   * Failure condition:
   * - login error banner appears and its text is thrown as an Error.
   */
  async login(username: string, password: string): Promise<void> {
    // Clear existing values first to make retries deterministic.
    await this.page.waitForSelector(this.selectors.username, { visible: true });
    await this.page.click(this.selectors.username, { clickCount: 3 });
    await this.type(this.selectors.username, username);

    await this.page.waitForSelector(this.selectors.password, { visible: true });
    await this.page.click(this.selectors.password, { clickCount: 3 });
    await this.type(this.selectors.password, password);

    await this.click(this.selectors.loginButton);

    // Wait for whichever comes first: successful navigation or inline error.
    await Promise.race([
      this.page.waitForSelector('.inventory_list', { timeout: 15000 }),
      this.page.waitForSelector(this.selectors.error, { timeout: 15000 }),
    ]);

    // If an error banner exists after submit, surface a business-meaningful error.
    const err = await this.page.$(this.selectors.error);
    if (err) {
      const msg = await this.page.$eval(this.selectors.error, (el) => el.textContent?.trim() ?? '');
      throw new Error(msg || 'Login failed with an unknown error.');
    }
  }
}
