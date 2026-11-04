import { renderResources } from "./resources.js";
import { resourceMeta } from "./resources-data.js";
import { renderEmployer } from "./employer.js";
import {
  employerPath,
  employerDescription,
  employerOgDescription,
} from "./employer-data.js";
import { renderApply } from "./apply.js";
import { applyDescription } from "./apply-content.js";
import { renderConduct } from "./conduct.js";
import {
  conductPath,
  conductDescription,
  conductOgDescription,
} from "./conduct-data.js";
import { renderPopia } from "./popia.js";
import {
  popiaPath,
  popiaDescription,
  popiaOgDescription,
} from "./popia-data.js";
import { renderDriver } from "./driver.js";
import {
  driverPath,
  driverDescription,
  driverOgDescription,
} from "./driver-data.js";
import { renderHr } from "./hr.js";
import { hrPath, hrDescription, hrOgDescription } from "./hr-data.js";
import { renderRpl } from "./rpl.js";
import { rplPath, rplDescription, rplOgDescription } from "./rpl-data.js";
import {
  renderAudience,
  audiencePath,
  audienceDescription,
} from "./audience.js";
import {
  renderTraining,
  renderTrainingDetail,
  isTrainingDetail,
} from "./training.js";
import { trainingPath, trainingDescription } from "./training-data.js";
import {
  renderConferences,
  renderEvents,
  isEventRoute,
  conferenceDescription,
} from "./conferences.js";
import { renderContact } from "./contact.js";
import "./contact.css";

const menu = document.querySelector("#mobile-menu");
const menuToggle = document.querySelector(".menu-toggle");
let savedOverflow = "";
menuToggle.addEventListener("click", () => {
  savedOverflow = document.body.style.overflow;
  menu.showModal();
  document.body.style.overflow = "hidden";
  menuToggle.setAttribute("aria-expanded", "true");
});
document
  .querySelector(".close-menu")
  .addEventListener("click", () => menu.close());
menu.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const controls = [
    ...menu.querySelectorAll(
      "a[href], button, input, select, textarea, summary, [tabindex]",
    ),
  ].filter(
    (el) => el.tabIndex >= 0 && !el.disabled && el.getClientRects().length > 0,
  );
  const first = controls[0];
  const last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
menu.addEventListener("close", () => {
  document.body.style.overflow = savedOverflow;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.focus();
});
menu
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", () => menu.close()));
const wideScreen = window.matchMedia("(min-width: 1000px)");
wideScreen.addEventListener("change", (event) => {
  if (event.matches && menu.open) menu.close();
});
document.querySelectorAll(".nav-group").forEach((group) => {
  const trigger = group.querySelector("button");
  const dropdown = group.querySelector(".nav-dropdown");
  function setDropdown(open) {
    trigger.setAttribute("aria-expanded", String(open));
    dropdown.hidden = !open;
  }
  trigger.addEventListener("click", () => setDropdown(dropdown.hidden));
  group.addEventListener("focusout", (event) => {
    if (!group.contains(event.relatedTarget)) setDropdown(false);
  });
  document.addEventListener("click", (event) => {
    if (!group.contains(event.target)) setDropdown(false);
  });
  group.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      trigger.focus();
      setDropdown(false);
    }
  });
  dropdown
    .querySelectorAll("a")
    .forEach((link) =>
      link.addEventListener("click", () => setDropdown(false)),
    );
});
const sectionLinks = [...document.querySelectorAll(".section-nav a")];
function updateSection() {
  const sectionNav = document.querySelector(".section-nav");
  if (!sectionNav) return;
  const threshold = sectionNav.getBoundingClientRect().bottom + 90;
  let active = sectionLinks[0];
  sectionLinks.forEach((link) => {
    if (
      document.querySelector(link.hash).getBoundingClientRect().top <= threshold
    )
      active = link;
  });
  sectionLinks.forEach((link) => {
    link.classList.toggle("active", link === active);
    if (link === active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}
let scrollPending = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => {
      updateSection();
      scrollPending = false;
    });
  },
  { passive: true },
);
window.addEventListener("resize", updateSection);
updateSection();
document.querySelector("#year").textContent = new Date().getFullYear();
// The supplied About submenu paths resolve to the corresponding sections.
const sectionAliases = {
  "/about/our-purpose": "purpose",
  "/about/our-team": "team",
  "/about/sustainability": "sustainability",
};
if (sectionAliases[window.location.pathname]) {
  const hash = `#${sectionAliases[window.location.pathname]}`;
  history.replaceState(null, "", `/about${hash}`);
  requestAnimationFrame(() => document.querySelector(hash).scrollIntoView());
}

