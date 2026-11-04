import { test, expect } from "@playwright/test";
import {
  hrPath as path,
  hrTitle,
  hrDescription,
  hrOgDescription,
  hrQuestions,
  scoreHrHealth,
} from "../src/hr-data.js";

async function answer(page, index, value) {
  await page.locator(`label[for="hr-q${index + 1}-${value}"]`).click();
}
async function answerAll(page, values) {
  for (let i = 0; i < 6; i++) await answer(page, i, values[i]);
}
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("HR static document includes supplied metadata, nine roles, four domains and confirmed reception", async ({
  page,
  request,
}) => {
  const response = await request.get(path);
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain(`<title>${hrTitle}</title>`);
  expect(html).toContain(hrDescription);
  expect(html.match(/data-hr-panel/g)).toHaveLength(4);
  expect(html.match(/class="hm-role"/g)).toHaveLength(9);
  await page.goto(path);
  await expect(page).toHaveTitle(hrTitle);
  await expect(page.locator("h1")).toHaveText(
    "A full HR function.Without the headcount.",
  );
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
    "href",
    `https://www.citizenhc.co.za${path}`,
  );
  await expect(page.locator("meta[name=description]")).toHaveAttribute(
    "content",
    hrDescription,
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    hrOgDescription,
  );
  await expect(page.locator(".hm-role")).toHaveCount(9);
  expect(
    parseFloat(
      await page
        .locator("#hr-title")
        .evaluate((el) => getComputedStyle(el).fontSize),
    ),
  ).toBeLessThanOrEqual(68);
  const underline = await page.locator("#health-title").evaluate((el) => ({
    left: parseFloat(getComputedStyle(el, "::after").left),
    width: el.getBoundingClientRect().width,
  }));
  expect(underline.left).toBeCloseTo(underline.width / 2, 0);
  await expect(page.locator(".hm-model")).toHaveCount(3);
  await expect(page.locator(".hm-commit")).toHaveCount(3);
  await expect(page.locator(".hm-faq-item")).toHaveCount(5);
  await expect(page.locator(".hm-stats .cn-stat")).toHaveText([
    "15–200",
    "48 hrs",
    "10 days",
    "1",
  ]);
  await expect(page.locator(".hm-cost-card")).toContainText("From R4,500");
  await expect(page.locator(".site-footer")).toContainText(
    "reception@citizenhc.co.za",
  );
  await expect(page.locator(".site-footer")).toContainText("+27 11 451 9898");
  await expect(page.locator(".site-footer")).toContainText("8 Greenstone Pl");
  await expect(page.locator(`.site-footer a[href="${path}"]`)).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.locator("main")).not.toContainText("R[4,500]");
  await expect(page.locator(".site-footer")).not.toContainText("2024/000000");
});

test("all four service tabs expose the correct associated panel and one roving tab stop", async ({
  page,
}) => {
  await page.goto(path);
  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    const tab = tabs.nth(i);
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await expect(tab).toHaveAttribute("tabindex", "0");
    await expect(tab).toBeFocused();
    await expect(page.locator('.hm-tab[tabindex="0"]')).toHaveCount(1);
    const panel = page.locator(`#hr-panel-${i + 1}`);
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("aria-labelledby", `hr-tab-${i + 1}`);
    await expect(tab).toHaveAttribute("aria-controls", `hr-panel-${i + 1}`);
    await expect(panel.locator("li")).toHaveCount(6);
    await expect(page.locator(".hm-panel:not([hidden])")).toHaveCount(1);
    await expect(page.locator(".hm-panel")).toHaveCount(4);
  }
});

