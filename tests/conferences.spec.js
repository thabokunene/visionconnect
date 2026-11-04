import { test, expect } from "@playwright/test";
const path = "/what-we-do/conferences";

test("conference route, metadata, content and verified contact details", async ({
  page,
}) => {
  await page.goto(path);
  await expect(page).toHaveTitle("Conferences | Citizen Human Capital");
  await expect(page.locator("h1")).toHaveText("Conferences");
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
    "href",
    "https://www.citizenhc.co.za/what-we-do/conferences",
  );
  await expect(page.locator("meta[name=description]")).toHaveAttribute(
    "content",
    /High-impact conferences/,
  );
  await expect(page.locator(".cn-event")).toHaveCount(8);
  await expect(page.locator(".cn-cap-card")).toHaveCount(3);
  await expect(page.locator(".cn-awards-card")).toHaveCount(3);
  await expect(page.locator(".cn-footer-grid > div")).toHaveCount(5);
  await expect(
    page.locator('.cn-footer a[href="tel:+27114519898"]'),
  ).toBeVisible();
  await expect(
    page.locator('.cn-footer a[href="mailto:reception@citizenhc.co.za"]'),
  ).toBeVisible();
});

test("hero and events searches synchronize and match title, sector and location", async ({
  page,
}) => {
  await page.goto(path);
  const hero = page.locator("#eventSearch");
  const filter = page.locator("#conference-filter");
  await hero.fill("HEALTH johannesburg");
  await expect(page.locator(".cn-results")).toContainText("2 events");
  await expect(filter).toHaveValue("HEALTH johannesburg");
  await hero.press("Enter");
  await expect(filter).toBeFocused();
  await expect(page.locator(".cn-event:not([hidden])")).toHaveCount(2);
  await filter.fill("Ubuntu");
  await expect(hero).toHaveValue("Ubuntu");
  await expect(page.locator(".cn-event:not([hidden])")).toHaveCount(1);
  await expect(page.locator(".cn-results")).toContainText("1 event");
  await filter.fill("  <script>alert(1)</script>  ");
  await expect(page.locator(".cn-event:not([hidden])")).toHaveCount(0);
  await expect(page.locator(".cn-empty")).toBeVisible();
  await expect(page.locator("main script")).toHaveCount(0);
  await page.locator("[data-clear-search]").click();
  await expect(filter).toHaveValue("");
  await expect(hero).toHaveValue("");
  await expect(page.locator(".cn-event:not([hidden])")).toHaveCount(8);
  await expect(page.locator(".cn-empty")).toBeHidden();
});

test("sector filtering composes with search and has a recoverable empty state", async ({
  page,
}) => {
  await page.goto(path);
  await page.locator("[data-sector-filter]").selectOption("health");
  await expect(page.locator(".cn-event:not([hidden])")).toHaveCount(4);
  await page.locator("#conference-filter").fill("Cape Town");
  await expect(page.locator(".cn-event:not([hidden])")).toHaveCount(1);
  await page
    .locator("[data-sector-filter]")
    .selectOption("technology-cyber-data");
  await expect(page.locator(".cn-empty")).toBeVisible();
  await page.locator("[data-clear-search]").click();
  await expect(page.locator("[data-sector-filter]")).toHaveValue("");
  await expect(page.locator(".cn-event:not([hidden])")).toHaveCount(8);
});

test("promo dismissal persists for this browser session and restores focus", async ({
  page,
}) => {
  await page.goto(path);
  await expect(page.locator(".cn-promo")).toContainText("SPRING15");
  await page
    .getByRole("button", { name: "Dismiss promotional banner" })
    .click();
  await expect(page.locator(".cn-promo")).toBeHidden();
  await expect(page.locator(".site-header .logo")).toBeFocused();
  await page.reload();
  await expect(page.locator(".cn-promo")).toBeHidden();
});

test("stat counters finish and do not restart when revisited", async ({
  page,
}) => {
  await page.goto(path);
  await page.locator(".cn-stats").scrollIntoViewIfNeeded();
  await expect(page.locator('[data-count="3000"]')).toHaveText("3,000+");
  await expect(page.locator('[data-count="10000"]')).toHaveText("10,000+");
  await page.locator(".cn-know").scrollIntoViewIfNeeded();
  await page.locator(".cn-stats").scrollIntoViewIfNeeded();
  await expect(page.locator('[data-count="3000"]')).toHaveText("3,000+");
});

test("reduced motion shows static content and final statistics", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(path);
  await expect(page.locator("main")).not.toHaveClass(/cn-motion/);
  await expect(page.locator('[data-count="26"]')).toHaveText("26");
  await expect(page.locator('[data-count="3000"]')).toHaveText("3,000+");
  expect(
    await page
      .locator(".cn-zebra")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
  expect(
    await page
      .locator(".cn-heading")
      .first()
      .evaluate((element) => getComputedStyle(element).opacity),
  ).toBe("1");
});

test("event catalogue, sector pages, details and contact handoff work", async ({
  page,
}) => {
  await page.goto(path);
  await page.locator('.cn-event[href="/events/nursing-and-the-law"]').click();
  await expect(page.locator("h1")).toHaveText("Nursing & The Law");
  await expect(page.locator("main")).toContainText("10–11 Nov 2026");
  await expect(page.locator("main")).toContainText(
    "Online bookings are not available",
  );
  // The contact page contains an external map, which is independent of this route test.
  await page.route("https://maps.google.com/**", (route) => route.abort());
  await page.getByRole("link", { name: "Enquire about this event" }).click();
  await expect(page.locator("[name=topic]")).toHaveValue(
    "Events & conferences",
  );
  await expect(page.locator("[name=message]")).toHaveValue(/Nursing & The Law/);
  await page.goto("/events/health");
  await expect(page.locator(".cn-event:not([hidden])")).toHaveCount(4);
  await page.goto("/events/energy-utilities");
  await expect(page.locator(".cn-empty")).toBeVisible();
  await page.goto(path);
  await page.getByRole("link", { name: "Browse all conferences" }).click();
  await expect(page.locator("h1")).toHaveText("All conferences");
  await expect(page.locator(".cn-event:not([hidden])")).toHaveCount(8);
});

test("conferences accessible in desktop and mobile navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/about");
  await page.locator("#what-menu-trigger").click();
  await expect(page.locator("#what-menu")).toBeVisible();
  await page.locator('#what-menu a[href="/what-we-do/conferences"]').click();
  await expect(page.locator("h1")).toHaveText("Conferences");
  await expect(page.locator("#what-menu-trigger")).toHaveAttribute(
    "aria-current",
    "true",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");
  await page.locator(".menu-toggle").click();
  await page
    .locator(".mobile-what summary")
    .filter({ hasText: "What we do" })
    .click();
  await page.locator('#mobile-menu a[href="/what-we-do/conferences"]').click();
  await expect(page.locator("h1")).toHaveText("Conferences");
});

test("conference and event routes fit phone, tablet and desktop without browser errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 375, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [path, "/events", "/events/nursing-leaders-summit"]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} overflow at ${width}px`,
      ).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});

test("conference and event routes pass automated WCAG A/AA checks", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [path, "/events", "/events/nursing-and-the-law"]) {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        results.violations,
        `${route} accessibility at ${width}px`,
      ).toEqual([]);
    }
  }
});
