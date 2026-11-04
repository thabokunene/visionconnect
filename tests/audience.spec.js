import { test, expect } from "@playwright/test";
const path = "/what-we-do/audience-marketing";
const canonical = `https://www.citizenhc.co.za${path}`;

async function fillRequired(page) {
  await page.locator("#fName").fill("Lerato Molefe");
  await page.locator("#fJob").fill("Marketing Director");
  await page.locator("#fEmail").fill("lerato+events@example.org");
  await page.locator("#fCompany").fill("Example & Partners");
  await page.locator("#fConsent").check();
}
async function prepare(page) {
  await page.getByRole("button", { name: "Prepare email enquiry" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("Audience Marketing has supplied content, metadata and confirmed contact details", async ({
  page,
}) => {
  await page.goto(path);
  await expect(page).toHaveTitle("Audience Marketing | Citizen Human Capital");
  await expect(page.locator("h1")).toHaveText("Audience Marketing");
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
    "href",
    canonical,
  );
  await expect(page.locator("meta[name=description]")).toHaveAttribute(
    "content",
    "Sponsorship and engagement opportunities across 50+ annual conferences, workshops and training sessions. Connect with C-suite decision-makers and sector leaders across seven industries.",
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    "Maximise your impact with in-person events.",
  );
  await expect(page.locator(".cn-stat")).toHaveText([
    "26",
    "50+",
    "70+",
    "10,000+",
  ]);
  await expect(page.locator(".am-benefit")).toHaveCount(4);
  await expect(page.locator(".am-audience-list li")).toHaveCount(6);
  await expect(page.locator(".am-opportunity")).toHaveCount(4);
  await expect(page.locator(".am-testimonial")).toContainText(
    "National financial services group · Gauteng",
  );
  await expect(page.locator(".am-contact-list")).toContainText(
    "+27 11 451 9898",
  );
  await expect(page.locator(".am-contact-list address")).toContainText(
    "8 Greenstone Pl, Modderfontein",
  );
  await expect(page.locator(".am-contact-list address")).toContainText(
    "Johannesburg, Gauteng, 1609",
  );
  await expect(
    page.locator(
      '.am-contact-list a[href="mailto:sponsorship@citizenhc.co.za"]',
    ),
  ).toBeVisible();
  await expect(
    page.locator('.cn-footer a[href="mailto:reception@citizenhc.co.za"]'),
  ).toHaveCount(1);
  await expect(page.locator(`.cn-footer a[href="${path}"]`)).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.locator("#fEnquiry option")).toHaveCount(8);
  await expect(page.locator("main")).not.toContainText("000 000");
});

test("hero links lead to the sponsorship form and real event catalogue", async ({
  page,
}) => {
  await page.goto(path);
  await page.locator('.am-hero-actions a[href="#enquire"]').click();
  await expect(page).toHaveURL(`${path}#enquire`);
  await expect(page.locator("#enquire-title")).toBeInViewport();
  await page.locator('.am-hero-actions a[href="/events"]').click();
  await expect(page.locator("h1")).toHaveText("All conferences");
  await expect(page.locator(".cn-event")).toHaveCount(8);
});

test("empty and whitespace fields have associated errors and focus the first invalid field", async ({
  page,
}) => {
  await page.goto(path);
  await prepare(page);
  await expect(page.locator('#sponsorForm [aria-invalid="true"]')).toHaveCount(
    5,
  );
  await expect(page.locator("#fName")).toBeFocused();
  for (const id of ["fName", "fJob", "fEmail", "fCompany", "fConsent"]) {
    await expect(page.locator(`#${id}`)).toHaveAttribute(
      "aria-describedby",
      `${id}Error`,
    );
    await expect(page.locator(`#${id}Error`)).toBeVisible();
  }
  for (const id of ["fName", "fJob", "fCompany"])
    await page.locator(`#${id}`).fill("   ");
  await page.locator("#fEmail").fill("invalid@localhost");
  await prepare(page);
  await expect(page.locator('#sponsorForm [aria-invalid="true"]')).toHaveCount(
    5,
  );
  await fillRequired(page);
  await expect(page.locator('#sponsorForm [aria-invalid="true"]')).toHaveCount(
    0,
  );
  await expect(page.locator("#fNameError")).toBeHidden();
  await page.locator("#fConsent").uncheck();
  await prepare(page);
  await expect(page.locator("#fConsent")).toBeFocused();
  await expect(page.locator("#formStatus a")).toHaveCount(0);
});

test("email draft encodes all fields safely without sending, resetting or storing personal data", async ({
  page,
}) => {
  await page.goto(path);
  await fillRequired(page);
  const message =
    "<img src=x onerror=alert(1)> & budget=R100,000\nPlease discuss 2027 + speaking.";
  await page.locator("#fName").fill("Lerato & Thabo");
  await page.locator("#fPhone").fill("+27 11 555 0123");
  await page.locator("#fEnquiry").selectOption("Speaking opportunities");
  await page.locator("#fMessage").fill(message);
  const requests = [];
  page.on("request", (request) => {
    if (
      request.method() !== "GET" ||
      ["fetch", "xhr"].includes(request.resourceType())
    )
      requests.push(request.url());
  });
  await prepare(page);
  await expect(page.locator("#formStatus")).toContainText(
    "Nothing has been sent yet",
  );
  const link = page.locator("#formStatus a");
  await expect(link).toBeFocused();
  const mailto = new URL(await link.getAttribute("href"));
  expect(mailto.protocol).toBe("mailto:");
  expect(mailto.pathname).toBe("sponsorship@citizenhc.co.za");
  expect([...mailto.searchParams.keys()]).toEqual(["subject", "body"]);
  expect(mailto.searchParams.get("subject")).toBe(
    "Sponsorship enquiry: Speaking opportunities",
  );
  const body = mailto.searchParams.get("body");
  for (const value of [
    "Lerato & Thabo",
    "Marketing Director",
    "lerato+events@example.org",
    "+27 11 555 0123",
    "Example & Partners",
    "Speaking opportunities",
    message,
    "Consent: I agree",
    "Source: Audience Marketing",
    canonical,
  ])
    expect(body).toContain(value);
  await expect(page.locator("#fMessage")).toHaveValue(message);
  await expect(page.locator("#fConsent")).toBeChecked();
  await expect(page).toHaveURL(path);
  await expect(page.locator("main img")).toHaveCount(0);
  expect(requests).toEqual([]);
  expect(
    await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage }),
    ),
  ).not.toContain("lerato");
});