test("tabs support desktop/mobile arrow keys, wrapping, Home/End and panel focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(path);
  await expect(page.getByRole("tablist")).toHaveAttribute(
    "aria-orientation",
    "vertical",
  );
  await page.locator("#hr-tab-1").focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("#hr-tab-2")).toBeFocused();
  await expect(page.locator("#hr-panel-2")).toBeVisible();
  await page.keyboard.press("End");
  await expect(page.locator("#hr-tab-4")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("#hr-tab-1")).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(page.locator("#hr-tab-4")).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("tablist")).toHaveAttribute(
    "aria-orientation",
    "horizontal",
  );
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#hr-tab-1")).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("#hr-tab-4")).toBeFocused();
  await page.keyboard.press("Home");
  await page.keyboard.press("Tab");
  await expect(page.locator("#hr-panel-1")).toBeFocused();
  await page.goto(`${path}#hr-panel-3`);
  await expect(page.locator("#hr-panel-3")).toBeVisible();
  await expect(page.locator("#hr-tab-3")).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("health check announces progress, waits for all six answers and does not steal focus", async ({
  page,
}) => {
  await page.goto(path);
  await expect(page.locator("#healthResult")).toBeHidden();
  await expect(page.locator("#healthProgress")).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
  for (let i = 0; i < 5; i++) await answer(page, i, "yes");
  await expect(page.locator("#healthResult")).toBeHidden();
  await expect(page.locator("#healthProgressLabel")).toHaveText(
    "Answered 5 of 6",
  );
  await expect(page.locator("#healthAnnouncement")).toHaveText(
    "Answered 5 of 6.",
  );
  await answer(page, 5, "yes");
  await expect(page.locator("#healthResult")).toBeVisible();
  await expect(page.locator("#healthProgress")).toHaveAttribute(
    "aria-valuenow",
    "6",
  );
  await expect(page.locator("#healthScore")).toHaveText("6 / 6");
  await expect(page.locator("#healthHeadline")).toHaveText(
    "A strong starting point.",
  );
  await expect(page.locator("#hr-q6-yes")).toBeFocused();
  await expect(page.locator("#healthAnnouncement")).toContainText(
    "6 of 6 applicable foundations",
  );
  await expect(page.locator("#healthBody")).toContainText(
    "does not certify compliance",
  );
  await expect(page.locator("#healthGaps")).toBeHidden();
});

test("health check distinguishes Not required from Not sure and recalculates changed answers", async ({
  page,
}) => {
  await page.goto(path);
  await answerAll(page, ["yes", "yes", "na", "yes", "unsure", "yes"]);
  await expect(page.locator("#healthScore")).toHaveText("4 / 5");
  await expect(page.locator("#healthGaps li")).toHaveCount(1);
  await expect(page.locator("#healthGaps")).toContainText("WSP/ATR");
  await expect(page.locator("#healthHeadline")).toHaveText(
    "A few gaps to close.",
  );
  await answer(page, 4, "yes");
  await expect(page.locator("#healthScore")).toHaveText("5 / 5");
  await answer(page, 2, "no");
  await expect(page.locator("#healthScore")).toHaveText("5 / 6");
  await expect(page.locator("#healthGaps")).toContainText("Employment Equity");
  await answerAll(page, Array(6).fill("no"));
  await expect(page.locator("#healthScore")).toHaveText("0 / 6");
  await expect(page.locator("#healthHeadline")).toHaveText(
    "Your HR foundations need attention.",
  );
  await expect(page.locator("#healthGaps li")).toHaveCount(6);
});

test("native radio keyboard controls and reset work with focus restoration", async ({
  page,
}) => {
  await page.goto(path);
  await page.locator("#hr-q1-yes").focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#hr-q1-no")).toBeChecked();
  await expect(page.locator("#hr-q1-no")).toBeFocused();
  for (let i = 1; i < 6; i++) await answer(page, i, "yes");
  await page.locator("#healthReset").click();
  await expect(page.locator("#healthResult")).toBeHidden();
  await expect(page.locator("#healthForm input:checked")).toHaveCount(0);
  await expect(page.locator(".hm-question.is-answered")).toHaveCount(0);
  await expect(page.locator("#healthProgressLabel")).toHaveText(
    "Answered 0 of 6",
  );
  await expect(page.locator("#healthProgress")).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
  await expect(page.locator("#healthAnnouncement")).toHaveText(
    "Health check reset. Answered 0 of 6.",
  );
  await expect(page.locator("#hr-q1-yes")).toBeFocused();
  await answerAll(page, Array(6).fill("yes"));
  await expect(page.locator("#healthScore")).toHaveText("6 / 6");
});

test("health answers are not submitted, persisted or passed to the contact page", async ({
  page,
}) => {
  await page.route("https://maps.google.com/**", (route) => route.abort());
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  const requests = [];
  page.on("request", (request) => {
    if (
      request.method() !== "GET" ||
      ["xhr", "fetch"].includes(request.resourceType())
    )
      requests.push(request.url());
  });
  await answerAll(page, Array(6).fill("no"));
  await page.locator("#healthForm").evaluate((form) => form.requestSubmit());
  await expect(page).toHaveURL(path);
  expect(requests).toEqual([]);
  expect(
    await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage }),
    ),
  ).toBe("{}");
  await page.locator("#healthResult a").click();
  await expect(page).toHaveURL("/contact?path=hr");
  await expect(page.locator("[name=message]")).not.toHaveValue(
    /score|0 \/ 6|WSP\/ATR/,
  );
  await page.goto(path);
  await expect(page.locator("#healthProgressLabel")).toHaveText(
    "Answered 0 of 6",
  );
  await expect(page.locator("#healthResult")).toBeHidden();
});

