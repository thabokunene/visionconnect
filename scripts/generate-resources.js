import { copyFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { sitePaths } from "../src/site-pages-data.js";
import { writeServicePage } from "./static-service.js";
import { resourcePaths, resourceMeta } from "../src/resources-data.js";
import { renderResourceContent } from "../src/resources-content.js";
const root = fileURLToPath(new URL("../", import.meta.url));
mkdirSync(`${root}about`, { recursive: true });
copyFileSync(`${root}index.html`, `${root}about/index.html`);
for (const alias of ["our-purpose", "our-team", "sustainability"]) {
  mkdirSync(`${root}about/${alias}`, { recursive: true });
  copyFileSync(`${root}index.html`, `${root}about/${alias}/index.html`);
}
for (const path of [...resourcePaths, ...sitePaths]) {
  const meta = resourceMeta(path);
  writeServicePage({
    path,
    outputPath: path === "/" ? "/home" : path,
    title: meta.title,
    description: meta.description,
    ogDescription: meta.description,
    css: "resources.css",
    pageClass: `resource-page${sitePaths.includes(path) ? " site-page" : ""}`,
    content: renderResourceContent(path),
    service: false,
    navigation: meta.nav,
    navigationMenu: meta.menu,
    ogType: meta.ogType,
    robots: "noindex, follow",
  });
}
console.log(
  `Generated ${resourcePaths.length + sitePaths.length} resource/site documents and the preserved About document.`,
);
