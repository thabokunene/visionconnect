import { writeServicePage } from "./static-service.js";
import { renderPopiaContent } from "../src/popia-content.js";
import {
  popiaPath,
  popiaTitle,
  popiaDescription,
  popiaOgDescription,
} from "../src/popia-data.js";
writeServicePage({
  path: popiaPath,
  title: popiaTitle,
  description: popiaDescription,
  ogDescription: popiaOgDescription,
  css: "popia.css",
  pageClass: "popia-page",
  content: renderPopiaContent(),
  service: false,
  ogType: "article",
  robots: "noindex, follow",
});
console.log(
  "Generated draft POPIA Notice: popia-notice/index.html (approval required before indexing).",
);
