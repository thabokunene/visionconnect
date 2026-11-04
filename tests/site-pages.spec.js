import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  sitePaths,
  sitePageMeta,
  legalDrafts,
} from "../src/site-pages-data.js";
import { auditLinks } from "../scripts/link-audit.js";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});
test("all eight new site pages have full static content, route-specific metadata and canonical/slash/query handling", async ({
  page,
  request,
}) => {
  for (const path of sitePaths) {
    for (const url of [
      path,
      path === "/" ? "/?source=nav" : path + "/",
      path + "?source=nav",
    ]) {
      const r = await request.get(url);
      expect(r.status()).toBe(200);
      const html = await r.text();
      expect(html).toContain('id="rs-title"');
      expect(html).toContain('content="noindex, follow"');
      expect(html).not.toContain("This page is not published yet.");
      expect(html).not.toMatch(/aria-current="[^"]*"\s+aria-current=/);
    }
    await page.goto(path);
    await expect(page).toHaveTitle(sitePageMeta[path].title);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://www.citizenhc.co.za${path}`,
    );
    await expect(
      page.locator('meta[property="og:description"]'),
    ).toHaveAttribute("content", sitePageMeta[path].description);
    expect(
      (await page.locator("main").innerText()).split(/\s+/).length,
    ).toBeGreaterThan(150);
  }
});
test("Home has its own identity and useful journeys while the complete About page and aliases remain intact", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("People. Capability.Progress.");
  await expect(
    page.locator('section[aria-labelledby="home-paths"] .rs-service-card'),
  ).toHaveCount(4);
  await expect(
    page.locator('section[aria-labelledby="home-services"] .rs-service-card'),
  ).toHaveCount(4);
  await page
    .locator('a[href="/about"]')
    .filter({ hasText: "Read our story" })
    .click();
  await expect(page.locator("#story")).toBeVisible();
  await expect(page.locator(".section-nav")).toBeVisible();
  await page.locator(".site-header .logo").click();
  await expect(page.locator("h1")).toContainText("People. Capability.");
  await page.goto("/about/our-purpose");
  await expect(page).toHaveURL(/\/about#purpose$/);
  await expect(page.locator("#purpose")).toBeVisible();
});
test("What We Do and training proposal provide real routes and honest contact handoffs", async ({
  page,
}) => {
  await page.goto("/what-we-do");
  await expect(page.locator("#what-menu-trigger")).toHaveAttribute(
    "aria-current",
    "true",
  );
  await expect(page.locator(".rs-service-card")).toHaveCount(8);
  await page
    .locator('a[href="/training-proposal"]')
    .filter({ hasText: "Prepare your brief" })
    .click();
  await expect(page.locator(".sp-checklist li")).toHaveCount(6);
  await expect(page.locator("main")).toContainText("does not generate a quote");
  await page.locator('.rs-hero a[href="/contact?path=training"]').click();
  await expect(page.locator('[name="topic"]')).toHaveValue("Training courses");
});
test("Drivers page is candidate-focused, makes test intake clear and offers actual phone/email assistance", async ({
  page,
}) => {
  await page.goto("/drivers");
  await expect(
    page.locator('section[aria-labelledby="driver-preview"]'),
  ).toContainText("Use fictional answers");
  await expect(page.locator(".rs-process li")).toHaveCount(4);
  await expect(page.locator(".rs-faq details")).toHaveCount(4);
  await page.locator(".rs-faq summary").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".rs-faq details").first()).toHaveAttribute(
    "open",
    "",
  );
  await expect(
    page.locator(
      'section[aria-labelledby="driver-help"] a[href="tel:+27114519898"]',
    ),
  ).toBeVisible();
  await expect(
    page.locator(
      'section[aria-labelledby="driver-help"] a[href^="mailto:reception@"]',
    ),
  ).toBeVisible();
  await page.locator('.rs-hero a[href="/apply"]').click();
  await expect(page.locator("#ap-service-status")).toContainText("Test");
});
test("Accommodation guide invents no offers, partners or booking flow and events handoff is preselected", async ({
  page,
}) => {
  await page.goto("/events/hotel-offers");
  await expect(page.locator("#events-menu-trigger")).toHaveAttribute(
    "aria-current",
    "true",
  );
  await expect(page.locator("main")).toContainText("No confirmed hotel offers");
  await expect(page.locator(".sp-checklist li")).toHaveCount(6);
  await expect(page.locator("main")).toContainText(
    "does not display live room availability",
  );
  await page.locator('.rs-hero a[href="/contact?path=events"]').click();
  await expect(page.locator('[name="topic"]')).toHaveValue(
    "Events & conferences",
  );
});
test("legal pages have substantive review-labelled documents, native contents, related drafts and printable full text", async ({
  page,
}) => {
  for (const [path, draft] of Object.entries(legalDrafts)) {
    await page.goto(path);
    await expect(page.locator(".rs-editorial-note")).toContainText(
      "Draft for approval",
    );
    await expect(page.locator(".rs-article > section")).toHaveCount(
      draft.sections.length,
    );
    await expect(page.locator(".rs-contents ol a")).toHaveCount(
      draft.sections.length,
    );
    await expect(page.locator(".rs-service-card")).toHaveCount(4);
    const [id] = draft.sections[2];
    const a = page.locator(`.rs-contents a[href="#${id}"]`);
    await a.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(`#${id}`)).toBeFocused();
    await expect(a).toHaveAttribute("aria-current", "location");
    await page.evaluate(() => {
      window.__printed = false;
      window.print = () => (window.__printed = true);
    });
    await page.locator(".rs-print").click();
    expect(await page.evaluate(() => window.__printed)).toBeTruthy();
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".site-header")).toBeHidden();
    await expect(page.locator(".rs-article > section").last()).toBeVisible();
    expect((await page.pdf({ format: "A4" })).length).toBeGreaterThan(10000);
    await page.emulateMedia({ media: "screen" });
  }
  await page.goto("/terms#promotions");
  await expect(
    page.locator('section[aria-labelledby="promotions"]'),
  ).toContainText("SPRING15");
  await expect(
    page.locator('section[aria-labelledby="promotions"]'),
  ).toContainText("written confirmation");
});
test("old cross-links now disclose drafts rather than missing documents and mobile navigation reaches CPD/proposals", async ({
  page,
}) => {
  for (const path of ["/popia-notice", "/code-of-conduct", "/employers"]) {
    await page.goto(path);
    await expect(page.locator("main")).not.toContainText("not yet published");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator(".menu-toggle").click();
  await expect(
    page.locator('#mobile-menu a[href="/services/cpd"]'),
  ).toBeVisible();
  await page
    .locator("#mobile-menu summary")
    .filter({ hasText: "What we do" })
    .click();
  await page.locator('#mobile-menu a[href="/training-proposal"]').click();
  await expect(page).toHaveURL(/\/training-proposal$/);
  await expect(page.locator("h1")).toContainText("learning brief");
});
test("all eight new pages read without JavaScript, including Home/About separation and complete legal content", async ({
  browser,
}) => {
  const c = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const p = await c.newPage();
  for (const path of sitePaths) {
    await p.goto(`http://127.0.0.1:5173${path}`);
    await expect(p.locator("#rs-title")).toBeVisible();
    await expect(p.locator("h1")).toHaveCount(1);
    if (legalDrafts[path]) {
      await expect(p.locator(".rs-print")).toBeHidden();
      await expect(p.locator(".rs-article > section")).toHaveCount(
        legalDrafts[path].sections.length,
      );
    }
  }
  await p.goto("http://127.0.0.1:5173/about");
  await expect(p.locator("#story")).toBeVisible();
  await p.locator(".site-header .logo").click();
  await expect(p.locator("h1")).toContainText("People. Capability.");
  await c.close();
});
test("all new page types fit seven widths and emit no browser errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [320, 360, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of sitePaths) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width} ${path}`,
      ).toBeTruthy();
    }
  }
  expect(errors).toEqual([]);
});
test("all new pages pass desktop/mobile automated accessibility checks", async ({
  page,
}) => {
  test.setTimeout(60000);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of sitePaths) {
      await page.goto(path);
      expect(
        (await new AxeBuilder({ page }).analyze()).violations,
        `${width} ${path}`,
      ).toEqual([]);
    }
  }
});
test("sitewide rendered-link crawl finds no missing pages, fragments, unsafe links or placeholder destinations", async ({
  browser,
}) => {
  test.setTimeout(120000);
  const result = await auditLinks(browser, "http://127.0.0.1:5173");
  expect(result.routes).toBeGreaterThan(50);
  expect(result.internalLinks).toBeGreaterThan(250);
  expect(result.errors).toEqual([]);
});
