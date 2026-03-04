# sauce-automation

Automated SauceDemo web interaction with Puppeteer + TypeScript using a Page Object structure.

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
```

Create a `.env` file from `.env.example` and adjust credentials if needed.

## Environment Variables

```bash
SAUCE_URL=https://www.saucedemo.com/
SAUCE_USER=standard_user
SAUCE_PASS=secret_sauce
HEADLESS=false
SLOWMO=50
SCREENSHOT_DIR=artifacts/screenshots
```

## Scripts

- `npm run dev`: Run the automation directly from TypeScript with hot reload.
- `npm run build`: Compile TypeScript and rewrite path aliases for `dist` runtime.
- `npm run start`: Execute the compiled end-to-end purchase flow from `dist/index.js`.
- `npm run lint`: Run ESLint on all TypeScript files in `src`.
- `npm run test`: Run all smoke tests sequentially.
- `npm run test:login`: Run login-only smoke tests (valid + invalid credentials).
- `npm run test:purchase`: Run purchase happy-path smoke test.
- `npm run format`: Format files with Prettier.

## Current Scope

- Implemented:
  - Browser lifecycle manager.
  - Base page helpers.
  - Login page automation and error detection.
  - Inventory page interactions (add item + cart badge checks).
  - Cart page validations and checkout transition.
  - Purchase flow orchestration (checkout info -> overview -> finish -> confirmation).
  - Smoke tests for login and purchase happy path.
- Pending:
  - Multi-product and extended negative scenario matrix.

## End-to-End Flow

1. Open SauceDemo login page.
2. Authenticate with configured credentials.
3. Add `Sauce Labs Backpack` to cart.
4. Validate cart count and cart item presence.
5. Complete checkout step one with deterministic test data.
6. Validate overview page and finish checkout.
7. Assert completion header text (`Thank you for your order!`).

## Architecture

- `src/core`: cross-page browser/page abstractions.
- `src/pages`: focused page objects (`LoginPage`, `InventoryPage`, `CartPage`).
- `src/flows`: business-level orchestration (`PurchaseFlow`).
- `src/tests`: executable smoke scenarios.
- `src/types`: shared typed contracts/constants for flow inputs and outputs.

## Troubleshooting

- If `npm run start` fails with module alias errors, run `npm run build` first.
- If browser UI is not available in your environment, set `HEADLESS=true`.
- On login failures, screenshots are saved under `SCREENSHOT_DIR`.
- If you see `spawn EPERM`, your environment is blocking Chromium process launch (sandbox/permissions policy).
