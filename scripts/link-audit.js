import { courseTitles } from "../src/training-data.js";

// Crawl rendered anchors, not just HTTP status codes: an SPA can return 200
// for a missing page. Include every course even when it is behind pagination.
// Read-only: never submit forms or follow mail/phone/external destinations.
export async function auditLinks(browser, baseURL) {
  const base = new URL(baseURL);
  const context = await browser.newContext({ reducedMotion: "reduce" });
  await context.route("https://maps.google.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>External map excluded from internal link audit</title>",
    }),
  );
  const page = await context.newPage();
  const errors = [],
    external = new Set(),
    internal = new Set(),
    documents = new Map();
  let current = "";
  page.on("pageerror", (error) => errors.push(`${current}: ${error.message}`));
  const queue = [
    "/",
    "/about",
    ...courseTitles.map((course) => `/training/${course.slug}`),
  ];
  const scheduled = new Set(queue);
  try {
    for (let i = 0; i < queue.length; i++) {
      if (queue.length > 200)
        throw new Error("Link audit exceeded its 200-route safety limit");
      current = queue[i];
      const response = await page.goto(new URL(current, base).href, {
        waitUntil: "domcontentloaded",
      });
      if (!response?.ok())
        errors.push(`${current}: HTTP ${response?.status() ?? "no response"}`);
      const document = await page.evaluate(() => ({
        heading: document.querySelector("h1")?.textContent.trim(),
        headings: document.querySelectorAll("h1").length,
        text: document.querySelector("main")?.textContent || "",
        ids: [...document.querySelectorAll("[id]")].map((el) => el.id),
        anchors: [...document.querySelectorAll("a[href]")].map((a) => ({
          href: a.getAttribute("href"),
          blank: a.target === "_blank",
          rel: a.rel,
        })),
      }));
      documents.set(current, new Set(document.ids));
      if (
        !document.heading ||
        document.heading === "Page not found" ||
        document.headings !== 1
      )
        errors.push(`${current}: missing/invalid page heading`);
      if (/This page is not published yet\./i.test(document.text))
        errors.push(`${current}: placeholder page`);
      for (const anchor of document.anchors) {
        const raw = anchor.href?.trim();
        if (!raw || raw === "#" || /^javascript:/i.test(raw)) {
          errors.push(`${current}: empty/unsafe link ${raw}`);
          continue;
        }
        let url;
        try {
          url = new URL(raw, new URL(current, base));
        } catch {
          errors.push(`${current}: malformed link ${raw}`);
          continue;
        }
        if (["mailto:", "tel:"].includes(url.protocol)) {
          if (
            url.protocol === "mailto:" &&
            !/^mailto:[^?@\s]+@[^?@\s]+/i.test(raw)
          )
            errors.push(`${current}: invalid email link ${raw}`);
          if (url.protocol === "tel:" && !/^\+?[\d\s()-]+$/.test(url.pathname))
            errors.push(`${current}: invalid phone link ${raw}`);
          continue;
        }
        if (!["http:", "https:"].includes(url.protocol)) {
          errors.push(`${current}: unsupported link ${raw}`);
          continue;
        }
        if (anchor.blank && !anchor.rel.split(/\s+/).includes("noopener"))
          errors.push(`${current}: new-tab link without noopener: ${raw}`);
        if (
          url.origin !== base.origin &&
          url.hostname !== "www.citizenhc.co.za"
        ) {
          external.add(url.href);
          continue;
        }
        const path = url.pathname.replace(/\/$/, "") || "/";
        internal.add(`${path}${url.search}${url.hash}`);
        if (!scheduled.has(path)) {
          scheduled.add(path);
          queue.push(path);
        }
      }
    }
    for (const target of internal) {
      const url = new URL(target, base);
      const path = url.pathname.replace(/\/$/, "") || "/";
      if (!url.hash) continue;
      let id;
      try {
        id = decodeURIComponent(url.hash.slice(1));
      } catch {
        errors.push(`${target}: malformed fragment`);
        continue;
      }
      if (!documents.get(path)?.has(id))
        errors.push(`${target}: fragment target does not exist`);
    }
    return {
      routes: documents.size,
      internalLinks: internal.size,
      externalLinksNotFetched: [...external].sort(),
      errors,
    };
  } finally {
    await context.close();
  }
}
