import { writeServicePage } from "./static-service.js";
import { renderRplContent } from "../src/rpl-content.js";
import {
  rplPath,
  rplTitle,
  rplDescription,
  rplOgDescription,
} from "../src/rpl-data.js";

writeServicePage({
  path: rplPath,
  title: rplTitle,
  description: rplDescription,
  ogDescription: rplOgDescription,
  css: "rpl.css",
  pageClass: "rpl-page",
  content: renderRplContent(),
});
console.log(
  "Generated static RPL page: services/rpl/index.html (25 pathways, no JavaScript needed to read them).",
);
