import { writeServicePage } from "./static-service.js";
import { renderEmployerContent } from "../src/employer-content.js";
import {
  employerPath,
  employerTitle,
  employerDescription,
  employerOgDescription,
} from "../src/employer-data.js";
writeServicePage({
  path: employerPath,
  title: employerTitle,
  description: employerDescription,
  ogDescription: employerOgDescription,
  css: "employer.css",
  pageClass: "employer-page",
  content: renderEmployerContent(),
  service: false,
  robots: "noindex, follow",
});
console.log(
  "Generated /employers (pre-launch review; enquiry service remains test-only).",
);