test("urgent and scoping calls to action lead to honest reception email drafts", async ({
  page,
}) => {
  await page.route("https://maps.google.com/**", (route) => route.abort());
  for (const [query, selector, expected] of [
    ["hr", ".hm-dual-scoping .btn", "15-minute scoping call"],
    ["hr-urgent", ".hm-dual-urgent .btn", "time-sensitive HR matter"],
  ]) {
    await page.goto(path);
    await page.locator(selector).click();
    await expect(page).toHaveURL(`/contact?path=${query}`);
    await expect(page.locator("[name=topic]")).toHaveValue("HR support");
    await expect(page.locator("[name=message]")).toHaveValue(
      new RegExp(expected),
    );
    if (query === "hr-urgent")
      await expect(
        page.locator('.contact-urgent-notice a[href="tel:+27114519898"]'),
      ).toBeVisible();
    await page.locator("[name=name]").fill("Test Person");
    await page.locator("[name=jobTitle]").fill("Operations Manager");
    await page.locator("[name=email]").fill("test@example.org");
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
  }
});

test("hero health-check anchor, footer and mobile navigation reach the correct sections", async ({
  page,
}) => {
  await page.goto(path);
  await page.locator('.hm-hero a[href="#health-check"]').click();
  await expect(page).toHaveURL(`${path}#health-check`);
  await expect(page.locator("#health-title")).toBeInViewport();
  await page.goto("/about");
  await page.locator(`.site-footer a[href="${path}"]`).click();
  await expect(page.locator("#hr-title")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");
  await page.locator(".menu-toggle").click();
  await page.locator(`#mobile-menu a[href="${path}"]`).click();
  await expect(page.locator("#hr-title")).toBeVisible();
  await expect(page.locator("#mobile-menu")).toBeHidden();
});

test("HR progressive content and native FAQ remain available without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:5173${path}`);
  await expect(page.locator(".hm-panel")).toHaveCount(4);
  for (let i = 1; i <= 4; i++)
    await expect(page.locator(`#hr-panel-${i}`)).toBeVisible();
  await expect(page.locator(".hm-question[disabled]")).toHaveCount(6);
  await expect(page.locator("noscript p")).toContainText(
    "JavaScript is needed to calculate a result",
  );
  await page.locator(".hm-faq-item summary").nth(1).click();
  await expect(page.locator(".hm-faq-item[open] div")).toBeVisible();
  await expect(page.locator("#hr-title")).toHaveCSS("opacity", "1");
  await expect(page.locator("#hr-title")).toHaveCSS(
    "color",
    "rgb(253, 252, 249)",
  );
  await context.close();
});

test("HR is responsive at seven widths with no browser errors", async ({
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
    await answerAll(page, Array(6).fill("no"));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `result overflow at ${width}px`,
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("HR tabs, result and FAQ states pass desktop/mobile WCAG A/AA checks", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    for (const state of ["initial", "tab", "result", "faq"]) {
      if (state === "tab") await page.locator("#hr-tab-3").click();
      if (state === "result") await answerAll(page, Array(6).fill("no"));
      if (state === "faq")
        await page.locator(".hm-faq-item summary").nth(1).click();
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

test("HR reduced motion and live preference changes leave all content visible", async ({
  page,
}) => {
  await page.goto(path);
  await expect(page.locator("main")).not.toHaveClass(/cn-motion/);
  for (const duration of await page
    .locator(".hm-role,.hm-model,.hm-role-icon,.hm-choice>span")
    .evaluateAll((elements) =>
      elements.map((el) => getComputedStyle(el).transitionDuration),
    ))
    expect(duration.split(",").every((v) => parseFloat(v) === 0)).toBe(true);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  await expect(page.locator("main")).toHaveClass(/cn-motion/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("main")).not.toHaveClass(/cn-motion/);
  await expect(page.locator("#hr-cost-title")).toHaveCSS("opacity", "1");
});

test("health scoring covers every possible valid answer combination without treating unknown as compliant", () => {
  const combinations = hrQuestions.reduce(
    (sets, q) =>
      sets.flatMap((set) => q.choices.map(([value]) => [...set, value])),
    [[]],
  );
  expect(combinations).toHaveLength(144);
  for (const answers of combinations) {
    const result = scoreHrHealth(answers);
    expect(result.complete).toBe(true);
    expect(result.answered).toBe(6);
    expect(result.applicable).toBe(answers[2] === "na" ? 5 : 6);
    expect(result.score).toBe(answers.filter((a) => a === "yes").length);
    expect(result.gaps).toHaveLength(result.applicable - result.score);
  }
  expect(scoreHrHealth([])).toEqual({ answered: 0, complete: false });
  expect(scoreHrHealth(["yes", "yes", "na", "yes", "na", "yes"])).toEqual({
    answered: 5,
    complete: false,
  });
  expect(scoreHrHealth(Array(6).fill("<script>"))).toEqual({
    answered: 0,
    complete: false,
  });
});
