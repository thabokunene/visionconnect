import { renderConductContent } from "./conduct-content.js";
import { conductTitle, conductPath } from "./conduct-data.js";
import { enhanceLegalDocument } from "./legal-document.js";
import "./popia.css";
import "./conduct.css";

export function renderConduct(main) {
  document.title = conductTitle;
  main.classList.add("popia-page", "conduct-page");
  if (!main.querySelector("#conduct-title"))
    main.innerHTML = renderConductContent();
  document
    .querySelectorAll(`a[href="${conductPath}"]`)
    .forEach((link) => link.setAttribute("aria-current", "page"));
  enhanceLegalDocument(main);
}
