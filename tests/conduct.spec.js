import { test, expect } from "@playwright/test";
import {
  conductPath as path,
  conductTitle,
  conductDescription,
  conductOgDescription,
  conductSections,
} from "../src/conduct-data.js";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("Conduct canonical, trailing and query routes serve static article metadata and draft gate", async ({
  page,
  request,
}) => {
  for (const url of [path, `${path}/`, `${path}?source=footer`]) {
    const response = await request.get(url);
    expect(response.ok()).toBe(true);
    const html = await response.text();
    expect(html).toContain('id="speak-up"');
    expect(html).toContain('id="review"');
    expect(html).toContain('content="noindex, follow"');
    expect(html).toContain('content="article"');
  }
  await page.goto(path);
  await expect(page).toHaveTitle(conductTitle);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Code of Conduct");
  await expect(page.locator("meta[name=description]")).toHaveAttribute(
    "content",
    conductDescription,
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    conductOgDescription,
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "article",
  );
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
    "href",
    `https://www.citizenhc.co.za${path}`,
  );
  await expect(page.locator(".pn-meta")).toContainText("Draft version 1.4");
  await expect(page.locator(".pn-draft")).toContainText(
    "not yet an adopted or signed Code",
  );
  await expect(page.locator(`.site-footer a[href="${path}"]`)).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(
    page.locator('.desktop-nav > a[href="/services"]'),
  ).not.toHaveAttribute("aria-current");
});

test("six summary facts, unsigned letter, four values, four commitments, fifteen anchored sections and five breach tiers", async ({
  page,
}) => {
  await page.goto(path);
  await expect(page.locator(".pn-summary li")).toHaveCount(6);
  await expect(page.locator(".cc-quick a")).toHaveCount(3);
  await expect(page.locator(".cc-letter")).toContainText("UNSIGNED");
  await expect(page.locator(".cc-letter-signoff")).toContainText(
    "signatory pending",
  );
  await expect(page.locator(".cc-letter")).not.toContainText(
    "Chief Executive Officer",
  );
  await expect(page.locator(".cc-value h3")).toHaveText([
    "Compliant by design",
    "Sector-deep",
    "Qualification-literate",
    "Accountable",
  ]);
  await expect(page.locator(".cc-commitment")).toHaveCount(4);
  await expect(page.locator(".pn-doc-section > h2")).toHaveCount(15);
  for (const [i, [id, title]] of conductSections.entries()) {
    await expect(page.locator(`.pn-toc a[href="#${id}"]`)).toContainText(title);
    await expect(page.locator(`#${id}`)).toContainText(
      String(i + 1).padStart(2, "0"),
    );
  }
  await expect(
    page.locator(".cc-breach-table tbody th[scope=row]"),
  ).toHaveCount(5);
  await expect(page.locator(".cc-breach-table th[scope=col]")).toHaveCount(2);
  await expect(page.locator(".cc-breach-table caption")).toContainText(
    "fair process",
  );
});

