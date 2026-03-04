/**
 * Credentials used by the login flow.
 */
export interface Credentials {
  username: string;
  password: string;
}

/**
 * Customer data required by SauceDemo checkout step one.
 */
export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/**
 * Product selection descriptor for purchase flows.
 */
export interface ProductSelection {
  name: string;
}

/**
 * Final result emitted by the purchase flow.
 */
export interface PurchaseResult {
  confirmationText: string;
  completedAt: string;
  orderId?: string;
}

/**
 * Deterministic default product for smoke and local runs.
 */
export const DEFAULT_PRODUCT_NAME = 'Sauce Labs Backpack';

/**
 * Deterministic checkout payload for smoke and local runs.
 */
export const DEFAULT_CHECKOUT_INFO: CheckoutInfo = {
  firstName: 'Automation',
  lastName: 'Bot',
  postalCode: '90210',
};
