import { expect, test } from "@playwright/test";

test.describe("page metadata", () => {
  const cases = [
    { path: "/", title: "Solr - Interactive Solar System Encyclopedia" },
    { path: "/explorer", title: "3D Solar System Explorer | Solr" },
    { path: "/planets", title: "Planets & Dwarf Planets | Solr" },
    { path: "/distances", title: "Distance & Travel Time Calculator | Solr" },
    { path: "/planets/saturn", title: "Saturn | Solr" },
  ];

  for (const { path, title } of cases) {
    test(`${path} has its own title`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
    });
  }

  test("every page has a unique meta description", async ({ request }) => {
    const descriptions = new Set<string>();
    for (const { path } of cases) {
      const html = await (await request.get(path)).text();
      const match = html.match(/<meta name="description" content="([^"]+)"/);
      expect(match, path).not.toBeNull();
      descriptions.add(match![1]);
    }
    expect(descriptions.size).toBe(cases.length);
  });
});

test.describe("texture caching", () => {
  test("textures are served with long-lived cache headers", async ({ request }) => {
    const res = await request.get("/assets/textures/earth/earth_daymap_2k.webp");
    expect(res.ok()).toBe(true);
    expect(res.headers()["cache-control"]).toContain("max-age=2592000");
  });

  test("the service worker script is never cached", async ({ request }) => {
    const res = await request.get("/sw.js");
    expect(res.ok()).toBe(true);
    expect(res.headers()["cache-control"]).toContain("no-store");
  });
});