// Supplementary routes are explicit about what is and isn't connected yet.
const pathname = location.pathname.replace(/\/$/, "") || "/";
if (!["/about", ...Object.keys(sectionAliases)].includes(pathname)) {
  document.querySelector(".section-nav")?.remove();
  const main = document.querySelector("main");
  const isApply = pathname === "/apply";
  const resourceMetadata = resourceMeta(pathname);
  // The production SPA fallback is Home. Do not leak its scoped styles into
  // existing client-rendered pages such as Contact, events and training.
  if (!resourceMetadata) main.classList.remove("resource-page", "site-page");
  document
    .querySelectorAll('[aria-current="page"]')
    .forEach((el) => el.removeAttribute("aria-current"));
  if (resourceMetadata) {
    renderResources(main, pathname);
  } else if (pathname === employerPath) {
    renderEmployer(main);
  } else if (isApply) {
    renderApply(main);
  } else if (pathname === conductPath) {
    renderConduct(main);
  } else if (pathname === popiaPath) {
    renderPopia(main);
  } else if (pathname === driverPath) {
    renderDriver(main);
  } else if (pathname === hrPath) {
    renderHr(main);
  } else if (pathname === rplPath) {
    renderRpl(main);
  } else if (pathname === audiencePath) {
    renderAudience(main);
  } else if (pathname === trainingPath) {
    renderTraining(main);
  } else if (isTrainingDetail(pathname)) {
    renderTrainingDetail(main, pathname);
  } else if (pathname === "/what-we-do/conferences") {
    renderConferences(main);
  } else if (isEventRoute(pathname)) {
    renderEvents(main, pathname);
  } else if (pathname === "/contact") {
    renderContact(main);
    document
      .querySelector(".header-contact")
      .setAttribute("aria-current", "page");
    document
      .querySelector('#mobile-menu a[href="/contact?path=employer"]')
      .setAttribute("aria-current", "page");
  } else {
    const title = "Page not found";
    document.title = `${title} | Citizen Human Capital`;
    main.innerHTML =
      '<section class="intake"><div class="container planned-page"><a href="/about" class="intake-back">← Back to About Citizen</a><p class="eyebrow">CITIZEN HUMAN CAPITAL</p><h1></h1><p class="intro"></p><a class="btn btn-primary" href="mailto:reception@citizenhc.co.za">Email Citizen <svg aria-hidden="true"><use href="#arrow"/></svg></a></div></section>';
    main.querySelector("h1").textContent = title;
    main.querySelector(".intro").textContent =
      "We couldn’t find this page. Return to our story or get in touch and we’ll point you in the right direction.";
  }
  document.querySelector("link[rel=canonical]").href =
    `https://www.citizenhc.co.za${pathname}`;
  document.querySelector("meta[name=description]").content = resourceMetadata
    ? resourceMetadata.description
    : pathname === employerPath
      ? employerDescription
      : isApply
        ? applyDescription
        : pathname === conductPath
          ? conductDescription
          : pathname === popiaPath
            ? popiaDescription
            : pathname === driverPath
              ? driverDescription
              : pathname === hrPath
                ? hrDescription
                : pathname === rplPath
                  ? rplDescription
                  : pathname === audiencePath
                    ? audienceDescription
                    : pathname === trainingPath
                      ? trainingDescription
                      : isTrainingDetail(pathname)
                        ? "Explore this Citizen Human Capital training course and scheduled sessions. Enquire about course outlines, fees and availability."
                        : pathname === "/what-we-do/conferences"
                          ? conferenceDescription
                          : isEventRoute(pathname)
                            ? "Explore Citizen Human Capital conferences, workshops and training. Contact our team for programme and booking information."
                            : pathname === "/contact"
                              ? "Contact Citizen Human Capital at reception@citizenhc.co.za or +27 11 451 9898. Find us at Block C, Stoneridge Office Park, Modderfontein, Johannesburg."
                              : "Get in touch with Citizen Human Capital for driver recruitment, HR support and qualification enquiries in South Africa.";
  if (resourceMetadata)
    document.querySelector('meta[property="og:type"]').content =
      resourceMetadata.ogType;
  document.querySelector('meta[property="og:title"]').content = document.title;
  document.querySelector('meta[property="og:description"]').content =
    resourceMetadata
      ? resourceMetadata.description
      : pathname === employerPath
        ? employerOgDescription
        : pathname === conductPath
          ? conductOgDescription
          : pathname === popiaPath
            ? popiaOgDescription
            : pathname === driverPath
              ? driverOgDescription
              : pathname === hrPath
                ? hrOgDescription
                : pathname === rplPath
                  ? rplOgDescription
                  : pathname === audiencePath
                    ? "Maximise your impact with in-person events."
                    : pathname === trainingPath
                      ? "Unlock your potential with premium training courses."
                      : document.querySelector("meta[name=description]")
                          .content;
}
