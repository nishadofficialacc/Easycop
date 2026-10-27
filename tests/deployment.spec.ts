import { expect, test } from "@playwright/test";

test("the production build works below the GitHub Pages project path", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("requestfailed", (request) =>
    errors.push(`${request.url()}: ${request.failure()?.errorText}`),
  );
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()}: ${response.url()}`);
  });

  const document = await page.goto("./");
  expect(document?.status()).toBe(200);
  expect(
    errors,
    "The deployed entrypoint must load its scripts and styles without errors",
  ).toEqual([]);
  await expect(page.locator("h1")).toContainText("Good finds.");
  await expect(page.getByTestId("product-card")).toHaveCount(8);
  await expect(page.locator(".hero")).toHaveCSS("display", "grid");
  const stylesheets = await page
    .locator('link[rel="stylesheet"]')
    .evaluateAll((links) =>
      links.map((link) => (link as HTMLLinkElement).href),
    );
  expect(stylesheets.length).toBeGreaterThan(0);
  for (const href of stylesheets)
    expect(new URL(href).pathname).toMatch(/^\/Easycop\/assets\//);

  const images = page.locator("main img");
  await expect(images).toHaveCount(9);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (element: HTMLImageElement) =>
            element.complete && element.naturalWidth > 0,
        ),
      )
      .toBe(true);
    expect(
      new URL(await image.evaluate((element: HTMLImageElement) => element.src))
        .pathname,
    ).toMatch(/^\/Easycop\/images\//);
  }

  const favicon = await page
    .locator('link[rel="icon"]')
    .evaluate((element: HTMLLinkElement) => element.href);
  expect(new URL(favicon).pathname).toBe("/Easycop/favicon.svg");
  const iconResponse = await page.request.get(favicon);
  expect(iconResponse.status()).toBe(200);
  expect(iconResponse.headers()["content-type"]).toContain("image/svg+xml");

  await page
    .getByRole("button", {
      name: "Add Studio wireless headphones to bag",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: /^Open shopping bag/ }).click();
  const bag = page.getByRole("dialog", { name: "Your shopping bag" });
  await expect(bag).toBeVisible();
  await expect(bag.getByTestId("quantity-studio-headphones")).toHaveText("1");
  await expect(bag.getByTestId("cart-total")).toHaveText("$129.00");
  await expect
    .poll(() =>
      bag
        .locator("img")
        .evaluate(
          (element: HTMLImageElement) =>
            element.complete && element.naturalWidth > 0,
        ),
    )
    .toBe(true);
  await page.keyboard.press("Escape");
  await expect(bag).toBeHidden();

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: testInfo.outputPath("pages-desktop.png"),
    fullPage: true,
  });
  expect(
    errors,
    "No runtime errors, missing assets, or failed network requests",
  ).toEqual([]);
});

test("the static server rejects root assets and missing files instead of masking them", async ({
  request,
}) => {
  for (const path of [
    "/",
    "/assets/not-a-file.js",
    "/images/hero-headphones.jpg",
    "/Easycop/assets/not-a-file.js",
    "/Easycop/../package.json",
    "/Easycop/%2e%2e%2fpackage.json",
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
    expect(response.headers()["content-type"]).toContain("text/plain");
  }
});
