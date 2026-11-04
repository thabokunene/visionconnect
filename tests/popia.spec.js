import { test, expect } from "@playwright/test";
import {
  popiaPath as path,
  popiaTitle,
  popiaDescription,
  popiaOgDescription,
  popiaSections,
  regulator,
} from "../src/popia-data.js";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("POPIA static routes, article metadata, draft indexing gate and footer", async ({
  page,
  request,
}) => {
  for (const route of [path, `${path}/`, `${path}?from=footer`]) {
    const response = await request.get(route);
    expect(response.ok()).toBe(true);
    const html = await response.text();
    expect(html).toContain('id="who-we-are"');
    expect(html).toContain('id="complaints"');
    expect(html).toContain('content="article"');
    expect(html).toContain('content="noindex, follow"');
  }
  await page.goto(path);
  await expect(page).toHaveTitle(popiaTitle);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("POPIA Notice");
  await expect(page.locator("meta[name=description]")).toHaveAttribute(
    "content",
    popiaDescription,
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    popiaOgDescription,
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "article",
  );
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
    "href",
    `https://www.citizenhc.co.za${path}`,
  );
  await expect(
    page.locator('.site-footer a[href="/popia-notice"]'),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.locator('.desktop-nav > a[href="/services"]'),
  ).not.toHaveAttribute("aria-current");
  await expect(page.locator(".pn-draft")).toContainText("Draft for approval");
  await expect(page.locator(".pn-meta")).toContainText(
    "Proposed effective date: 1 November 2026",
  );
  await expect(page.locator(".pn-hero")).toHaveCSS("border-top-width", "4px");
});

test("six summary facts, twelve stable numbered anchors, two semantic tables and three callouts", async ({
  page,
}) => {
  await page.goto(path);
  await expect(page.locator(".pn-summary ol > li")).toHaveCount(6);
  await expect(page.locator(".pn-doc-section > h2")).toHaveCount(12);
  await expect(page.locator(".pn-toc ol a")).toHaveCount(12);
  for (const [i, [id, title]] of popiaSections.entries()) {
    await expect(page.locator(`.pn-toc ol a[href="#${id}"]`)).toContainText(
      title,
    );
    await expect(page.locator(`#${id}`)).toContainText(
      String(i + 1).padStart(2, "0"),
    );
  }
  await expect(page.locator(".pn-callout")).toHaveCount(3);
  await expect(page.locator(".pn-warning")).toHaveCount(1);
  await expect(page.locator(".pn-table-scroll table")).toHaveCount(2);
  await expect(page.locator(".pn-table-scroll caption")).toHaveCount(2);
  await expect(
    page.locator(".pn-table-scroll tbody th[scope=row]"),
  ).toHaveCount(16);
  await expect(
    page.locator(".pn-table-scroll thead th[scope=col]"),
  ).toHaveCount(6);
});