test("quick links and keyboard contents anchors keep focus, history and active location", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(path);
  await page.locator('.cc-quick a[href="#speak-up"]').click();
  await expect(page).toHaveURL(/#speak-up$/);
  await expect(page.locator('.pn-toc a[href="#speak-up"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
  const link = page.locator('.pn-toc a[href="#breach"]');
  await link.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#breach")).toBeFocused();
  await expect(link).toHaveAttribute("aria-current", "location");
  const box = await page.locator("#breach").boundingBox();
  expect(box.y).toBeGreaterThan(88);
  expect(box.y).toBeLessThan(250);
  await page.goBack();
  await expect(page).toHaveURL(/#speak-up$/);
  await expect(page.locator('.pn-toc a[href="#speak-up"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
  await page.locator("#driver").evaluate((el) => el.scrollIntoView());
  await expect(page.locator('.pn-toc a[href="#driver"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
  await expect(page.locator('.pn-toc [aria-current="location"]')).toHaveCount(
    1,
  );
});

test("deep links and the scrollable sticky contents work even at short desktop height", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 650 });
  await page.goto(`${path}#review`);
  const review = page.locator('.pn-toc a[href="#review"]');
  await expect(review).toHaveAttribute("aria-current", "location");
  await expect(page.locator(".pn-toc")).toHaveCSS("position", "sticky");
  await review.focus();
  await expect(review).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Print / Save as PDF" }),
  ).toBeAttached();
});

test("Speak Up offers only confirmed routing and explains shared-inbox, anonymous and emergency limits", async ({
  page,
}) => {
  await page.goto(`${path}#speak-up`);
  await expect(page.locator(".cc-channel")).toHaveCount(3);
  const routing = page.locator(".cc-channel").nth(1);
  await expect(routing).toContainText("shared business contact");
  await expect(routing).toContainText("Do not include allegations");
  await expect(
    routing.getByRole("link", { name: "Open email to request a contact" }),
  ).toHaveAttribute("href", /^mailto:reception@citizenhc\.co\.za\?subject=/);
  await expect(routing.locator('a[href^="tel:"]')).toHaveAttribute(
    "href",
    "tel:+27114519898",
  );
  await expect(page.locator(".cc-channel-pending")).toContainText(
    "Not confirmed / not available here",
  );
  await expect(page.locator(".cc-channel-pending a")).toHaveCount(0);
  await expect(page.locator('a[href*="whistleblowing.citizenhc"]')).toHaveCount(
    0,
  );
  await expect(page.locator('a[href^="mailto:ethics@"]')).toHaveCount(0);
  await expect(page.locator('a[href*="0800000000"]')).toHaveCount(0);
  await expect(page.locator(".cc-no-retaliation")).toContainText(
    "not substantiated is not, by itself, a dishonest report",
  );
  await expect(page.locator(".cc-no-retaliation")).toContainText(
    "cannot promise anonymity",
  );
  await expect(page.locator("#speak-up").locator("..")).toContainText(
    "do not wait for this business email",
  );
  await expect(
    page.locator(".cc-speak form, .cc-speak input, .cc-speak textarea"),
  ).toHaveCount(0);
});

test("proposed gifts, sanctions, safety and support are not represented as approved facts or automatic dismissal", async ({
  page,
}) => {
  await page.goto(path);
  await expect(page.locator("#gifts").locator("..")).toContainText(
    "under-R500 threshold is proposed, not approved",
  );
  await expect(page.locator("#gifts").locator("..")).toContainText(
    "not a legal exemption",
  );
  await expect(page.locator("#breach").locator("..")).toContainText(
    "Dismissal is not automatic",
  );
  await expect(page.locator("#speak-up").locator("..")).toContainText(
    "EAP arrangement has not been confirmed",
  );
  await expect(page.locator("#driver").locator("..")).toContainText(
    "stop safely",
  );
  await expect(page.locator("main")).not.toContainText("2024/000000");
  await expect(page.locator("main")).not.toContainText("[Leadership name");
  await expect(page.locator("main")).not.toContainText("+27 (0)00");
});

test("Code reads and navigates without JavaScript and retains print guidance", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:5173${path}`);
  await expect(page.locator(".pn-doc-section")).toHaveCount(15);
  await expect(page.locator(".cc-speak")).toBeVisible();
  await expect(page.locator(".pn-print")).toBeHidden();
  await expect(page.locator(".pn-actions noscript p")).toContainText(
    "browser’s Print",
  );
  await page.locator('.cc-quick a[href="#speak-up"]').click();
  await expect(page.locator("#speak-up")).toBeInViewport();
  await expect(page.locator(".cc-channel-contact a").first()).toHaveAttribute(
    "href",
    /^mailto:reception@/,
  );
  await context.close();
});

test("browser print retains all content, reporting details and readable full-width tables", async ({
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
  for (const selector of [
    ".site-header",
    ".site-footer",
    ".pn-toc",
    ".pn-related",
    ".cc-quick",
  ])
    await expect(page.locator(selector)).toHaveCSS("display", "none");
  for (const [id] of conductSections)
    await expect(page.locator(`#${id}`)).toBeVisible();
  await expect(page.locator(".cc-speak")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  await expect(page.locator(".cc-no-retaliation")).toBeVisible();
  await expect(page.locator(".cc-breach-table")).toHaveCSS(
    "overflow-x",
    "visible",
  );
  await expect(page.locator(".cc-breach-table table")).toHaveCSS(
    "min-width",
    "0px",
  );
  const pdf = await page.pdf({ format: "A4", printBackground: false });
  expect(pdf.byteLength).toBeGreaterThan(10000);
});

test("Code is responsive at seven widths with independent table scrolling and no browser errors", async ({
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
    await expect(page.locator(".pn-toc")).toHaveCSS(
      "position",
      width >= 1024 ? "sticky" : "static",
    );
    if (width < 550) {
      const table = page.locator(".cc-breach-table");
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

test("footer links reach the Code; related documents show their actual status", async ({
  page,
}) => {
  await page.goto("/about");
  await page.locator('.site-footer a[href="/code-of-conduct"]').click();
  await expect(page).toHaveTitle(conductTitle);
  await expect(page.locator(".pn-related")).toContainText("Draft for approval");
  await page.locator('.pn-related a[href="/popia-notice"]').click();
  await expect(page.locator(".pn-draft")).toContainText("Draft for approval");
  await page.goto("/terms");
  await expect(page.locator("main")).toContainText("Draft for approval");
});

test("desktop and mobile conduct document pass automated WCAG A/AA checks", async ({
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

test("long legal content stays visible without reveal animations and with live motion preference changes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(path);
  await expect(page.locator(".pn-content")).toHaveCSS("opacity", "1");
  await expect(page.locator("main")).not.toHaveClass(/cn-motion/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".cc-value").first()).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await expect(page.locator("#review")).toHaveCSS("opacity", "1");
});
