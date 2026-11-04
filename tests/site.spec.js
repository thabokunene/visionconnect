import { test, expect } from "@playwright/test";

// Isolate our UI checks from the availability of the external map provider.
// Live geocoding/marker placement still needs a production-browser check.
test.beforeEach(async ({ page }) => {
  await page.route("https://maps.google.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><html lang="en"><head><title>Map test double</title></head><body><main>External map provider test double</main></body></html>',
    }),
  );
});

test("About metadata, heading and section navigation", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/about");
  await expect(page).toHaveTitle(
    "About Citizen Human Capital | Driver Recruitment, HR & Qualifications South Africa",
  );
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText(
    "We started with a frustration. Good people and good jobs keep missing each other.",
  );
  await page.locator('.section-nav a[href="#sustainability"]').click();
  await expect(
    page.locator('.section-nav a[href="#sustainability"]'),
  ).toHaveAttribute("aria-current", "location");
  const pillar = page.locator(".impact-item").nth(1);
  await pillar.locator("summary").click();
  await expect(pillar).toHaveAttribute("open", "");
  expect(errors).toEqual([]);
});

test("desktop dropdown supports click and Escape", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/about");
  await page.locator('[aria-controls="about-menu"]').click();
  await expect(page.locator("#about-menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#about-menu")).toBeHidden();
  await expect(page.locator('[aria-controls="about-menu"]')).toBeFocused();
});

test("no horizontal overflow at phone, tablet and desktop widths", async ({
  page,
}) => {
  for (const width of [320, 375, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/about");
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `overflow at ${width}px`,
    ).toBe(true);
  }
});

test("mobile dialog traps focus, closes with Escape and restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");
  const toggle = page.locator(".menu-toggle");
  const drawer = page.locator("#mobile-menu");
  await toggle.click();
  await expect(drawer).toBeVisible();
  await drawer.locator("a.btn").focus();
  await page.keyboard.press("Tab");
  await expect(drawer.locator(".close-menu")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await drawer.locator('a[href="/about#team"]').click();
  await expect(drawer).toBeHidden();
  await expect(page).toHaveURL(/\/about#team$/);
});

test("original About subpage paths resolve to their sections", async ({
  page,
}) => {
  for (const [path, hash] of [
    ["our-purpose", "purpose"],
    ["our-team", "team"],
    ["sustainability", "sustainability"],
  ]) {
    await page.goto(`/about/${path}`);
    await expect(page).toHaveURL(new RegExp(`/about#${hash}$`));
  }
});

for (const route of ["/contact?path=employer"]) {
  test(`${route} validates and prepares an email without claiming delivery`, async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(route);
    await page.locator("button[type=submit]").click();
    await expect(page.locator(".email-status a")).toHaveCount(0);
    await page.locator("[name=name]").fill("Test Person");
    await page.locator("[name=email]").fill("test@example.com");
    await page.locator("[name=topic]").selectOption({ index: 1 });
    await page
      .locator("[name=message]")
      .fill("Please contact me about opportunities.");
    if (route.startsWith("/contact")) {
      await page.locator("[name=jobTitle]").fill("Fleet manager");
      await page.locator("[name=company]").fill("Example Logistics");
      await page.locator("[name=phone]").fill("+27 11 451 9898");
    } else {
      await page.locator("[name=consent]").check();
    }
    await page.locator("button[type=submit]").click();
    await expect(page.locator(".email-status")).toContainText(
      "Nothing has been sent yet.",
    );
    await expect(page.locator(".email-status a")).toHaveAttribute(
      "href",
      /^mailto:reception@citizenhc.co.za\?subject=/,
    );
    await page.evaluate(() => scrollTo(0, 300));
    expect(errors).toEqual([]);
  });
}

test("draft legal content and unknown routes are not fabricated", async ({
  page,
}) => {
  await page.goto("/privacy-policy");
  await expect(page.locator("main")).toContainText("Draft for approval");
  await page.goto("/not-a-page");
  await expect(page.locator("h1")).toHaveText("Page not found");
});

test("About and enquiry pages pass automated WCAG A/AA checks", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const route of ["/about", "/contact", "/apply"]) {
    await page.goto(route);
    if (route === "/about") {
      await page.locator(".impact-item").evaluateAll((items) =>
        items.forEach((item) => {
          item.open = true;
        }),
      );
    }
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations, `${route} accessibility violations`).toEqual([]);
  }
});

