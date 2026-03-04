import { BasePage } from '@core/BasePage';

/**
 * Page Object for SauceDemo cart interactions.
 */
export class CartPage extends BasePage {
  private readonly selectors = {
    cartList: '.cart_list',
    cartItemName: '.cart_item .inventory_item_name',
    checkoutButton: '#checkout',
  };

  /**
   * Validates that the cart page is loaded and visible.
   */
  async assertLoaded(): Promise<void> {
    await this.page.waitForSelector(this.selectors.cartList, { visible: true });
  }

  /**
   * Ensures a specific product exists in the cart.
   */
  async assertProductInCart(productName: string): Promise<void> {
    await this.assertLoaded();

    const cartProductNames = await this.page.$$eval(this.selectors.cartItemName, (elements) =>
      elements.map((element) => element.textContent?.trim() ?? ''),
    );

    if (!cartProductNames.includes(productName)) {
      throw new Error(`CartPage: product "${productName}" was not found in the cart.`);
    }
  }

  /**
   * Continues from cart to checkout step one.
   */
  async goToCheckout(): Promise<void> {
    await this.click(this.selectors.checkoutButton);
  }
}
