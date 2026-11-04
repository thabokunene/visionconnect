import { test, expect } from "@playwright/test";
import {
  qualifications,
  rplSectors,
  rplTitle,
  rplDescription,
  rplOgDescription,
} from "../src/rpl-data.js";
const path = "/services/rpl";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("RPL is pre-rendered with all 25 supplied pathways and SEO metadata", async ({
  page,
  request,
}) => {
  const response = await request.get(path);
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html.match(/class="rp-qual-card"/g)).toHaveLength(25);
  expect(html).toContain(`<title>${rplTitle}</title>`);
  expect(html).toContain(rplDescription);
  expect(html).toContain(rplOgDescription);
  await page.goto(path);
  await expect(page).toHaveTitle(rplTitle);
  await expect(page.locator("h1")).toHaveText(
    "You've been doing the job for years.Let's make it official.",
  );
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
    "href",
    `https://www.citizenhc.co.za${path}`,
  );
  await expect(page.locator("meta[name=description]")).toHaveAttribute(
    "content",
    rplDescription,
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    rplOgDescription,
  );
  await expect(page.locator(".rp-qual-card")).toHaveCount(25);
  await expect(page.locator(".rp-who-card")).toHaveCount(4);
  await expect(page.locator(".rp-stage")).toHaveCount(4);
  await expect(page.locator(".rp-faq-item")).toHaveCount(7);
  await expect(page.locator(".rp-stats .cn-stat")).toHaveText([
    "1,200+",
    "10",
    "NQF 3–6",
    "8–14 wks",
  ]);
  await expect(
    page.locator('.desktop-nav > a[href="/services"]'),
  ).toHaveAttribute("aria-current", "true");
  await expect(page.locator("#what-menu-trigger")).not.toHaveAttribute(
    "aria-current",
  );
  await expect(
    page.locator('.site-footer a[href="/services/rpl"]'),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".site-footer")).toContainText("+27 11 451 9898");
  await expect(page.locator(".site-footer")).toContainText(
    "reception@citizenhc.co.za",
  );
  await expect(page.locator(".site-footer")).not.toContainText("2024/000000");
});

test("every sector chip has the correct count and filters without removing HTML or moving focus", async ({
  page,
}) => {
  await page.goto(path);
  for (const sector of rplSectors) {
    const count = qualifications.filter((q) => q.sector === sector).length;
    const chip = page.locator(`[data-rpl-filter="${sector}"]`);
    await expect(chip.locator(".rp-chip-count")).toHaveText(String(count));
    await chip.click();
    await expect(chip).toBeFocused();
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.locator('.rp-filter-chip[aria-pressed="true"]'),
    ).toHaveCount(1);
    await expect(page.locator(".rp-qual-card:not([hidden])")).toHaveCount(
      count,
    );
    await expect(page.locator(".rp-qual-card")).toHaveCount(25);
    await expect(page.locator("#qualCount")).toHaveText(
      `Showing ${count} qualification pathways in ${sector}.`,
    );
    expect(
      await page
        .locator(".rp-qual-card:not([hidden])")
        .evaluateAll((cards) => cards.map((card) => card.dataset.sector)),
    ).toEqual(Array(count).fill(sector));
  }
  await page.locator('[data-rpl-filter="all"]').click();
  await expect(page.locator(".rp-qual-card:not([hidden])")).toHaveCount(25);
  await expect(page.locator("#qualCount")).toHaveText(
    "Showing all 25 qualification pathways across ten sectors.",
  );
});

test("filter chips support keyboard selection and preserve all supplied titles and NQF levels", async ({
  page,
}) => {
  await page.goto(path);
  const chip = page.locator('[data-rpl-filter="IT & Cyber"]');
  await chip.focus();
  await chip.press("Space");
  await expect(page.locator(".rp-qual-card:not([hidden])")).toHaveCount(2);
  await page.locator('[data-rpl-filter="all"]').focus();
  await page.keyboard.press("Enter");
  for (let index = 0; index < qualifications.length; index++) {
    const card = page.locator(".rp-qual-card").nth(index);
    await expect(card.locator("h3")).toHaveText(qualifications[index].title);
    await expect(card.locator(".rp-nqf")).toHaveText(
      `NQF ${qualifications[index].nqf}`,
    );
    await expect(card.locator(".rp-candidate")).toHaveText(
      qualifications[index].candidate,
    );
  }
});

test("qualifications and native FAQs remain readable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:5173${path}`);
  await expect(page.locator(".rp-qual-card")).toHaveCount(25);
  await expect(page.locator(".rp-qual-card").last()).toBeVisible();
  await expect(page.locator("[data-rpl-filter]").first()).toBeDisabled();
  await expect(page.locator("noscript p")).toContainText(
    "All 25 pathways are shown",
  );
  const faq = page.locator(".rp-faq-item").nth(1);
  await faq.locator("summary").click();
  await expect(faq).toHaveAttribute("open", "");
  await expect(faq.locator("div")).toBeVisible();
  await expect(page.locator("#rpl-title")).toHaveCSS("opacity", "1");
  await expect(page.locator("#rpl-title")).toHaveCSS(
    "color",
    "rgb(253, 252, 249)",
  );
  await context.close();
});

test("FAQ accordion supports keyboard, exclusive expansion and genuinely hidden collapsed content", async ({
  page,
}) => {
  await page.goto(path);
  const first = page.locator(".rp-faq-item").first();
  const second = page.locator(".rp-faq-item").nth(1);
  await first.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(first.locator("div")).toBeVisible();
  await second.locator("summary").click();
  await expect(first).not.toHaveAttribute("open");
  await expect(first.locator("div")).toBeHidden();
  await expect(second.locator("div")).toContainText(
    "transport, trades, finance, engineering",
  );
  await page.keyboard.press("Space");
  await expect(second.locator("div")).toBeHidden();
  await expect(second.locator("summary")).toBeFocused();
});

