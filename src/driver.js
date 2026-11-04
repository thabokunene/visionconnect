import { activate, animations } from "./experience.js";
import { renderDriverContent } from "./driver-content.js";
import { driverTitle } from "./driver-data.js";
import "./driver.css";

export function renderDriver(main) {
  document.title = driverTitle;
  main.classList.add("driver-page", "conference-page");
  if (!main.querySelector("#driver-title"))
    main.innerHTML = renderDriverContent();
  activate({ preserveFooter: true });
  animations(main);
}
