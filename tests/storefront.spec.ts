import { expect, test } from "@playwright/test";
import { products } from "../src/data/products";

const resale = products.find((product) => product.kind === "resale")!;
const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("category and search filters return matching products and an empty result", async ({
  page,
}) => {
  const cards = page.getByTestId("product-card");
  await expect(cards).toHaveCount(products.length);
  await page.getByRole("button", { name: "Audio", exact: true }).click();
  await expect(cards).toHaveCount(
    products.filter((product) => product.category === "Audio").length,
  );
  await page.getByRole("button", { name: "All finds", exact: true }).click();
  const search = page.getByPlaceholder("Search your next favorite...");
  await search.fill(resale.name);
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText(resale.name);
  await search.fill("no-such-product-193746");
  await expect(cards).toHaveCount(0);
  await search.fill("");
  await expect(cards).toHaveCount(products.length);
});

test("price sorting changes the catalog order in both directions", async ({
  page,
}) => {
  const sort = page.getByRole("combobox", { name: "Sort products" });
  await sort.selectOption({ label: "Price: low to high" });
  const ascending = [...products].sort((a, b) => a.price - b.price);
  for (const [index, product] of ascending.entries()) {
    await expect(page.getByTestId("product-card").nth(index)).toContainText(
      product.name,
    );
  }
  await sort.selectOption({ label: "Price: high to low" });
  await expect(page.getByTestId("product-card").first()).toContainText(
    ascending.at(-1)!.name,
  );
});

test("saved products survive a reload and can be removed", async ({ page }) => {
  await page
    .getByRole("button", { name: `Save ${resale.name}`, exact: true })
    .click();
  await page.reload();
  await page.getByRole("button", { name: "Saved items", exact: true }).click();
  await expect(page.getByTestId("product-card")).toHaveCount(1);
  await expect(page.getByTestId("product-card").first()).toContainText(
    resale.name,
  );
  await page
    .getByTestId("product-card")
    .first()
    .getByRole("button", { name: /^(Unsave|Remove.*saved|Save) / })
    .click();
  await expect(page.getByTestId("product-card")).toHaveCount(0);
});

test("bag totals, quantities, persistence, removal, and demo order review work", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: `Add ${resale.name} to bag`, exact: true })
    .click();
  await page.getByRole("button", { name: /^Open shopping bag/ }).click();
  const bag = page.getByRole("dialog", { name: "Your shopping bag" });
  await expect(bag).toBeVisible();
  await expect(bag.getByTestId(`quantity-${resale.id}`)).toHaveText("1");
  await bag
    .getByRole("button", {
      name: `Increase ${resale.name} quantity`,
      exact: true,
    })
    .click();
  await expect(bag.getByTestId(`quantity-${resale.id}`)).toHaveText("2");
  await expect(bag.getByTestId("cart-total")).toHaveText(
    money(resale.price * 2),
  );
  await page.reload();
  await page.getByRole("button", { name: /^Open shopping bag/ }).click();
  await expect(bag.getByTestId(`quantity-${resale.id}`)).toHaveText("2");
  await bag
    .getByRole("button", {
      name: `Decrease ${resale.name} quantity`,
      exact: true,
    })
    .click();
  await expect(bag.getByTestId("cart-total")).toHaveText(money(resale.price));
  await bag.getByRole("button", { name: "Review order", exact: true }).click();
  await expect(
    page.getByText("Checkout is coming soon", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /^Open shopping bag/ }).click();
  await bag
    .getByRole("button", { name: `Remove ${resale.name}`, exact: true })
    .click();
  await expect(bag.getByTestId(`quantity-${resale.id}`)).toHaveCount(0);
});

test("product details open and Escape returns focus to the trigger", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: `View ${resale.name}`,
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(resale.description);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("retailer products use external links with sponsorship and opener protection", async ({
  page,
}) => {
  for (const product of products.filter((item) => item.kind === "affiliate")) {
    const card = page
      .getByTestId("product-card")
      .filter({ hasText: product.name });
    const link = card.getByRole("link");
    await expect(link).toHaveAttribute("href", product.url!);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /sponsored/);
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(link).toHaveAttribute("rel", /noreferrer/);
  }
});

test("product images load successfully on desktop and mobile", async ({
  page,
}, testInfo) => {
  const images = page.locator("main img");
  await expect(images).toHaveCount(products.length + 1);
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
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: testInfo.outputPath("desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
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
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: testInfo.outputPath("mobile.png"),
    fullPage: true,
  });
});

test("mobile layout fits the viewport and supports shopping", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "Explore the collection", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Explore the collection", exact: true })
    .click();
  await expect(page.getByTestId("product-card").first()).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  await page
    .getByRole("button", { name: `Add ${resale.name} to bag`, exact: true })
    .click();
  await page.getByRole("button", { name: /^Open shopping bag/ }).click();
  await expect(
    page.getByRole("dialog", { name: "Your shopping bag" }),
  ).toBeVisible();
});
