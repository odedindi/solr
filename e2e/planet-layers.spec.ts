import { expect, test, type Page } from "@playwright/test";
import { textureConfigs } from "../lib/texture-config";

const hiResUrls = new Set(
  Object.values(textureConfigs).flatMap((cfg) =>
    cfg.layers.flatMap((l) => [l.urlHiRes, l.urlHiResWebP]).filter((u): u is string => !!u),
  ),
);
const isHiRes = (url: string) => hiResUrls.has(new URL(url).pathname);
// Role-based so the fading (aria-hidden) overlay already counts as dismissed.
const loadingOverlay = (page: Page) =>
  page.getByRole("status").filter({ hasText: "Loading the solar system" });

async function openEarth(page: Page) {
  await page.goto("/planets/earth", { waitUntil: "domcontentloaded" });
  await expect(loadingOverlay(page)).toBeHidden({ timeout: 30_000 });
}

async function openPanel(page: Page) {
  const toggle = page.getByRole("button", { name: /Layers & View/ });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
}

test.describe("planet layers panel", () => {
  test("switches view mode and persists it across reloads", async ({ page }) => {
    await openEarth(page);
    await openPanel(page);

    const realistic = page.getByRole("radio", { name: "realistic" });
    const enhanced = page.getByRole("radio", { name: "enhanced" });
    await expect(realistic).toHaveAttribute("aria-checked", "true");

    await enhanced.click();
    await expect(enhanced).toHaveAttribute("aria-checked", "true");
    await expect(page.getByText(/Educational exaggeration/)).toBeVisible();

    await page.reload({ waitUntil: "domcontentloaded" });
    // The panel's expanded state is persisted too.
    await expect(page.getByRole("radio", { name: "enhanced" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  test("disables dependent layers when their requirement is switched off", async ({ page }) => {
    await openEarth(page);
    await openPanel(page);

    const surface = page.getByRole("checkbox", { name: "Surface Imagery", exact: true });
    const relief = page.getByRole("checkbox", { name: /^Terrain Relief/ });
    const clouds = page.getByRole("checkbox", { name: /^Clouds/ });

    await expect(relief).toBeEnabled();
    await surface.click();
    await expect(surface).toHaveAttribute("aria-checked", "false");
    await expect(relief).toBeDisabled();
    await expect(relief).toHaveAttribute("title", /Requires Surface Imagery/);
    await expect(clouds).toBeEnabled();

    await surface.click();
    await expect(relief).toBeEnabled();
    await expect(relief).toHaveAttribute("aria-checked", "true");
  });

  test("reset restores the default layers and view mode", async ({ page }) => {
    await openEarth(page);
    await openPanel(page);

    const reset = page.getByRole("button", { name: "Reset" });
    await expect(reset).toBeDisabled();

    await page.getByRole("radio", { name: "enhanced" }).click();
    await page.getByRole("checkbox", { name: /^Clouds/ }).click();
    await expect(reset).toBeEnabled();

    await reset.click();
    await expect(page.getByRole("radio", { name: "realistic" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(page.getByRole("checkbox", { name: /^Clouds/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(reset).toBeDisabled();
  });
});

test.describe("planet textures", () => {
  // page.route() can't see requests handled by our service worker.
  test.use({ serviceWorkers: "block" });

  test("the loading screen does not wait for hi-res maps", async ({ page }) => {
    const hiResRequests: string[] = [];
    await page.route("**/assets/textures/**", async (route) => {
      if (!isHiRes(route.request().url())) return route.continue();
      hiResRequests.push(route.request().url());
      // Effectively never arrives; the overlay must still clear.
      await new Promise((r) => setTimeout(r, 60_000));
      await route.continue().catch(() => {});
    });

    await page.goto("/planets/mars", { waitUntil: "domcontentloaded" });
    const overlay = loadingOverlay(page);
    await expect(overlay).toBeVisible();
    // Well below SceneLoader's 20 s safety cap.
    await expect(overlay).toBeHidden({ timeout: 15_000 });
    await expect.poll(() => hiResRequests.length).toBeGreaterThan(0);
  });

  test("touch devices skip hi-res maps @mobile", async ({ page }) => {
    const hiResRequests: string[] = [];
    page.on("request", (req) => {
      if (isHiRes(req.url())) hiResRequests.push(req.url());
    });

    await openEarth(page);
    await page.waitForLoadState("networkidle");
    expect(hiResRequests).toEqual([]);
  });
});
