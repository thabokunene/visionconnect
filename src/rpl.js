import { activate, animations } from "./experience.js";
import { renderRplContent } from "./rpl-content.js";
import { rplTitle, rplSectors } from "./rpl-data.js";
import "./rpl.css";

export function renderRpl(main) {
  document.title = rplTitle;
  main.classList.add("rpl-page", "conference-page");
  // Hydrate the pre-rendered document. Also support hosts using the SPA fallback.
  if (!main.querySelector("#rpl-title")) main.innerHTML = renderRplContent();
  activate({ preserveFooter: true });
  const cards = [...main.querySelectorAll(".rp-qual-card")];
  const chips = [...main.querySelectorAll("[data-rpl-filter]")];
  const count = main.querySelector("#qualCount");
  chips.forEach((chip) => {
    chip.disabled = false;
    chip.addEventListener("click", () => {
      const filter = chip.dataset.rplFilter;
      if (filter !== "all" && !rplSectors.includes(filter)) return;
      let visible = 0;
      cards.forEach((card) => {
        card.hidden = filter !== "all" && card.dataset.sector !== filter;
        if (!card.hidden) visible++;
      });
      chips.forEach((button) =>
        button.setAttribute("aria-pressed", String(button === chip)),
      );
      count.textContent =
        filter === "all"
          ? `Showing all ${visible} qualification pathways across ten sectors.`
          : `Showing ${visible} qualification pathway${visible === 1 ? "" : "s"} in ${filter}.`;
      // Keep focus on the chip, not the results or the top of the page.
    });
  });
  animations(main);
  bindTimeline(main);
}

function bindTimeline(root) {
  const stages = root.querySelector("#rpl-stages");
  const last = stages.querySelector(".rp-stage:last-child");
  const marker = last.querySelector(".rp-stage-marker");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  function update() {
    frame = 0;
    const rect = stages.getBoundingClientRect();
    const markerSize = marker.offsetHeight;
    const height = Math.max(1, last.offsetTop);
    stages.style.setProperty("--track-height", `${height}px`);
    stages.style.setProperty("--track-top", `${markerSize / 2}px`);
    const progress = motion.matches
      ? 1
      : Math.max(
          0,
          Math.min(1, (innerHeight * 0.8 - rect.top - markerSize / 2) / height),
        );
    stages.style.setProperty("--progress", progress);
  }
  function requestUpdate() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  function setMotion() {
    window.removeEventListener("scroll", requestUpdate);
    if (!motion.matches)
      window.addEventListener("scroll", requestUpdate, { passive: true });
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    update();
  }
  window.addEventListener("resize", requestUpdate);
  motion.addEventListener("change", setMotion);
  if ("ResizeObserver" in window)
    new ResizeObserver(requestUpdate).observe(stages);
  document.fonts.ready.then(requestUpdate);
  setMotion();
}
