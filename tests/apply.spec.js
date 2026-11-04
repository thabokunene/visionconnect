import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const path = "/apply";
async function fillAbout(page) {
  for (const [name, value] of Object.entries({
    firstName: "Test",
    surname: "Driver",
    saId: "9001015009086",
    mobile: "0821234567",
    email: "test@example.com",
    city: "Test Town",
  }))
    await page.locator(`[name="${name}"]`).fill(value);
  await page.locator('[name="province"]').selectOption("Gauteng");
  await page.locator('[name="rightToWork"][value="Yes"]').check();
}
async function fillLicence(page) {
  await page.locator('[name="licence"]').selectOption("Code 14 / EC");
  await page.locator('[name="years"]').fill("5");
  await page.locator('[name="licenceIssued"]').fill("2020-01-01");
  await page.locator('[name="licenceExpiry"]').fill("2028-01-01");
  await page.locator('[name="prdp"][value="No"]').check();
  await page.locator('[name="vehicles"][value="Rigid"]').check();
  await page.locator('[name="vehicles"][value="Tanker"]').check();
  await page.locator('[name="routes"][value="Local"]').check();
  await page
    .locator('[name="employment"]')
    .selectOption("Available immediately");
}
async function next(page) {
  await page.locator(".ap-panel:visible [data-next]").click();
}
async function toReview(page, upload = false) {
  await fillAbout(page);
  await next(page);
  await fillLicence(page);
  await next(page);
  if (upload)
    await page.locator("#ap-file-certifiedId").setInputFiles({
      name: "sample.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4\nfictional sample\n%%EOF"),
    });
  await next(page);
  await page.locator('[name="preferredProvinces"][value="Gauteng"]').check();
  await page.locator('[name="preferredProvinces"][value="Limpopo"]').check();
  await page.locator('[name="shift"][value="Day"]').check();
  await page.locator('[name="earliestStart"]').fill("2026-12-01");
  await page.locator('[name="transport"]').selectOption("Yes");
  await next(page);
}
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});
test("static canonical/trailing/query pages, honest metadata and confirmed assistance", async ({
  page,
  request,
}) => {
  for (const url of [path, path + "/", path + "?source=driver"]) {
    const r = await request.get(url);
    expect(r.ok()).toBeTruthy();
    expect(await r.text()).toContain('id="ap-faq-title"');
  }
  await page.goto(path);
  await expect(page).toHaveTitle("Apply as a Driver | Citizen Human Capital");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.citizenhc.co.za/apply",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, follow",
  );
  await expect(page.locator("#ap-service-status")).toContainText("Test mode");
  await expect(page.locator('a[href*="wa.me"]')).toHaveCount(0);
  await expect(
    page.locator('.ap-panel:visible a[href="tel:+27114519898"]').first(),
  ).toBeVisible();
  await expect(page.locator(".ap-panel:visible")).toHaveCount(1);
  await expect(page.locator("#ap-save-optin")).not.toBeChecked();
});
test("Next validates with focused accessible errors, numeric ID and derived DOB", async ({
  page,
}) => {
  await page.goto(path);
  await next(page);
  await expect(page.locator("#ap-error-summary")).toBeFocused();
  await expect(page.locator("#ap-firstName")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await fillAbout(page);
  await page.locator('[name="saId"]').fill("9001aa");
  await expect(page.locator('[name="saId"]')).toHaveValue("9001");
  await page.locator('[name="saId"]').fill("9001015009086");
  await expect(page.locator("#ap-dob")).toContainText("January 1990");
  await next(page);
  await expect(page.locator("#ap-heading-1")).toBeFocused();
  await expect(page.locator("#ap-progress-text")).toHaveText(
    "Step 2 of 5 · 40% complete",
  );
  await expect(page.locator('[data-progress="0"] .ap-step-number')).toHaveText(
    "✓",
  );
});
test("conditional PrDP and notice data are cleared when hidden, soft notices do not block", async ({
  page,
}) => {
  await page.goto(path);
  await fillAbout(page);
  await page.locator('[name="rightToWork"][value="No"]').check();
  await expect(page.locator("#ap-work-note")).toBeVisible();
  await next(page);
  await fillLicence(page);
  await page.locator('[name="prdp"][value="Yes"]').check();
  await page.locator('[name="prdpExpiry"]').fill("2028-01-01");
  await page.locator('[name="prdp"][value="No"]').check();
  await expect(page.locator('[name="prdpExpiry"]')).toHaveValue("");
  await expect(page.locator("#ap-prdp-note")).toBeVisible();
  await page.locator('[name="employment"]').selectOption("Employed");
  await next(page);
  await expect(page.locator("#ap-notice-error")).toContainText("Choose");
  await page.locator('[name="notice"]').selectOption("1 month");
  await page
    .locator('[name="employment"]')
    .selectOption("Available immediately");
  await expect(page.locator('[name="notice"]')).toHaveValue("");
  await next(page);
  await expect(page.locator("#ap-heading-2")).toBeVisible();
});
test("all review sections, missing documents, edit returns directly to review, separate unchecked permissions", async ({
  page,
}) => {
  await page.goto(path);
  await toReview(page);
  await expect(page.locator(".ap-review-section")).toHaveCount(4);
  await expect(page.locator("#ap-review")).toContainText(
    "Not attached · supply later",
  );
  await expect(page.locator('[name="marketingConsent"]')).not.toBeChecked();
  await expect(page.locator('[name="processingConsent"]')).not.toBeChecked();
  await page.getByRole("button", { name: "Edit About you" }).click();
  await page.locator('[name="city"]').fill("Changed Town");
  await next(page);
  await expect(page.locator("#ap-heading-4")).toBeFocused();
  await expect(page.locator("#ap-review")).toContainText("Changed Town");
  await page.locator("#ap-submit").click();
  await expect(page.locator("#ap-processingConsent-error")).toContainText(
    "Give permission",
  );
});
test("files enforce size/type, show genuine preview and removal; skip is explicit", async ({
  page,
}) => {
  await page.goto(path);
  await fillAbout(page);
  await next(page);
  await fillLicence(page);
  await next(page);
  await page.locator("#ap-file-certifiedId").setInputFiles({
    name: "bad.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg/>"),
  });
  await expect(page.locator("#ap-file-error-certifiedId")).toContainText(
    "only",
  );
  await next(page);
  await expect(page.locator("#ap-error-summary")).toBeVisible();
  await page.getByRole("button", { name: "Remove invalid selection" }).click();
  await page.locator("#ap-file-certifiedId").setInputFiles({
    name: "large.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  });
  await expect(page.locator("#ap-file-error-certifiedId")).toContainText(
    "5 MB",
  );
  await page.locator("#ap-file-certifiedId").setInputFiles({
    name: "sample.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6rD0AAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page.getByRole("button", { name: "Preview sample.png" }).click();
  await expect(page.locator(".ap-file-preview img")).toHaveAttribute(
    "src",
    /^blob:/,
  );
  await page.getByRole("button", { name: "Remove sample.png" }).click();
  await expect(page.locator(".ap-file-preview img")).toHaveCount(0);
  await page.locator("[data-skip]").click();
  await expect(page.locator("#ap-heading-3")).toBeVisible();
});
test("opt-in draft restores step, radio/multicheck answers and branches, but never actual files or permissions", async ({
  page,
}) => {
  await page.goto(path);
  await page.locator("#ap-save-optin").check();
  await toReview(page, true);
  await page.locator('[name="processingConsent"]').check();
  await expect(page.locator("#ap-save-status")).toContainText("Saved ✓");
  await page.reload();
  await expect(page.locator("#ap-heading-4")).toBeVisible();
  await expect(page.locator("#ap-review")).toContainText(
    "NOT attached. Reselect",
  );
  await expect(page.locator('[name="processingConsent"]')).not.toBeChecked();
  await page.getByRole("button", { name: "Edit Licence & experience" }).click();
  await expect(page.locator('[name="vehicles"][value="Rigid"]')).toBeChecked();
  await expect(page.locator('[name="vehicles"][value="Tanker"]')).toBeChecked();
  await expect(page.locator('[name="prdp"][value="No"]')).toBeChecked();
  await expect(page.locator("#ap-prdp-branch")).toBeHidden();
  await next(page);
  await page.getByRole("button", { name: "Edit Preferences" }).click();
  await expect(
    page.locator('[name="preferredProvinces"][value="Gauteng"]'),
  ).toBeChecked();
  await expect(
    page.locator('[name="preferredProvinces"][value="Limpopo"]'),
  ).toBeChecked();
  await page.locator("#ap-clear").click();
  expect(
    await page.evaluate(() => localStorage.getItem("chc.driver-draft.v1")),
  ).toBeNull();
});
test("corrupt, expired and blocked storage do not prevent using the form", async ({
  page,
}) => {
  await page.goto(path);
  await page.evaluate(() =>
    localStorage.setItem("chc.driver-draft.v1", "{broken"),
  );
  await page.reload();
  await expect(page.locator("#ap-heading-0")).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem(
      "chc.driver-draft.v1",
      JSON.stringify({
        version: 1,
        expires: 1,
        answers: { firstName: "Expired" },
      }),
    ),
  );
  await page.reload();
  await expect(page.locator('[name="firstName"]')).toHaveValue("");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("full", "QuotaExceededError");
    };
  });
  await page.locator("#ap-save-optin").check();
  await page.locator('[name="firstName"]').fill("Test");
  await expect(page.locator("#ap-save-status")).toContainText("Not saved");
  await expect(page.locator('[name="firstName"]')).toHaveValue("Test");
});
test("real test-server acceptance stores uploaded bytes and shows receipt; local duplicate is accurately scoped and reset works", async ({
  page,
}) => {
  await page.goto(path);
  await toReview(page, true);
  await page.locator('[name="processingConsent"]').check();
  const response = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/applications") && r.request().method() === "POST",
  );
  await page.locator("#ap-submit").click();
  const received = await response;
  expect(received.status()).toBe(201);
  await expect(page.locator("#ap-success-title")).toHaveText(
    "Test application stored.",
  );
  await expect(page.locator("#ap-reference")).toHaveText(/^CHC-[A-F0-9]{12}$/);
  await expect(page.locator("#ap-success-description")).toContainText(
    "not a live recruitment application",
  );
  await page.reload();
  await expect(page.locator("#ap-existing")).toBeVisible();
  await expect(page.locator("#ap-existing")).toContainText(
    "not an ID-number search",
  );
  page.once("dialog", (d) => d.accept());
  await page.locator("#ap-existing [data-new]").click();
  await expect(page.locator("#ap-heading-0")).toBeVisible();
  await expect(page.locator('[name="firstName"]')).toHaveValue("");
  await expect(page.locator("#ap-error-summary")).toBeHidden();
  await expect(page.locator("#ap-save-optin")).not.toBeChecked();
});
test("network failure never claims received and retries preserve the request key", async ({
  page,
}) => {
  const ids = [];
  await page.route("**/api/applications", (route) => {
    ids.push(route.request().headers()["idempotency-key"]);
    return route.abort("failed");
  });
  await page.goto(path);
  await toReview(page);
  await page.locator('[name="processingConsent"]').check();
  await page.locator("#ap-submit").click();
  await expect(page.locator("#ap-error-summary")).toContainText(
    "Receipt could not be confirmed",
  );
  await expect(page.locator("#ap-success")).toBeHidden();
  await page.locator("#ap-submit").click();
  await expect(page.locator("#ap-error-summary")).toContainText(
    "Receipt could not be confirmed",
  );
  expect(ids).toHaveLength(2);
  expect(ids[0]).toBe(ids[1]);
});
test("unavailable API disables submission without a simulated success", async ({
  page,
}) => {
  await page.route("**/api/applications/config", (route) =>
    route.fulfill({ status: 503, body: "{}" }),
  );
  await page.goto(path);
  await expect(page.locator("#ap-service-status")).toContainText("unavailable");
  await toReview(page);
  await expect(page.locator("#ap-submit")).toBeDisabled();
  await expect(page.locator("#ap-success")).toBeHidden();
});
test("no-JavaScript fallback retains FAQs and safe assisted route", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:5173/apply");
  await expect(page.locator("noscript p")).toContainText(
    "No information has been sent",
  );
  await expect(page.locator("#ap-form")).toBeHidden();
  await page.getByText("Can I apply without a PrDP?", { exact: true }).click();
  await expect(page.locator(".ap-faq details").first()).toHaveAttribute(
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
test("mobile widths, sticky progress below actual shared header, touch targets and accessibility", async ({
  page,
}) => {
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(path);
    await expect(page.locator("#ap-form")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.evaluate(() => window.scrollTo(0, 650));
    await page.waitForTimeout(50);
    const position = await page.evaluate(() => ({
      header: document.querySelector(".site-header").getBoundingClientRect()
        .bottom,
      progress: document.querySelector(".ap-progress").getBoundingClientRect()
        .top,
    }));
    expect(Math.abs(position.header - position.progress)).toBeLessThanOrEqual(
      1,
    );
  }
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await toReview(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