test("optional fields can stay blank and edits remove a stale draft", async ({
  page,
}) => {
  await page.goto(path);
  await fillRequired(page);
  await prepare(page);
  const mailto = new URL(
    await page.locator("#formStatus a").getAttribute("href"),
  );
  expect(mailto.searchParams.get("subject")).toBe(
    "Sponsorship enquiry: Sponsorship opportunities",
  );
  expect(mailto.searchParams.get("body")).toContain("Phone: Not provided");
  await page.locator("#fCompany").fill("Updated company");
  await expect(page.locator("#formStatus")).toBeEmpty();
  await prepare(page);
  await page.locator("#fEnquiry").selectOption("Awards");
  await expect(page.locator("#formStatus a")).toHaveCount(0);
  await prepare(page);
  await page.locator("#fConsent").uncheck();
  await expect(page.locator("#formStatus a")).toHaveCount(0);
  await prepare(page);
  await expect(page.locator("#fConsent")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});

test("honeypot prevents draft preparation without false delivery confirmation", async ({
  page,
}) => {
  await page.goto(path);
  await fillRequired(page);
  await page.locator("#hpLinkedin").evaluate((el) => {
    el.value = "bot-filled";
  });
  await prepare(page);
  await expect(page.locator("#formStatus")).toContainText(
    "Unable to prepare this enquiry",
  );
  await expect(page.locator("#formStatus a")).toHaveCount(0);
  await expect(page.locator("#fName")).toHaveValue("Lerato Molefe");
});

test("Audience navigation works on desktop and mobile with shared promo dismissal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/what-we-do/training-courses");
  await page
    .getByRole("button", { name: "Dismiss promotional banner" })
    .click();
  await page.locator("#what-menu-trigger").click();
  await page.locator(`#what-menu a[href="${path}"]`).click();
  await expect(page.locator("h1")).toHaveText("Audience Marketing");
  await expect(page.locator(".cn-promo")).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");
  await page.locator(".menu-toggle").click();
  await page
    .locator(".mobile-what summary")
    .filter({ hasText: "What we do" })
    .click();
  await page.locator(`#mobile-menu a[href="${path}"]`).click();
  await expect(page.locator("h1")).toHaveText("Audience Marketing");
  await expect(page.locator("#mobile-menu")).not.toBeVisible();
});

test("Audience Marketing is responsive across seven widths with no browser errors", async ({
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
  }
  expect(errors).toEqual([]);
});

test("Audience page, invalid form and ready draft pass automated WCAG A/AA checks", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    for (const state of ["initial", "invalid", "ready"]) {
      if (state === "invalid") await prepare(page);
      if (state === "ready") {
        await fillRequired(page);
        await prepare(page);
      }
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(
        results.violations,
        `${width}px ${state}: ${JSON.stringify(results.violations)}`,
      ).toEqual([]);
    }
  }
});

test("reduced motion silences reveals, hover and shine while keeping counters final", async ({
  page,
}) => {
  await page.goto(path);
  await expect(page.locator("main")).not.toHaveClass(/cn-motion/);
  await expect(page.locator(".cn-stat")).toHaveText([
    "26",
    "50+",
    "70+",
    "10,000+",
  ]);
  const animations = await page
    .locator(".am-benefit,.am-opportunity,.am-testimonial,.am-hero .btn")
    .evaluateAll((elements) =>
      elements.map((el) => ({
        duration: getComputedStyle(el).transitionDuration,
        animation: getComputedStyle(el, "::before").animationName,
      })),
    );
  for (const animation of animations) {
    expect(
      animation.duration.split(",").every((value) => parseFloat(value) === 0),
    ).toBe(true);
    expect(animation.animation).toBe("none");
  }
});

test("animated counters settle and a live reduced-motion change reveals all content", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(path);
  await page.locator(".cn-stats").scrollIntoViewIfNeeded();
  await expect(page.locator('[data-count="10000"]')).toHaveText("10,000+");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("main")).not.toHaveClass(/cn-motion/);
  await expect(page.locator("#enquire-title")).toHaveCSS("opacity", "1");
});
