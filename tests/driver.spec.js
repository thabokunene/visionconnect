import { test, expect } from "@playwright/test";
import {
  driverPath as path,
  driverTitle,
  driverDescription,
  driverOgDescription,
} from "../src/driver-data.js";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("driver static document, metadata and shared navigation", async ({
  page,
  request,
}) => {
  for (const url of [path, `${path}/`, `${path}?source=test`]) {
    const response = await request.get(url);
    expect(response.ok()).toBe(true);
    const html = await response.text();
    expect(html).toContain("Six checks. Documented.");
    expect(html).toContain("Illustrative sample");
    expect(html).toContain('scope="row"');
  }
  await page.goto(path);
  await expect(page).toHaveTitle(driverTitle);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText(
    "Qualified drivers,properly verified.",
  );
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
    "href",
    `https://www.citizenhc.co.za${path}`,
  );
  await expect(page.locator("meta[name=description]")).toHaveAttribute(
    "content",
    driverDescription,
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    driverOgDescription,
  );
  await expect(page.locator(`.site-footer a[href="${path}"]`)).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.locator(".site-footer")).toContainText(
    "reception@citizenhc.co.za",
  );
  await expect(page.locator(".site-footer")).toContainText("+27 11 451 9898");
  await expect(page.locator(".site-footer")).not.toContainText("2024/000000");
});

test("six checks, a labelled fictional dossier and explicit date meanings", async ({
  page,
}) => {
  await page.goto(path);
  await expect(page.locator(".dr-check")).toHaveCount(6);
  await expect(page.locator(".dr-dossier-row")).toHaveCount(6);
  await expect(page.locator(".dr-dossier")).toContainText("Fictional record");
  await expect(page.locator(".dr-dossier")).toContainText("Expires 2027-03-22");
  await expect(page.locator(".dr-dossier")).toContainText("Checked 2026-11-01");
  await expect(page.locator(".dr-dossier")).not.toHaveAttribute("role", "img");
  await expect(page.locator(".dr-checks")).toContainText("Consent-based");
  await expect(page.locator(".dr-checks")).toContainText(
    "separate practical assessment",
  );
  await expect(page.locator(".dr-compliance")).toContainText(
    "section 198A deeming",
  );
  await expect(page.locator("main")).not.toContainText("criminal-clean");
  await expect(page.locator("main")).not.toContainText("96%");
});

test("comparison anchor, row headers, five timeline stages, coverage and rate cards", async ({
  page,
}) => {
  await page.goto(path);
  await page.getByRole("link", { name: "Compare engagement models" }).click();
  await expect(page).toHaveURL(/#compare$/);
  await expect(page.locator(".dr-compare")).toBeVisible();
  await expect(page.locator(".dr-compare tbody th[scope=row]")).toHaveCount(6);
  await expect(page.locator(".dr-compare thead th[scope=col]")).toHaveCount(3);
  await expect(page.locator(".dr-timeline > li")).toHaveCount(5);
  await expect(page.locator(".dr-day")).toHaveText([
    "D0",
    "D1–2",
    "D3–5",
    "D5–7",
    "D5–10",
  ]);
  await expect(page.locator(".dr-code-chips li")).toHaveText([
    "Code 8",
    "Code 10",
    "Code 14",
    "EC",
  ]);
  await expect(page.locator(".dr-provinces li")).toHaveCount(4);
  await expect(page.locator(".dr-rate")).toHaveCount(2);
  await expect(page.locator(".dr-rate-featured")).toContainText(
    "itemised scope",
  );
});

test("FAQ native disclosure supports keyboard and exclusive opening", async ({
  page,
}) => {
  await page.goto(path);
  const summaries = page.locator(".dr-faq-item summary");
  await expect(summaries).toHaveCount(5);
  await summaries.nth(0).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".dr-faq-item").nth(0)).toHaveAttribute("open", "");
  await summaries.nth(1).click();
  await expect(page.locator(".dr-faq-item").nth(0)).not.toHaveAttribute(
    "open",
    "",
  );
  await expect(page.locator(".dr-faq-item").nth(1)).toHaveAttribute("open", "");
  await expect(page.locator(".dr-faq-item").nth(1)).toContainText("198A");
  await page.keyboard.press("Space");
  await expect(page.locator(".dr-faq-item").nth(1)).not.toHaveAttribute(
    "open",
    "",
  );
});

test("static no-JavaScript document keeps checks, comparison, FAQ and contact links usable", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:5173${path}`);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".dr-check")).toHaveCount(6);
  await expect(page.locator(".dr-compare")).toBeVisible();
  await page.locator(".dr-faq-item summary").nth(1).click();
  await expect(page.locator(".dr-faq-item").nth(1).locator("p")).toBeVisible();
  await expect(page.locator(".dr-employer-cta a")).toHaveAttribute(
    "href",
    "/contact?path=employer",
  );
  await expect(page.locator(".dr-driver-cta a")).toHaveAttribute(
    "href",
    "/apply",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});

test("employer CTA prepares an email and driver CTA reaches the test application", async ({
  page,
}) => {
  await page.goto(path);
  await page.locator(".dr-employer-cta a").click();
  await expect(page.locator("[name=topic]")).toHaveValue(
    "Driver recruitment & labour broking",
  );
  await expect(page.locator("[name=message]")).toHaveValue(/licence code/);
  await page.locator("[name=name]").fill("Test Employer");
  await page.locator("[name=jobTitle]").fill("Fleet manager");
  await page.locator("[name=email]").fill("test@example.com");
  await page.locator("[name=company]").fill("Example Fleet");
  await page.getByRole("button", { name: "Prepare email enquiry" }).click();
  await expect(page.locator(".email-status")).toContainText(
    "Nothing has been sent",
  );
  await expect(page.locator(".email-status a")).toHaveAttribute(
    "href",
    /mailto:reception@citizenhc.co.za/,
  );
  await page.goto(path);
  await page.locator(".dr-driver-cta a").click();
  await expect(page).toHaveURL(/\/apply$/);
  await expect(page.locator("#ap-service-status")).toContainText("Test mode");
  await expect(page.locator("#ap-heading-0")).toBeVisible();
});

test("responsive layout has no document overflow and the table scrolls independently", async ({
  page,
}) => {
  for (const width of [320, 375, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${width}px overflow`,
    ).toBe(true);
    if (width < 690) {
      const table = page.locator(".dr-table-scroll");
      expect(
        await table.evaluate((el) => el.scrollWidth > el.clientWidth),
      ).toBe(true);
      await table.focus();
      await page.keyboard.press("ArrowRight");
      await expect
        .poll(() => table.evaluate((el) => el.scrollLeft))
        .toBeGreaterThan(0);
    }
    expect(
      parseFloat(
        await page
          .locator("h1")
          .evaluate((el) => getComputedStyle(el).fontSize),
      ),
    ).toBeLessThanOrEqual(68);
  }
});

test("desktop and mobile accessibility, including open legal FAQ", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    await page.locator(".dr-faq-item summary").nth(1).click();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(result.violations, JSON.stringify(result.violations)).toEqual([]);
  }
});

test("reduced motion keeps content visible and removes hover transitions", async ({
  page,
}) => {
  await page.goto(path);
  await expect(page.locator("main")).not.toHaveClass(/cn-motion/);
  await expect(page.locator(".dr-check").first()).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  await expect(page.locator("main")).toHaveClass(/cn-motion/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("main")).not.toHaveClass(/cn-motion/);
  await expect(page.locator(".dr-dossier")).toHaveCSS("opacity", "1");
});
