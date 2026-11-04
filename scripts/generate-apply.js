import { writeServicePage } from "./static-service.js";
import {
  renderApplyContent,
  applyTitle,
  applyDescription,
} from "../src/apply-content.js";
writeServicePage({
  path: "/apply",
  title: applyTitle,
  description: applyDescription,
  ogDescription: applyDescription,
  css: "apply.css",
  pageClass: "apply-page",
  content: renderApplyContent(),
  service: false,
  robots: "noindex, follow",
});
console.log(
  "Generated /apply (pre-launch, noindex; intake mode is supplied by the application API).",
);
