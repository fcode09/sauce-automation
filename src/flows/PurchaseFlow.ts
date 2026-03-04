import { Page } from 'puppeteer';
import { CartPage } from '@pages/CartPage';
import { InventoryPage } from '@pages/InventoryPage';
import { CheckoutInfo, ProductSelection, PurchaseResult } from '../types';

/**
 * Orchestrates the complete purchase journey after a successful login.
 */
export class PurchaseFlow {
  private readonly inventoryPage: InventoryPage;
  private readonly cartPage: CartPage;

  private readonly selectors = {
    checkoutFirstName: '#first-name',
    checkoutLastName: '#last-name',
    checkoutPostalCode: '#postal-code',
    checkoutContinue: '#continue',
    checkoutOverview: '.summary_info',
    checkoutFinish: '#finish',
    completeHeader: '.complete-header',
  };

  constructor(private readonly page: Page) {
    this.inventoryPage = new InventoryPage(page);
    this.cartPage = new CartPage(page);
  }

  /**
   * Runs the single-product happy-path purchase process.
   */
  async run(selection: ProductSelection, checkoutInfo: CheckoutInfo): Promise<PurchaseResult> {
    await this.inventoryPage.assertLoaded();
    await this.inventoryPage.addProductToCart(selection.name);

    const cartCount = await this.inventoryPage.getCartCount();
    if (cartCount !== 1) {
      throw new Error(`PurchaseFlow: expected cart count 1 after add, received ${cartCount}.`);
    }

    await this.inventoryPage.openCart();
    await this.cartPage.assertLoaded();
    await this.cartPage.assertProductInCart(selection.name);
    await this.cartPage.goToCheckout();

    await this.fillCheckoutInformation(checkoutInfo);
    await this.assertCheckoutOverview();
    const confirmationText = await this.finishCheckoutAndReadConfirmation();

    return {
      confirmationText,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Completes checkout step one and transitions to overview.
   */
  private async fillCheckoutInformation(checkoutInfo: CheckoutInfo): Promise<void> {
    await this.typeAndReplace(this.selectors.checkoutFirstName, checkoutInfo.firstName);
    await this.typeAndReplace(this.selectors.checkoutLastName, checkoutInfo.lastName);
    await this.typeAndReplace(this.selectors.checkoutPostalCode, checkoutInfo.postalCode);
    await this.page.click(this.selectors.checkoutContinue);
  }

  /**
   * Ensures checkout overview (step two) is loaded before finishing.
   */
  private async assertCheckoutOverview(): Promise<void> {
    await this.page.waitForSelector(this.selectors.checkoutOverview, {
      visible: true,
      timeout: 15000,
    });

    if (!this.page.url().includes('checkout-step-two.html')) {
      throw new Error(
        `PurchaseFlow: expected URL to contain checkout-step-two.html, received "${this.page.url()}".`,
      );
    }
  }

  /**
   * Finishes checkout and validates completion text.
   */
  private async finishCheckoutAndReadConfirmation(): Promise<string> {
    await this.page.click(this.selectors.checkoutFinish);
    await this.page.waitForSelector(this.selectors.completeHeader, {
      visible: true,
      timeout: 15000,
    });

    if (!this.page.url().includes('checkout-complete.html')) {
      throw new Error(
        `PurchaseFlow: expected URL to contain checkout-complete.html, received "${this.page.url()}".`,
      );
    }

    const confirmationText = await this.page.$eval(this.selectors.completeHeader, (element) =>
      element.textContent?.trim(),
    );

    if (!confirmationText || !/thank you for your order/i.test(confirmationText)) {
      throw new Error(
        `PurchaseFlow: unexpected completion text "${confirmationText ?? '<empty>'}".`,
      );
    }

    return confirmationText;
  }

  /**
   * Clears the field and types a new value for deterministic form interactions.
   */
  private async typeAndReplace(selector: string, value: string): Promise<void> {
    await this.page.waitForSelector(selector, { visible: true, timeout: 10000 });
    await this.page.click(selector, { clickCount: 3 });
    await this.page.type(selector, value);
  }
}
