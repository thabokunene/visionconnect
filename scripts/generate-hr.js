import { writeServicePage } from "./static-service.js";
import { renderHrContent } from "../src/hr-content.js";
import {
  hrPath,
  hrTitle,
  hrDescription,
  hrOgDescription,
} from "../src/hr-data.js";

writeServicePage({
  path: hrPath,
  title: hrTitle,
  description: hrDescription,
  ogDescription: hrOgDescription,
  css: "hr.css",
  pageClass: "hr-page",
  content: renderHrContent(),
});
console.log(
  "Generated static External HR Management page: services/external-hr-management/index.html.",
);
