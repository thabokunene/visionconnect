import { writeServicePage } from "./static-service.js";
import { renderDriverContent } from "../src/driver-content.js";
import {
  driverPath,
  driverTitle,
  driverDescription,
  driverOgDescription,
} from "../src/driver-data.js";
writeServicePage({
  path: driverPath,
  title: driverTitle,
  description: driverDescription,
  ogDescription: driverOgDescription,
  css: "driver.css",
  pageClass: "driver-page",
  content: renderDriverContent(),
});
console.log(
  "Generated static Driver Recruitment page: services/driver-recruitment/index.html.",
);
