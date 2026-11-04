import { test, expect } from "@playwright/test";
import {
  formatDateRange,
  southAfricaToday,
  upcomingSessions,
  sessions,
  courseTitles,
} from "../src/training-data.js";
const path = "/what-we-do/training-courses";

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-04T08:00:00+02:00") });
});

test("training metadata, featured catalogue, reasons and supplied statistics", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(path);
  await expect(page).toHaveTitle("Training Courses | Citizen Human Capital");
  await expect(page.locator("h1")).toHaveText("Training Courses");
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
    "href",
    `https://www.citizenhc.co.za${path}`,
  );
  await expect(page.locator("meta[name=description]")).toHaveAttribute(
    "content",
    /Premium in-person training courses/,
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    "Unlock your potential with premium training courses.",
  );
  await expect(page.locator(".tr-course-card")).toHaveCount(12);
  await expect(page.locator(".tr-reason")).toHaveCount(6);
  await expect(page.locator('[data-count="40"]')).toHaveText("40+");
  await expect(page.locator('[data-count="250"]')).toHaveText("250+");
  await expect(page.locator('[data-count="10000"]')).toHaveText("10,000+");
  await expect(page.locator(".tr-results")).toHaveText(
    "Showing 1–10 of 30 sessions · page 1 of 3",
  );
  await expect(page.locator(".tr-progress")).toHaveText("In progress");
  await expect(page.locator(`.cn-footer a[href="${path}"]`)).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("pagination shows all 30 distinct sessions with working bounds and focus", async ({
  page,
}) => {
  await page.goto(path);
  await expect(
    page.getByRole("button", { name: "Previous page", exact: true }),
  ).toBeDisabled();
  const ids = new Set();
  for (let index = 1; index <= 3; index++) {
    await expect(page.locator(".tr-row")).toHaveCount(10);
    await expect(page.locator(".tr-results")).toContainText(
      `page ${index} of 3`,
    );
    for (const id of await page
      .locator(".tr-row")
      .evaluateAll((rows) => rows.map((row) => row.dataset.sessionId)))
      ids.add(id);
    if (index < 3) {
      await page
        .getByRole("button", { name: "Next page", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: `Page ${index + 1}`, exact: true }),
      ).toBeFocused();
    }
  }
  expect(ids.size).toBe(30);
  await expect(
    page.getByRole("button", { name: "Next page", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Previous page", exact: true })
    .click();
  await expect(page.locator(".tr-results")).toContainText("page 2 of 3");
});

test("hero and local search stay synchronized, with combined category filtering", async ({
  page,
}) => {
  await page.goto(path);
  await page.locator("#courseSearch").fill("LAW cape town");
  await expect(page.locator("#scheduleSearch")).toHaveValue("LAW cape town");
  await expect(page.locator(".tr-row")).toHaveCount(4);
  await page.locator("#courseSearch").press("Enter");
  await expect(page.locator("#scheduleSearch")).toBeFocused();
  await page.locator("#scheduleSearch").fill("Johannesburg");
  await expect(page.locator("#courseSearch")).toHaveValue("Johannesburg");
  await page.locator('[data-category="Leadership"]').click();
  await expect(page.locator(".tr-row")).toHaveCount(3);
  await expect(page.locator('[data-category="Leadership"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator("#scheduleSearch").fill("AI");
  await expect(page.locator(".tr-empty")).toBeVisible();
  await page.locator("[data-training-reset]").click();
  await expect(page.locator("#scheduleSearch")).toHaveValue("");
  await expect(page.locator("#courseSearch")).toHaveValue("");
  await expect(page.locator('[data-category="all"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(".tr-row")).toHaveCount(10);
});

test("filters include Education, query-aware counts and Operations empty-state recovery", async ({
  page,
}) => {
  await page.goto(path);
  await expect(page.locator('[data-training-count="Education"]')).toHaveText(
    "3",
  );
  await expect(page.locator('[data-training-count="Operations"]')).toHaveText(
    "0",
  );
  await page.locator('[data-category="Education"]').click();
  await expect(page.locator(".tr-row")).toHaveCount(3);
  await page.locator("#scheduleSearch").fill("Durban");
  await expect(page.locator(".tr-row")).toHaveCount(2);
  await expect(page.locator('[data-training-count="Education"]')).toHaveText(
    "2",
  );
  await page.locator('[data-category="Operations"]').click();
  await expect(page.locator(".tr-empty")).toBeVisible();
  await expect(page.locator("#pagination")).toBeEmpty();
  await page.locator("[data-training-reset]").click();
  await expect(page.locator(".tr-results")).toContainText("page 1 of 3");
});

test("search resets pagination, safely handles text and retains keyboard focus", async ({
  page,
}) => {
  await page.goto(path);
  await page.getByRole("button", { name: "Page 3", exact: true }).click();
  await page.locator("#scheduleSearch").fill("finance");
  await expect(page.locator(".tr-results")).toContainText("3 sessions");
  await expect(page.locator(".tr-results")).toContainText("page 1 of 1");
  await expect(page.locator("#scheduleSearch")).toBeFocused();
  await page.locator("#scheduleSearch").fill("<img src=x onerror=alert(1)>");
  await expect(page.locator(".tr-empty")).toBeVisible();
  await expect(page.locator("main img")).toHaveCount(0);
  await expect(page.locator("#pagination")).toBeEmpty();
});

test("every supplied course title resolves without inventing unscheduled sessions", async ({
  page,
}) => {
  for (const course of courseTitles) {
    await page.goto(`/training/${course.slug}`);
    await expect(page.locator("h1")).toHaveText(course.title);
    await expect(page.locator("main")).toContainText(
      "Online bookings are not available",
    );
  }
  await page.goto("/training/advanced-inventory-management");
  await expect(page.locator("main")).toContainText(
    "No upcoming sessions are currently listed",
  );
  await expect(page.locator(".tr-row")).toHaveCount(0);
});

test("selected session travels through course details to the training contact draft", async ({
  page,
}) => {
  await page.route("https://maps.google.com/**", (route) => route.abort());
  await page.goto(path);
  await page.locator("#scheduleSearch").fill("financial modelling virtual");
  await page.locator(".tr-row-action").click();
  await expect(page.locator("h1")).toHaveText("Financial Modelling");
  await expect(page.locator(".tr-selected")).toContainText(
    "18–20 November 2026 · Virtual",
  );
  await page.locator(".tr-selected a").click();
  await expect(page.locator("[name=topic]")).toHaveValue("Training courses");
  await expect(page.locator("[name=message]")).toHaveValue(
    /Financial Modelling \(18–20 November 2026, Virtual\)/,
  );
  await page.goto(
    "/contact?path=training&course=financial-modelling&session=not-a-real-session",
  );
  await expect(page.locator("[name=message]")).toHaveValue(
    /Financial Modelling\. Please send/,
  );
});

test("ended sessions disappear by the Johannesburg calendar date, not browser timezone", async ({
  page,
}) => {
  await page.clock.setSystemTime(new Date("2026-11-04T23:00:00Z"));
  await page.goto(path);
  await expect(page.locator(".tr-results")).toContainText("29 sessions");
  await expect(page.locator(".tr-progress")).toHaveCount(0);
  await page.clock.setSystemTime(new Date("2028-01-01T08:00:00Z"));
  await page.reload();
  await expect(page.locator(".tr-empty")).toBeVisible();
  await expect(page.locator("#pagination")).toBeEmpty();
  await expect(page.locator(".tr-course-card")).toHaveCount(12);
});

test("training navigation and shared promo session state work", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/what-we-do/conferences");
  await page
    .getByRole("button", { name: "Dismiss promotional banner" })
    .click();
  await page.locator("#what-menu-trigger").click();
  await page.locator(`#what-menu a[href="${path}"]`).click();
  await expect(page.locator("h1")).toHaveText("Training Courses");
  await expect(page.locator(".cn-promo")).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");
  await page.locator(".menu-toggle").click();
  await page
    .locator(".mobile-what summary")
    .filter({ hasText: "What we do" })
    .click();
  await page.locator(`#mobile-menu a[href="${path}"]`).click();
  await expect(page.locator("h1")).toHaveText("Training Courses");
});

test("training page and detail are responsive and have no browser errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 375, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [path, "/training/management-skills-new-managers"]) {
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

test("training page, empty state and details pass automated WCAG A/AA checks", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [path, "/training/financial-modelling"]) {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        results.violations,
        `${route} accessibility at ${width}px`,
      ).toEqual([]);
    }
    await page.goto(path);
    await page.locator('[data-category="Operations"]').click();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
});

test("date helpers handle same-day, cross-month, cross-year and ZA midnight correctly", () => {
  expect(formatDateRange("2027-04-29", "2027-04-29")).toBe("29 April 2027");
  expect(formatDateRange("2027-03-31", "2027-04-01")).toBe(
    "31 March – 1 April 2027",
  );
  expect(formatDateRange("2026-12-31", "2027-01-01")).toBe(
    "31 December 2026 – 1 January 2027",
  );
  expect(southAfricaToday(new Date("2026-11-04T23:30:00Z"))).toBe("2026-11-05");
  expect(upcomingSessions("2026-11-04")).toHaveLength(30);
  expect(upcomingSessions("2026-11-05")).toHaveLength(29);
  expect(new Set(sessions.map((session) => session.id)).size).toBe(30);
});