test("contents links support keyboard, focus targets, scrolling and location tracking", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(path);
  const link = page.locator('.pn-toc a[href="#retention"]');
  await link.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#retention$/);
  await expect(page.locator("#retention")).toBeFocused();
  await expect(link).toHaveAttribute("aria-current", "location");
  const position = await page.locator("#retention").boundingBox();
  expect(position.y).toBeGreaterThan(88);
  expect(position.y).toBeLessThan(320);
  await page.locator("#security").evaluate((el) => el.scrollIntoView());
  await expect(page.locator('.pn-toc a[href="#security"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
  await expect(page.locator('.pn-toc [aria-current="location"]')).toHaveCount(
    1,
  );
  await expect(page.locator(".pn-toc")).toHaveCSS("position", "sticky");
});

test("direct fragments, same-document navigation and browser back select the correct section", async ({
  page,
}) => {
  await page.goto(`${path}#your-rights`);
  await expect(page.locator('.pn-toc a[href="#your-rights"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
  await page.locator('.pn-toc a[href="#marketing"]').click();
  await expect(page.locator('.pn-toc a[href="#marketing"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
  await page.goBack();
  await expect(page).toHaveURL(/#your-rights$/);
  await expect(page.locator('.pn-toc a[href="#your-rights"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
});

test("legal copy uses current official contacts and does not invent officers, forms, controls or a live privacy inbox", async ({
  page,
}) => {
  await page.goto(path);
  await expect(page.locator("main")).toContainText(regulator.address);
  await expect(page.locator("main")).toContainText(regulator.email);
  await expect(page.locator("main")).not.toContainText("JD House");
  await expect(page.locator("main")).not.toContainText("2024/000000");
  await expect(page.locator("main")).not.toContainText("[Information Officer");
  await expect(page.locator('a[href^="mailto:privacy@"]')).toHaveCount(0);
  await expect(page.locator(".pn-contact-card").first()).toContainText(
    "await confirmation",
  );
  await expect(page.locator("#exercise-rights").locator("..")).toContainText(
    "POPIA Form 1:",
  );
  await expect(page.locator("#exercise-rights").locator("..")).toContainText(
    "POPIA Form 2:",
  );
  await expect(page.locator("#marketing").locator("..")).toContainText(
    "sessionStorage",
  );
  await expect(page.locator("#marketing").locator("..")).toContainText(
    "Google Maps",
  );
  await expect(page.locator("#retention").locator("..")).toContainText(
    "proposed schedule, awaiting approval",
  );
});

test("print button calls browser print and print CSS retains full readable content without chrome", async ({
  page,
}) => {
  await page.goto(path);
  await page.evaluate(() => {
    window.printCalls = 0;
    window.print = () => window.printCalls++;
  });
  await page.getByRole("button", { name: "Print / Save as PDF" }).click();
  expect(await page.evaluate(() => window.printCalls)).toBe(1);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".site-header")).toHaveCSS("display", "none");
  await expect(page.locator(".site-footer")).toHaveCSS("display", "none");
  await expect(page.locator(".pn-toc")).toHaveCSS("display", "none");
  await expect(page.locator(".pn-related")).toHaveCSS("display", "none");
  await expect(page.locator(".pn-summary")).toHaveCSS(
    "background-color",
    "rgb(245, 245, 245)",
  );
  await expect(page.locator(".pn-contacts")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  for (const [id] of popiaSections)
    await expect(page.locator(`#${id}`)).toBeVisible();
  const print = await page
    .locator(".pn-table-scroll")
    .first()
    .evaluate((el) => ({
      overflow: getComputedStyle(el).overflowX,
      minWidth: getComputedStyle(el.querySelector("table")).minWidth,
    }));
  expect(print).toEqual({ overflow: "visible", minWidth: "0px" });
  expect(
    await page
      .locator(`a[href="${regulator.website}"]`)
      .first()
      .evaluate((el) => getComputedStyle(el, "::after").content),
  ).toContain(regulator.website);
  const pdf = await page.pdf({ format: "A4", printBackground: false });
  expect(pdf.byteLength).toBeGreaterThan(10000);
});

test("no-JavaScript notice has all anchors, visible text, summary and browser-print guidance", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:5173${path}`);
  await expect(page.locator(".pn-doc-section")).toHaveCount(12);
  await expect(page.locator(".pn-print")).toBeHidden();
  await expect(page.locator(".pn-actions noscript p")).toContainText(
    "browser’s Print",
  );
  await page.locator('.pn-toc a[href="#your-rights"]').click();
  await expect(page).toHaveURL(/#your-rights$/);
  await expect(page.locator("#your-rights")).toBeInViewport();
  await expect(page.locator(".pn-summary")).toHaveCSS("opacity", "1");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("#complaints")).toBeVisible();
  await context.close();
});

test("responsive layout preserves mobile contents and independent table scrolling at seven widths", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [320, 375, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${width}px document overflow`,
    ).toBe(true);
    await expect(page.locator(".pn-toc")).toBeVisible();
    await expect(page.locator(".pn-toc")).toHaveCSS(
      "position",
      width >= 1024 ? "sticky" : "static",
    );
    if (width < 640) {
      const table = page.locator(".pn-table-scroll").first();
      expect(
        await table.evaluate((el) => el.scrollWidth > el.clientWidth),
      ).toBe(true);
      await table.focus();
      await page.keyboard.press("ArrowRight");
      await expect
        .poll(() => table.evaluate((el) => el.scrollLeft))
        .toBeGreaterThan(0);
    }
  }
  expect(errors).toEqual([]);
});

test("footer reaches POPIA and related draft documents remain honest", async ({
  page,
}) => {
  await page.goto("/about");
  await page.locator('.site-footer a[href="/popia-notice"]').click();
  await expect(page.locator("h1")).toHaveText("POPIA Notice");
  await expect(page.locator(".pn-related")).toContainText(
    "drafts for approval",
  );
  for (const route of ["/terms", "/privacy-policy", "/paia-manual"]) {
    await page.goto(route);
    await expect(page.locator("main")).toContainText("Draft for approval");
  }
});

test("desktop/mobile document and print control pass automated WCAG A/AA checks", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(result.violations, JSON.stringify(result.violations)).toEqual([]);
  }
});

test("legal content never waits for reveal animation, including live reduced-motion changes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(path);
  await expect(page.locator(".pn-content")).toHaveCSS("opacity", "1");
  await expect(page.locator("main")).not.toHaveClass(/cn-motion/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("#complaints")).toHaveCSS("opacity", "1");
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
});
