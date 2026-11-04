import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  employerTitle,
  employerDescription,
  employerOgDescription,
  employerServices,
  employerComparison,
  scopeChoice,
} from "../src/employer-data.js";
const path = "/employers";
async function fill(page) {
  for (const [name, value] of Object.entries({
    yourName: "Test Buyer",
    jobTitle: "Fleet manager",
    company: "Fictional Logistics",
    email: "buyer@example.com",
    phone: "+27 11 451 9898",
    description:
      "Fictional enquiry for a sample distribution site and driver team.",
  }))
    await page.locator(`#em-${name}`).fill(value);
  await page.locator("#em-industry").selectOption("Transport & Logistics");
  await page.locator('[name="services"][value="Driver recruitment"]').check();
  await page
    .locator('[name="services"][value="External HR management"]')
    .check();
  await page.locator('[name="timeline"][value="This month"]').check();
  await page.locator("#em-consent").check();
}
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});
test("canonical, slash and query routes render the complete static employer document with honest metadata", async ({
  page,
  request,
}) => {
  for (const url of [path, path + "/", path + "?source=nav"]) {
    const r = await request.get(url);
    expect(r.ok()).toBeTruthy();
    const html = await r.text();
    expect(html).toContain('id="pain-points"');
    expect(html).toContain('id="em-enquiry-form"');
    expect(html).toContain('content="noindex, follow"');
  }
  await page.goto(path);
  await expect(page).toHaveTitle(employerTitle);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Your workforce,handled.");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    employerDescription,
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    employerOgDescription,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.citizenhc.co.za/employers",
  );
  await expect(
    page.locator('.desktop-nav > a[href="/employers"]'),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.locator('.desktop-nav > a[href="/services"]'),
  ).not.toHaveAttribute("aria-current");
  await expect(page.locator("#em-api-status")).toContainText("Test enquiry");
});
test("six pain cards route correctly and uncertain buyers arrive at enquiry with scoping selected", async ({
  page,
}) => {
  await page.goto(path);
  await expect(page.locator(".em-pain")).toHaveCount(6);
  for (const [i, target] of [
    [0, employerServices[0].path],
    [1, employerServices[1].path],
    [2, employerServices[2].path],
    [3, employerServices[3].path],
    [4, employerServices[1].path],
    [5, "#enquire"],
  ])
    await expect(page.locator(".em-pain").nth(i)).toHaveAttribute(
      "href",
      target,
    );
  await page.locator(".em-pain").last().click();
  await expect(page).toHaveURL(/#enquire$/);
  await expect(page.locator("#em-enquire-title")).toBeFocused();
  await expect(page.locator('[name="services"]').last()).toBeChecked();
  await expect(page.locator('[name="services"]').last()).toHaveValue(
    scopeChoice,
  );
  await page.locator('[data-em-service="CPD"]').click();
  await expect(page.locator('[name="services"][value="CPD"]')).toBeChecked();
  await expect(page.locator('[name="services"]').last()).toBeChecked();
});
test("comparison desktop and mobile use identical six-dimension data, including client inputs", async ({
  page,
}) => {
  await page.goto(path);
  await expect(page.locator(".em-table thead th")).toHaveCount(5);
  await expect(page.locator(".em-table tbody tr")).toHaveCount(6);
  await expect(page.locator('.em-table tbody th[scope="row"]')).toHaveCount(6);
  for (let i = 0; i < 4; i++) {
    const card = page.locator(".em-service-card").nth(i);
    await expect(card.locator("dl > div")).toHaveCount(6);
    expect(await card.locator("dd").allTextContents()).toEqual(
      employerComparison.map(([, values]) => values[i]),
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".em-table-wrap")).toBeHidden();
  await expect(page.locator(".em-compare-mobile")).toBeVisible();
  await expect(page.locator(".em-service-card")).toHaveCount(4);
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.locator(".em-table-wrap")).toBeVisible();
  await expect(page.locator(".em-compare-mobile")).toBeHidden();
});
test("content preserves process and sectors without fabricated results, testimonials, SLA or binding unpublished terms", async ({
  page,
}) => {
  await page.goto(path);
  await expect(page.locator(".em-process > li")).toHaveCount(4);
  await expect(page.locator(".em-industries li")).toHaveCount(10);
  await expect(page.locator(".em-process")).toContainText(
    "what’s not included",
  );
  const text = await page.locator("main").innerText();
  for (const value of [
    "2,400+",
    "96%",
    "Managing Director\nNational logistics",
    "always within one business day",
    "no penalty for stopping",
  ])
    expect(text).not.toContain(value);
  await expect(page.locator(".em-evidence")).toContainText(
    "Agree what success looks like",
  );
  await expect(
    page.locator(".em-note").filter({ hasText: "professional development" }),
  ).toContainText("CPD overview");
  await expect(page.locator("#em-enquiry-form")).toContainText(
    "Terms of Engagement — draft for approval",
  );
  await expect(page.locator('main a[href^="mailto:clients@"]')).toHaveCount(0);
  await expect(page.locator('main a[href="tel:+27000000000"]')).toHaveCount(0);
  await expect(page.locator('main a[href^="mailto:reception@"]')).toHaveCount(
    1,
  );
});
test("three-section form rejects empty/invalid fields, focuses accessible summary and clears individual/group errors", async ({
  page,
}) => {
  await page.goto(path);
  await expect(page.locator(".em-form-section")).toHaveCount(3);
  await page.locator("#em-submit").click();
  await expect(page.locator("#em-errors")).toBeFocused();
  await expect(page.locator("#em-yourName")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.locator("#em-services-error")).toContainText(
    "Choose at least",
  );
  await page.locator("#em-errors a").filter({ hasText: "Services:" }).click();
  await expect(page.locator('[name="services"]').first()).toBeFocused();
  await page.locator('[name="services"]').first().check();
  await expect(page.locator("#em-services-error")).toBeEmpty();
  await expect(page.locator('[name="services"]').first()).not.toHaveAttribute(
    "aria-invalid",
  );
  await fill(page);
  await page.locator("#em-description").fill("too short");
  await page.locator("#em-email").fill("bad");
  await page.locator("#em-phone").fill("abc");
  await page.locator("#em-submit").click();
  await expect(page.locator("#em-description-error")).toContainText(
    "20 characters",
  );
  await expect(page.locator("#em-email-error")).toContainText("valid");
  await expect(page.locator("#em-phone-error")).toContainText("valid");
});
test("accepted real server submission uses all selected services, returns server reference and resets only after receipt", async ({
  page,
}) => {
  await page.goto(path);
  await fill(page);
  let payload;
  page.on("request", (r) => {
    if (r.url().endsWith("/api/client-enquiry") && r.method() === "POST")
      payload = r.postDataJSON();
  });
  const response = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/client-enquiry") &&
      r.request().method() === "POST",
  );
  await page.locator("#em-submit").click();
  expect((await response).status()).toBe(201);
  await expect(page.locator("#em-success-title")).toHaveText(
    "Test enquiry stored.",
  );
  await expect(page.locator("#em-success-title")).toBeFocused();
  await expect(page.locator("#em-reference")).toHaveText(/^ENQ-[A-F0-9]{12}$/);
  await expect(page.locator("#em-success-body")).toContainText(
    "No consultant has been notified",
  );
  expect(payload.services).toEqual([
    "Driver recruitment",
    "External HR management",
  ]);
  expect(payload.consent).toBe(true);
  expect(payload.pageSource).toBe("For Employers Landing");
  await expect(page.locator("#em-enquiry-form")).toBeHidden();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  await page.locator("#em-new").click();
  await expect(page.locator("#em-yourName")).toHaveValue("");
  await expect(page.locator("#em-consent")).not.toBeChecked();
  await expect(page.locator("#em-errors")).toBeHidden();
  await expect(page.locator("#em-yourName")).toBeFocused();
});
test("lost response never claims received; unchanged retry reaches same stored receipt without resending a second enquiry", async ({
  page,
}) => {
  let first = true;
  const ids = [];
  await page.route("**/api/client-enquiry", async (route) => {
    ids.push(route.request().headers()["idempotency-key"]);
    if (first) {
      first = false;
      const result = await route.fetch();
      expect(result.status()).toBe(201);
      return route.abort("failed");
    }
    return route.continue();
  });
  await page.goto(path);
  await fill(page);
  await page.locator("#em-submit").click();
  await expect(page.locator("#em-errors")).toContainText(
    "Receipt could not be confirmed",
  );
  await expect(page.locator("#em-success")).toBeHidden();
  await expect(page.locator("#em-company")).toHaveValue("Fictional Logistics");
  const response = page.waitForResponse((r) =>
    r.url().endsWith("/api/client-enquiry"),
  );
  await page.locator("#em-submit").click();
  expect((await response).status()).toBe(200);
  await expect(page.locator("#em-success")).toBeVisible();
  expect(ids).toHaveLength(2);
  expect(ids[0]).toBe(ids[1]);
});
test("server validation error and failed/offline submissions retain answers; honeypot never reports success", async ({
  page,
}) => {
  let count = 0;
  await page.route("**/api/client-enquiry", (route) => {
    count++;
    return route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        error: "Please check the enquiry fields.",
        errors: { company: "Check the company name." },
      }),
    });
  });
  await page.goto(path);
  await fill(page);
  await page.locator("#em-submit").click();
  await expect(page.locator("#em-company-error")).toHaveText(
    "Check the company name.",
  );
  await expect(page.locator("#em-company")).toHaveValue("Fictional Logistics");
  await expect(page.locator("#em-success")).toBeHidden();
  await page.locator("#em-hp").evaluate((el) => (el.value = "bot"));
  await page.locator("#em-submit").click();
  expect(count).toBe(1);
  await expect(page.locator("#em-errors")).toContainText(
    "could not be accepted",
  );
});
test("unavailable service disables send and offers a working connection retry", async ({
  page,
}) => {
  let unavailable = true;
  await page.route("**/api/client-enquiry/config", (route) =>
    route.fulfill({
      status: unavailable ? 503 : 200,
      contentType: "application/json",
      body: JSON.stringify({ mode: "test", accepting: true }),
    }),
  );
  await page.goto(path);
  await expect(page.locator("#em-api-status")).toContainText("unavailable");
  await expect(page.locator("#em-submit")).toBeDisabled();
  unavailable = false;
  await page.getByRole("button", { name: "Retry connection" }).click();
  await expect(page.locator("#em-submit")).toBeEnabled();
  await expect(page.locator("#em-api-status")).toContainText("Test enquiry");
});
test("native FAQ works with keyboard and closes other answers without leaving hidden focusable panels", async ({
  page,
}) => {
  await page.goto(path);
  const first = page.locator(".em-faq summary").first();
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".em-faq details").first()).toHaveAttribute(
    "open",
    "",
  );
  await page.locator(".em-faq summary").nth(1).click();
  await expect(page.locator(".em-faq details").first()).not.toHaveAttribute(
    "open",
  );
  await expect(page.locator(".em-faq details").nth(1)).toHaveAttribute(
    "open",
    "",
  );
});
test("no-JavaScript employer page retains all routing, comparison, process, FAQ and safe assistance", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:5173/employers");
  await expect(page.locator(".em-pain")).toHaveCount(6);
  await expect(page.locator(".em-service-card")).toHaveCount(4);
  await expect(page.locator("noscript p")).toContainText(
    "No enquiry has been sent",
  );
  await expect(page.locator("#em-submit")).toBeHidden();
  await page.locator(".em-faq summary").first().click();
  await expect(page.locator(".em-faq details").first()).toHaveAttribute(
    "open",
    "",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await context.close();
});
test("seven responsive widths, desktop/mobile current navigation and no browser errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [320, 360, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.locator('.em-hero a[href="#enquire"]').click();
    await expect(page.locator("#em-enquire-title")).toBeFocused();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".menu-toggle").click();
  await expect(
    page.locator('#mobile-menu a[href="/employers"]'),
  ).toHaveAttribute("aria-current", "page");
  await page.keyboard.press("Escape");
  expect(errors).toEqual([]);
});
test("desktop/mobile initial, invalid and accepted states pass accessibility checks", async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.locator("#em-submit").click();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await fill(page);
  await page.locator("#em-submit").click();
  await expect(page.locator("#em-success")).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("live reduced-motion changes reveal content and silence card motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(path);
  await expect(page.locator("main")).toHaveClass(/em-motion/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("main")).not.toHaveClass(/em-motion/);
  await page.locator(".em-pain").first().hover();
  expect(
    await page
      .locator(".em-pain")
      .first()
      .evaluate((el) => getComputedStyle(el).transform),
  ).toBe("none");
});