test("individual and employer calls to action prefill the correct email enquiry without document collection", async ({
  page,
}) => {
  await page.route("https://maps.google.com/**", (route) => route.abort());
  for (const [query, selector, expected] of [
    [
      "rpl",
      ".rp-hero .rp-actions a:first-child",
      "free RPL eligibility screening",
    ],
    ["rpl-employer", ".rp-cta-employer a", "sponsoring an RPL cohort"],
  ]) {
    await page.goto(path);
    await page.locator(selector).click();
    await expect(page).toHaveURL(`/contact?path=${query}`);
    await expect(page.locator("[name=topic]")).toHaveValue(
      "Recognition of Prior Learning",
    );
    await expect(page.locator("[name=message]")).toHaveValue(
      new RegExp(expected),
    );
    await page.locator("[name=name]").fill("Test Person");
    await page.locator("[name=jobTitle]").fill("Technician");
    await page.locator("[name=email]").fill("person@example.org");
    await page.locator("[name=company]").fill("Example company");
    await page.getByRole("button", { name: "Prepare email enquiry" }).click();
    await expect(page.locator(".email-status")).toContainText(
      "Nothing has been sent yet",
    );
    const mailto = new URL(
      await page.locator(".email-status a").getAttribute("href"),
    );
    expect(mailto.pathname).toBe("reception@citizenhc.co.za");
    expect(mailto.searchParams.get("body")).toContain(expected);
    await expect(page.locator('input[type="file"]')).toHaveCount(0);
  }
});

test("browse anchor and existing desktop/mobile service navigation reach RPL", async ({
  page,
}) => {
  await page.goto(path);
  await page.locator('.rp-hero a[href="#qualifications"]').click();
  await expect(page).toHaveURL(`${path}#qualifications`);
  await expect(page.locator("#qual-title")).toBeInViewport();
  await page.goto("/about");
  await page.locator('.site-footer a[href="/services/rpl"]').click();
  await expect(page.locator("#rpl-title")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");
  await page.locator(".menu-toggle").click();
  await page.locator('#mobile-menu a[href="/services/rpl"]').click();
  await expect(page.locator("#rpl-title")).toBeVisible();
});

test("RPL is responsive at seven widths with no browser errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 375, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `overflow at ${width}px`,
    ).toBe(true);
    const cols = await page
      .locator(".rp-qual-grid")
      .evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
      );
    expect(cols).toBe(width < 640 ? 1 : width < 1024 ? 2 : 3);
  }
  expect(errors).toEqual([]);
});

test("RPL initial, filtered and expanded FAQ states pass desktop/mobile WCAG A/AA scans", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    for (const state of ["initial", "filtered", "faq"]) {
      if (state === "filtered")
        await page.locator('[data-rpl-filter="Health"]').click();
      if (state === "faq")
        await page.locator(".rp-faq-item summary").nth(2).click();
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(
        result.violations,
        `${width}px ${state}: ${JSON.stringify(result.violations)}`,
      ).toEqual([]);
    }
  }
});

test("reduced motion keeps timeline and counters final and silences decorative movement", async ({
  page,
}) => {
  await page.goto(path);
  await expect(page.locator("main")).not.toHaveClass(/cn-motion/);
  await expect(page.locator('[data-count="1200"]')).toHaveText("1,200+");
  expect(
    await page
      .locator("#rpl-stages")
      .evaluate((el) => el.style.getPropertyValue("--progress")),
  ).toBe("1");
  await page.locator("#rpl-faq").scrollIntoViewIfNeeded();
  expect(
    await page
      .locator("#rpl-stages")
      .evaluate((el) => el.style.getPropertyValue("--progress")),
  ).toBe("1");
  for (const value of await page
    .locator(".rp-qual-card,.rp-stage-marker,.rp-who-icon,.rp-hero .btn")
    .evaluateAll((elements) =>
      elements.map((el) => ({
        transition: getComputedStyle(el).transitionDuration,
        animation: getComputedStyle(el).animationName,
      })),
    )) {
    expect(
      value.transition
        .split(",")
        .every((duration) => parseFloat(duration) === 0),
    ).toBe(true);
    expect(value.animation).toBe("none");
  }
});

test("timeline follows scrolling and a live motion preference change restores static content", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(path);
  const progress = () =>
    page
      .locator("#rpl-stages")
      .evaluate((el) => Number(el.style.getPropertyValue("--progress")));
  expect(await progress()).toBe(0);
  await page.locator(".rp-stage").nth(2).scrollIntoViewIfNeeded();
  await expect.poll(progress).toBeGreaterThan(0);
  await page.locator("#qual-title").scrollIntoViewIfNeeded();
  await expect.poll(progress).toBe(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("main")).not.toHaveClass(/cn-motion/);
  await expect(page.locator('[data-count="1200"]')).toHaveText("1,200+");
  expect(await progress()).toBe(1);
});

test("the supplied dataset has ten sectors, twenty-five unique pathways and no invented level 6 entries", () => {
  expect(rplSectors).toHaveLength(10);
  expect(qualifications).toHaveLength(25);
  expect(new Set(qualifications.map((q) => q.title)).size).toBe(25);
  expect(
    rplSectors.map(
      (sector) => qualifications.filter((q) => q.sector === sector).length,
    ),
  ).toEqual([3, 3, 3, 3, 3, 2, 2, 2, 2, 2]);
  expect([...new Set(qualifications.map((q) => q.nqf))].sort()).toEqual([
    3, 4, 5,
  ]);
});
