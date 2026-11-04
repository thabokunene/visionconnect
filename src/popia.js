import { renderPopiaContent } from "./popia-content.js";
import { popiaTitle, popiaPath } from "./popia-data.js";
import "./popia.css";
import { enhanceLegalDocument } from "./legal-document.js";

export function renderPopia(main) {
  document.title = popiaTitle;
  main.classList.add("popia-page");
  if (!main.querySelector("#popia-title"))
    main.innerHTML = renderPopiaContent();
  document
    .querySelectorAll(`a[href="${popiaPath}"]`)
    .forEach((link) => link.setAttribute("aria-current", "page"));
  enhanceLegalDocument(main);
}
