import { BasePage } from '@core/BasePage';

/**
 * Page Object for SauceDemo inventory interactions.
 */
export class InventoryPage extends BasePage {
  private readonly selectors = {
    inventoryList: '.inventory_list',
    inventoryItemName: '.inventory_item_name',
    cartLink: '.shopping_cart_link',
    cartBadge: '.shopping_cart_badge',
  };

  /**
   * Validates that the inventory page is loaded and ready for interaction.
   */
  async assertLoaded(): Promise<void> {
    await this.page.waitForSelector(this.selectors.inventoryList, { visible: true });
  }

  /**
   * Adds a product to cart by exact product name.
   * Uses SauceDemo's stable data-test add-to-cart button contract.
   */
  async addProductToCart(productName: string): Promise<void> {
    await this.assertLoaded();

    const availableNames = await this.page.$$eval(this.selectors.inventoryItemName, (elements) =>
      elements.map((element) => element.textContent?.trim() ?? ''),
    );

    if (!availableNames.includes(productName)) {
      throw new Error(`InventoryPage: product "${productName}" was not found in inventory.`);
    }

    const productSlug = this.toProductSlug(productName);
    const addButtonSelector = `[data-test="add-to-cart-${productSlug}"]`;
    const removeButtonSelector = `[data-test="remove-${productSlug}"]`;

    // Best-effort dismissal of browser overlays that can steal clicks in headful mode.
    await this.page.keyboard.press('Escape').catch(() => {});

    await this.page.waitForSelector(addButtonSelector, { visible: true, timeout: 10000 });
    await this.page.click(addButtonSelector);

    // Confirm the state changed from "Add to cart" to "Remove".
    await this.page.waitForSelector(removeButtonSelector, { visible: true, timeout: 10000 });

    // Wait until cart badge reflects at least one item to avoid race conditions.
    await this.page.waitForFunction(
      (badgeSelector) => {
        const badge = document.querySelector(badgeSelector);
        if (!badge || !badge.textContent) {
          return false;
        }

        const count = Number(badge.textContent.trim());
        return Number.isFinite(count) && count >= 1;
      },
      { timeout: 10000 },
      this.selectors.cartBadge,
    );
  }

  /**
   * Opens the cart page.
   */
  async openCart(): Promise<void> {
    await this.click(this.selectors.cartLink);
  }

  /**
   * Reads the cart badge count. Returns 0 when no badge is present.
   */
  async getCartCount(): Promise<number> {
    const badge = await this.page.$(this.selectors.cartBadge);
    if (!badge) {
      return 0;
    }

    const rawCount = await this.page.$eval(this.selectors.cartBadge, (element) =>
      element.textContent?.trim(),
    );
    const parsedCount = Number(rawCount);

    return Number.isFinite(parsedCount) ? parsedCount : 0;
  }

  /**
   * Converts product names to SauceDemo data-test slug format.
   * Example: "Sauce Labs Backpack" -> "sauce-labs-backpack".
   */
  private toProductSlug(productName: string): string {
    return productName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }
}
