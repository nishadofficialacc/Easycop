# Easycop

My First Codex Project — developed using Codex.

A responsive tech and lifestyle storefront built with React, TypeScript, and Vite. Easycop combines a direct-sale product catalog with links to products from other retailers.

## Run locally

Requires Node.js 22 or later and npm.

```sh
cd /workspace/Easycop
npm ci
npm run dev -- --port 5173 --strictPort
```

For a production build:

```sh
npm run build
npm run preview -- --port 4173 --strictPort
```

## GitHub Pages

The site lives at `https://nishadofficialacc.github.io/Easycop/`. GitHub Pages must publish the compiled `dist` output, not the repository's source `index.html`; browsers cannot execute the source TypeScript file directly.

In the repository's **Settings → Pages**, set **Source** to **GitHub Actions**. The `Build and deploy Easycop` workflow builds and checks pull requests, then deploys successful pushes to `main`. It builds with `/Easycop/` as Vite's base path so JavaScript, CSS, fonts, the favicon, and product images load from the project URL. Pull requests do not deploy.

To reproduce that deployment locally and check it in a browser:

```sh
npm run test:pages
```

This builds the site and serves it strictly under `/Easycop/`, with requests to the domain root returning 404. The deployment tests verify that the storefront renders, assets load, and the shopping bag works. If the repository is renamed, update the base path in `test:pages` and the matching test-server path.

For other static hosts, use `npm run build` and publish `dist`. A successful merge alone does not deploy a Vite app unless the hosting build is configured.

## Included

- Product search, category filtering, and price sorting.
- Product detail dialogs with keyboard support.
- Saved products and a shopping bag retained in this browser using local storage.
- Quantity controls, item removal, and an order review flow.
- Clearly distinguished external retailer links with affiliate disclosure.
- Responsive desktop and mobile layouts, local fonts, and local product images.

The catalog is illustrative. Prices, brands, ratings, and product photographs are sample content and must be replaced or verified before launch. Images are visual examples, not a guarantee of the exact item a customer would receive.

### Demo image sources

The bundled images were obtained from these public repositories:

- Headphones, earbuds, and speaker: [ChamuMutezva/audiophile-ecommerce-website](https://github.com/ChamuMutezva/audiophile-ecommerce-website), `public/assets/product-*/desktop/image-product.jpg`.
- Backpack, portable drive, and monitor: [keikaavousi/fake-store-api](https://github.com/keikaavousi/fake-store-api), `public/img`.
- Sofa: [oscarlagatta/furniture-ecommerce-app](https://github.com/oscarlagatta/furniture-ecommerce-app), `assets/images/fn2.jpg`.

Commercial image rights have not been verified. Replace these demo assets with images you own or are licensed to use before launching a commercial store.

**This starter does not accept payments or submit orders.** Order review explicitly explains that checkout is not connected. There is no backend, inventory synchronization, order fulfillment, account system, or customer database. Shopping bag and saved products are local to the browser and are not shared across devices.

Retailer buttons currently use direct retailer URLs. They do not generate affiliate revenue until replaced with approved links from your affiliate programs. Confirm those programs' disclosure, linking, and product-information requirements before publishing. The website identifies links to outside retailers so customers can distinguish those purchases from Easycop products.

## Customize

- `src/data/products.ts`: catalog, prices, product copy, retailer URLs, and image paths.
- `src/App.tsx`: storefront layout and shopping interactions.
- `src/styles.css`: colors, typography, and responsive styling.
- `public/images/`: catalog photography.
- `index.html`: page title, description, and site metadata.

To take real orders, connect a commerce backend or hosted checkout, validate prices and availability on the server, and add shipping, tax, fulfillment, privacy, and returns policies appropriate to the business. Never put payment or affiliate API secrets in client-side source or `VITE_` environment variables.

## Browser checks

```sh
npm test
```

Playwright tests cover searching, category filtering, price sorting, saved-item persistence, shopping bag calculations and persistence, order review, modal keyboard behavior, retailer-link attributes, and mobile layout.

The cloud environment provides Chromium at `/usr/bin/chromium`. On another machine, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to a Chromium or Chrome executable when running tests:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium npm test
```

If neither an override nor system Chromium is available, Playwright uses its managed browser. Install it with `npx playwright install --with-deps chromium` (also done by the GitHub Actions workflow).

The test runner starts a local Vite server automatically if one is not already running. Failure screenshots and traces are saved under `test-results/`, which is ignored by Git.
