import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const escape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");

export function writeServicePage({
  path,
  outputPath = path,
  title,
  description,
  ogDescription,
  css,
  pageClass,
  content,
  service = true,
  navigation = service ? "/services" : null,
  navigationMenu,
  ogType = "website",
  robots,
}) {
  let html = readFileSync(`${root}index.html`, "utf8");
  html = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${escape(description)}">`,
    )
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="https://www.citizenhc.co.za${path}">`,
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${escape(title)}">`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${escape(ogDescription)}">`,
    )
    .replace(
      '<link rel="stylesheet" href="/src/style.css" />',
      `<link rel="stylesheet" href="/src/style.css" />${service ? '<link rel="stylesheet" href="/src/conferences.css" />' : ""}${[
        css,
      ]
        .flat()
        .map((file) => `<link rel="stylesheet" href="/src/${file}" />`)
        .join("")}`,
    )
    .replace(
      /<main id="main">[\s\S]*?<\/main>/,
      `<main id="main" class="${pageClass}${service ? " conference-page" : ""}">${content}</main>`,
    )
    .replaceAll(/\saria-current="page"/g, "");
  if (navigation && navigation !== path)
    html = html.replaceAll(
      `href="${navigation}"`,
      `href="${navigation}" aria-current="true"`,
    );
  html = html.replaceAll(
    `href="${path}"`,
    `href="${path}" aria-current="page"`,
  );
  if (navigationMenu)
    html = html.replace(
      `id="${navigationMenu}-menu-trigger"`,
      `id="${navigationMenu}-menu-trigger" aria-current="true"`,
    );
  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="${escape(ogType)}">`,
  );
  if (robots)
    html = html.replace(
      "</head>",
      `<meta name="robots" content="${escape(robots)}"></head>`,
    );
  mkdirSync(`${root}${outputPath}`, { recursive: true });
  writeFileSync(`${root}${outputPath}/index.html`, html);
}
