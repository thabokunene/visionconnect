import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  resourcePaths,
  resourceMeta,
  serviceCards,
} from "../src/resources-data.js";
import {
  insightArticles,
  insightTopics,
  readingMinutes,
} from "../src/insights-data.js";
const articlePath = `/insights/${insightArticles[0].slug}`;
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});
test("all nine resource documents serve static canonical/slash/query routes and route-specific metadata", async ({
  page,
  request,
}) => {
  for (const path of resourcePaths) {
    const meta = resourceMeta(path);
    for (const url of [path, path + "/", path + "?source=nav"]) {
      const r = await request.get(url);
      expect(r.ok()).toBeTruthy();
      const html = await r.text();
      expect(html).toContain('id="rs-title"');
      expect(html).toContain('content="noindex, follow"');
      expect(html).toContain(
        `href="${meta.nav}" aria-current="${meta.parent ? "true" : "page"}"`,
      );
      expect(html).not.toMatch(/aria-current="[^"]*"\s+aria-current=/);
      expect(html).toContain(`https://www.citizenhc.co.za${path}`);
    }
    await page.goto(path);
    await expect(page).toHaveTitle(meta.title);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      meta.description,
    );
    await expect(
      page.locator('meta[property="og:description"]'),
    ).toHaveAttribute("content", meta.description);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      meta.ogType,
    );
    await expect(
      page.locator(`.desktop-nav > a[href="${meta.nav}"]`),
    ).toHaveAttribute("aria-current", meta.parent ? "true" : "page");
  }
});
test("Services overview has all four real destinations and five useful, accessible finder responses", async ({
  page,
}) => {
  await page.goto("/services");
  await expect(page.locator(".rs-service-card")).toHaveCount(4);
  for (const s of serviceCards) {
    const card = page.locator(`#service-${s.slug}`);
    await expect(card.locator(".rs-card-link")).toHaveAttribute(
      "href",
      `/services/${s.slug}`,
    );
    await page.locator(`[name="service-need"][value="${s.slug}"]`).check();
    await expect(page.locator("#rs-recommendation strong")).toHaveText(s.title);
    await expect(page.locator("#rs-recommendation a")).toHaveAttribute(
      "href",
      `/services/${s.slug}`,
    );
  }
  await page.locator('[name="service-need"][value="scope"]').check();
  await expect(page.locator("#rs-recommendation")).toContainText(
    "Describe the problem",
  );
  await expect(page.locator("#rs-recommendation a")).toHaveAttribute(
    "href",
    "/contact?path=employer",
  );
  await page.locator(".rs-service-strip a").last().click();
  await expect(page).toHaveURL(/#service-cpd$/);
  await expect(page.locator(".rs-faq details")).toHaveCount(4);
});
test("CPD completes the four-service journey without blanket accreditation or outcome claims and contact is correctly preselected", async ({
  page,
}) => {
  await page.goto("/services/cpd");
  await expect(page.locator(".rs-principles article")).toHaveCount(3);
  await expect(page.locator(".rs-process li")).toHaveCount(4);
  await expect(page.locator("main")).toContainText(
    "No universal professional-body accreditation",
  );
  await expect(page.locator("main")).toContainText(
    "A website enquiry does not reserve a session",
  );
  await page.locator('.rs-hero a[href="/contact?path=cpd"]').click();
  await expect(page.locator('[name="topic"]')).toHaveValue(
    "Professional development",
  );
  await expect(page.locator("#contact-form-notice")).toContainText(
    "Nothing is sent or stored",
  );
  await page.goto("/employers");
  await page.locator(".em-pain").nth(3).click();
  await expect(page).toHaveURL(/\/services\/cpd$/);
  await expect(page.locator("h1")).toContainText("Build capability");
});
test("Insights features original review-labelled guides, six real articles and computed reading estimates without fictitious bylines/dates", async ({
  page,
}) => {
  await page.goto("/insights");
  await expect(page.locator(".rs-editorial-note")).toContainText(
    "editorial drafts",
  );
  await expect(page.locator(".rs-guide-grid .rs-guide-card")).toHaveCount(6);
  await expect(page.locator(".rs-feature")).toHaveAttribute(
    "href",
    articlePath,
  );
  for (const article of insightArticles) {
    const card = page.locator(`[data-guide="${article.slug}"]`);
    await expect(card.locator("a")).toHaveAttribute(
      "href",
      `/insights/${article.slug}`,
    );
    await expect(card.locator(".rs-guide-meta")).toContainText(
      `${readingMinutes(article)} min read`,
    );
  }
  await expect(page.locator("main time")).toHaveCount(0);
  await expect(page.locator('main [rel="author"]')).toHaveCount(0);
  await expect(page.locator(".rs-library-controls")).toBeVisible();
});
test("topic controls filter all six categories with announced counts and preserve keyboard focus", async ({
  page,
}) => {
  await page.goto("/insights");
  for (const topic of insightTopics) {
    const button = page.locator(`[data-topic-filter="${topic}"]`);
    await button.focus();
    await page.keyboard.press("Space");
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".rs-guide-card:visible")).toHaveCount(1);
    await expect(page.locator(".rs-guide-card:visible")).toHaveAttribute(
      "data-topic",
      topic,
    );
    await expect(page.locator("#rs-results")).toContainText("1 guide");
  }
  await page.locator('[data-topic-filter="all"]').click();
  await expect(page.locator(".rs-guide-card:visible")).toHaveCount(6);
});
test("live word-based search composes with topics, updates counts and has an accessible empty-state reset", async ({
  page,
}) => {
  await page.goto("/insights");
  await page.locator("#rs-search").fill("line-haul");
  await expect(page.locator(".rs-guide-card:visible")).toHaveCount(1);
  await expect(page.locator(".rs-guide-card:visible")).toHaveAttribute(
    "data-guide",
    insightArticles[0].slug,
  );
  await expect(page.locator("#rs-search")).toBeFocused();
  await page.locator('[data-topic-filter="Learning"]').click();
  await expect(page.locator("#rs-empty")).toBeVisible();
  await expect(page.locator("#rs-results")).toContainText("0 guides");
  await page.locator("[data-clear-insights]").click();
  await expect(page.locator("#rs-search")).toBeFocused();
  await expect(page.locator("#rs-search")).toHaveValue("");
  await expect(page.locator(".rs-guide-card:visible")).toHaveCount(6);
  await expect(page.locator("#rs-empty")).toBeHidden();
  await page.locator("#rs-search").fill("  DRIVER   ROUTE  ");
  await expect(page.locator(".rs-guide-card:visible")).toHaveCount(1);
});
test("search/topic state is shareable, survives reload/back and treats unsafe strings as text", async ({
  page,
}) => {
  await page.goto("/insights?q=attendance&topic=Learning");
  await expect(page.locator("#rs-search")).toHaveValue("attendance");
  await expect(page.locator(".rs-guide-card:visible")).toHaveCount(1);
  await expect(page.locator('[data-topic-filter="Learning"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator('[data-topic-filter="Privacy"]').click();
  await page.goBack();
  await expect(page.locator('[data-topic-filter="Learning"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.reload();
  await expect(page.locator(".rs-guide-card:visible")).toHaveCount(1);
  await page.locator("#rs-search").fill("<img src=x onerror=alert(1)>");
  await expect(page.locator("#rs-results")).toContainText(
    "<img src=x onerror=alert(1)>",
  );
  await expect(page.locator("#rs-results img")).toHaveCount(0);
  await expect(page.locator("#rs-empty")).toBeVisible();
  await page.locator("#rs-clear").click();
  await expect(page.locator(".rs-guide-card:visible")).toHaveCount(6);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
test("every guide has substantive sections, a checklist, real related links and safe guidance boundaries", async ({
  page,
}) => {
  for (const article of insightArticles) {
    await page.goto(`/insights/${article.slug}`);
    await expect(page.locator(".rs-article > section")).toHaveCount(5);
    await expect(page.locator(".rs-article-checklist li")).toHaveCount(4);
    await expect(page.locator(".rs-contents ol a")).toHaveCount(5);
    await expect(page.locator(".rs-article .rs-editorial-note")).toContainText(
      "not a statement of current law",
    );
    await expect(page.locator(".rs-guide-card")).toHaveCount(3);
    await expect(
      page.locator(`.rs-guide-card a[href="/insights/${article.slug}"]`),
    ).toHaveCount(0);
  }
  await page.goto("/insights/not-an-article");
  await expect(page.locator("h1")).toHaveText("Page not found");
});
test("guide contents preserve native fragments/history, focus the target and track location", async ({
  page,
}) => {
  await page.goto(articlePath);
  const link = page.locator('.rs-contents a[href="#agree-the-evidence"]');
  await link.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#agree-the-evidence$/);
  await expect(page.locator("#agree-the-evidence")).toBeFocused();
  await expect(link).toHaveAttribute("aria-current", "location");
  await page.locator('.rs-contents a[href="#take-it-further"]').click();
  await expect(page.locator("#take-it-further")).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/#agree-the-evidence$/);
  await expect(link).toHaveAttribute("aria-current", "location");
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 390, height: 600 },
    { width: 1440, height: 450 },
  ]) {
    await page.setViewportSize(viewport);
    await page.locator('.rs-contents a[href="#define-the-work"]').click();
    await link.click();
    // Let the scroll/observer update run, not just the synchronous click state.
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    await expect(link).toHaveAttribute("aria-current", "location");
  }
});
test("article print enhancement invokes browser print and print layout contains the full guide without site chrome", async ({
  page,
}) => {
  await page.goto(articlePath);
  await page.evaluate(() => {
    window.__printed = false;
    window.print = () => (window.__printed = true);
  });
  await page.locator(".rs-print").click();
  expect(await page.evaluate(() => window.__printed)).toBeTruthy();
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator(".site-footer")).toBeHidden();
  await expect(page.locator(".rs-contents")).toBeHidden();
  await expect(page.locator(".rs-article > section")).toHaveCount(5);
  await expect(page.locator(".rs-article-checklist")).toBeVisible();
  const pdf = await page.pdf({ format: "A4" });
  expect(pdf.length).toBeGreaterThan(10000);
});
test("Services, CPD, hub and guides retain useful content and navigation without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  for (const path of ["/services", "/services/cpd", "/insights", articlePath]) {
    await page.goto(`http://127.0.0.1:5173${path}`);
    await expect(page.locator("#rs-title")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
  await expect(page.locator(".rs-article > section")).toHaveCount(5);
  await expect(page.locator("noscript p")).toContainText("Print");
  await expect(page.locator(".rs-print")).toBeHidden();
  await page.goto("http://127.0.0.1:5173/insights");
  await expect(page.locator(".rs-guide-card")).toHaveCount(6);
  await expect(page.locator(".rs-library-controls")).toBeHidden();
  await page.locator(".rs-guide-card a").first().click();
  await expect(page.locator(".rs-article")).toBeVisible();
  await context.close();
});
test("resource layouts fit seven widths, shared mobile navigation works, and reduced motion is respected", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 360, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/services",
      "/services/cpd",
      "/insights",
      articlePath,
    ]) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width} ${path}`,
      ).toBeTruthy();
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/insights");
  await page.locator(".menu-toggle").click();
  await expect(
    page.locator('#mobile-menu a[href="/insights"]'),
  ).toHaveAttribute("aria-current", "page");
  await page.keyboard.press("Escape");
  await page.locator(".rs-guide-card").first().hover();
  expect(
    await page
      .locator(".rs-guide-card")
      .first()
      .evaluate((el) => getComputedStyle(el).transform),
  ).toBe("none");
  expect(errors).toEqual([]);
});
test("all resource page types pass desktop/mobile automated accessibility checks, including finder and empty search states", async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/services",
      "/services/cpd",
      "/insights",
      articlePath,
    ]) {
      await page.goto(path);
      expect(
        (await new AxeBuilder({ page }).analyze()).violations,
        `${width} ${path}`,
      ).toEqual([]);
    }
  }
  await page.goto("/services");
  await page.locator('[name="service-need"][value="cpd"]').check();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.goto("/insights");
  await page.locator("#rs-search").fill("no-matching-guide-xyz");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
