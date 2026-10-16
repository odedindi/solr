import { expect, test, type Page } from "@playwright/test";

function collectTextureRequests(page: Page) {
  const urls: string[] = [];
  page.on("request", (req) => {
    const { pathname } = new URL(req.url());
    if (pathname.startsWith("/assets/textures/")) urls.push(pathname);
  });
  return urls;
}

test.describe("explorer", () => {
  test("shows a loading screen that clears once textures have loaded", async ({ page }) => {
    await page.route("**/assets/textures/**", async (route) => {
      await new Promise((r) => setTimeout(r, 1_000));
      await route.continue();
    });
    await page.goto("/explorer", { waitUntil: "domcontentloaded" });

    const overlay = page.getByRole("status").filter({ hasText: "Loading the solar system" });
    await expect(overlay).toBeVisible();
    await expect(page.getByRole("progressbar", { name: "Texture loading progress" })).toBeVisible();

    await expect(overlay).toBeHidden({ timeout: 30_000 });
    await expect(page.locator('canvas[data-engine^="three.js"]')).toBeVisible();
  });

  test("the UI stays mounted while textures are still loading", async ({ page }) => {
    await page.route("**/assets/textures/**", async (route) => {
      await new Promise((r) => setTimeout(r, 3_000));
      await route.continue();
    });
    await page.goto("/explorer", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Solar System Explorer" })).toBeVisible();
    await expect(page.getByRole("progressbar", { name: "Texture loading progress" })).toBeVisible();
  });

  test("the loading screen can be skipped", async ({ page }) => {
    await page.route("**/assets/textures/**", async (route) => {
      await new Promise((r) => setTimeout(r, 5_000));
      await route.continue();
    });
    await page.goto("/explorer", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: /skip/i }).click();
    await expect(page.getByText("Loading the solar system")).toBeHidden();
  });

  test("loads WebP textures instead of JPG", async ({ page }) => {
    const textures = collectTextureRequests(page);
    await page.goto("/explorer", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Loading the solar system")).toBeHidden({ timeout: 30_000 });

    expect(textures.length).toBeGreaterThan(0);
    expect(textures.filter((u) => !u.endsWith(".webp"))).toEqual([]);
  });

  test("shows mouse instructions on desktop", async ({ page }) => {
    await page.goto("/explorer", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Double-click to see details/)).toBeVisible();
  });

  test("shows touch instructions on touch devices @mobile", async ({ page }) => {
    await page.goto("/explorer", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Tap a planet for info/)).toBeVisible();
  });
});

test.describe("service worker", () => {
  test("registers and caches textures for repeat visits", async ({ page }) => {
    await page.goto("/explorer", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => navigator.serviceWorker.ready);
    // The first load may happen before the worker controls the page.
    await page.reload();
    await expect(page.getByText("Loading the solar system")).toBeHidden({ timeout: 30_000 });

    const cached = await page.evaluate(async () => {
      const names = await caches.keys();
      const cache = await caches.open(names.find((n) => n.startsWith("solr-textures-"))!);
      return (await cache.keys()).map((r) => new URL(r.url).pathname);
    });
    expect(cached.some((p) => p.endsWith(".webp"))).toBe(true);
  });
});