test("contact page shows supplied contact details and address-targeted map", async ({
  page,
}) => {
  await page.goto("/contact");
  await expect(page.locator("h1")).toHaveText("Need to talk to us?");
  await expect(
    page.locator('main a[href="mailto:reception@citizenhc.co.za"]'),
  ).toBeVisible();
  await expect(page.locator('main a[href="tel:+27114519898"]')).toHaveText(
    "+27 11 451 9898",
  );
  await expect(page.locator("main address")).toContainText(
    "Block C, Stoneridge Office Park",
  );
  const map = page.locator(".contact-map-frame iframe");
  const url = new URL(await map.getAttribute("src"));
  expect(url.searchParams.get("q")).toBe(
    "Block C, Stoneridge Office Park, 8 Greenstone Pl, Modderfontein, Johannesburg, Gauteng, 1609, South Africa",
  );
  expect(url.searchParams.get("output")).toBe("embed");
  await expect(map).toHaveAttribute("title", /Citizen Human Capital/);
  await expect(page.locator(".contact-map-link")).toHaveAttribute(
    "href",
    /https:\/\/www.google.com\/maps\/dir/,
  );
  await expect(page.locator(".header-contact")).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(
    page.locator('[aria-controls="about-menu"]'),
  ).not.toHaveAttribute("aria-current");
});

test("only name, job title, email and company are required for contact", async ({
  page,
}) => {
  await page.goto("/contact");
  expect(
    await page
      .locator("form [required]")
      .evaluateAll((fields) => fields.map((field) => field.name)),
  ).toEqual(["name", "jobTitle", "email", "company"]);
  await page.locator('[name="name"]').fill("Jane & Co");
  await page.locator('[name="jobTitle"]').fill("HR Manager");
  await page.locator('[name="email"]').fill("jane@example.com");
  await page.locator('[name="company"]').fill("Example Logistics");
  await page.locator('button[type="submit"]').click();
  const link = await page.locator(".email-status a").getAttribute("href");
  const email = new URL(link);
  expect(email.pathname).toBe("reception@citizenhc.co.za");
  expect(email.searchParams.get("subject")).toContain("General enquiry");
  expect(email.searchParams.get("body")).toContain("Name: Jane & Co");
  expect(email.searchParams.get("body")).toContain("Job title: HR Manager");
  expect(email.searchParams.get("body")).toContain(
    "Company: Example Logistics",
  );
  expect(email.searchParams.get("body")).toContain("Phone: Not provided");
});

test("contact remains responsive across phone, tablet and desktop", async ({
  page,
}) => {
  for (const width of [320, 375, 390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/contact");
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `contact overflow at ${width}px`,
    ).toBe(true);
  }
});

test("contact query links select the corresponding service", async ({
  page,
}) => {
  for (const [path, topic] of [
    ["employer", "Driver recruitment & labour broking"],
    ["hr", "HR support"],
    ["rpl", "Recognition of Prior Learning"],
    ["cpd", "Professional development"],
  ]) {
    await page.goto(`/contact?path=${path}`);
    await expect(page.locator('[name="topic"]')).toHaveValue(topic);
  }
});

test("confirmed company registration appears in company facts, both footer variants and relevant legal documents", async ({
  page,
  request,
}) => {
  const number = "K2016508305";
  for (const path of [
    "/about",
    "/",
    "/contact",
    "/what-we-do/conferences",
    "/what-we-do/training-courses",
    "/privacy-policy",
    "/paia-manual",
    "/terms",
    "/popia-notice",
  ]) {
    await page.goto(path);
    await expect(page.locator(".site-footer")).toContainText(
      `Company registration: ${number}`,
    );
    if (path === "/about")
      await expect(page.locator(".glance")).toContainText(number);
    if (
      ["/privacy-policy", "/paia-manual", "/terms", "/popia-notice"].includes(
        path,
      )
    ) {
      await expect(page.locator("main")).toContainText(number);
      await expect(page.locator("main")).not.toContainText(
        "Company registration details must be verified",
      );
    }
  }
  for (const path of [
    "/",
    "/about",
    "/privacy-policy",
    "/paia-manual",
    "/terms",
    "/popia-notice",
  ]) {
    const r = await request.get(path);
    expect(await r.text()).toContain(number);
  }
});
