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
- `npm run start`: Execute the compiled output from `dist/index.js`.
- `npm run lint`: Run ESLint on all TypeScript files in `src`.
- `npm run test`: Run login smoke tests (valid login + invalid login).
- `npm run format`: Format files with Prettier.

## Current Scope

- Implemented:
  - Browser lifecycle manager.
  - Base page helpers.
  - Login page automation and error detection.
  - Smoke tests for login success/failure.
- Pending:
  - Inventory, cart, and checkout flow implementation.

## Troubleshooting

- If `npm run start` fails with module alias errors, run `npm run build` first.
- If browser UI is not available in your environment, set `HEADLESS=true`.
- On login failures, screenshots are saved under `SCREENSHOT_DIR`.
- If you see `spawn EPERM`, your environment is blocking Chromium process launch (sandbox/permissions policy).
