import { writeServicePage } from "./static-service.js";
import { renderConductContent } from "../src/conduct-content.js";
import {
  conductPath,
  conductTitle,
  conductDescription,
  conductOgDescription,
} from "../src/conduct-data.js";
writeServicePage({
  path: conductPath,
  title: conductTitle,
  description: conductDescription,
  ogDescription: conductOgDescription,
  css: ["popia.css", "conduct.css"],
  pageClass: "popia-page conduct-page",
  content: renderConductContent(),
  service: false,
  ogType: "article",
  robots: "noindex, follow",
});
console.log(
  "Generated draft Code of Conduct: code-of-conduct/index.html (approval and reporting channels require confirmation).",
);
