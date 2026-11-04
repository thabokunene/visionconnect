import { activate, animations } from "./experience.js";
import { renderHrContent } from "./hr-content.js";
import { hrTitle, hrQuestions, scoreHrHealth } from "./hr-data.js";
import "./hr.css";

export function renderHr(main) {
  document.title = hrTitle;
  main.classList.add("hr-page", "conference-page");
  if (!main.querySelector("#hr-title")) main.innerHTML = renderHrContent();
  activate({ preserveFooter: true });
  bindTabs(main);
  bindHealth(main);
  animations(main);
}

function bindTabs(root) {
  const nav = root.querySelector(".hm-tabs-nav");
  const tabs = [...nav.querySelectorAll("[data-hr-tab]")];
  const panels = [...root.querySelectorAll("[data-hr-panel]")];
  const desktop = matchMedia("(min-width: 1024px)");
  nav.setAttribute("role", "tablist");
  function orientation() {
    nav.setAttribute(
      "aria-orientation",
      desktop.matches ? "vertical" : "horizontal",
    );
  }
  function select(index, focus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panels[i].id);
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].setAttribute("role", "tabpanel");
      panels[i].setAttribute("aria-labelledby", tab.id);
      panels[i].tabIndex = 0;
      panels[i].hidden = i !== index;
    });
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", (event) => {
      event.preventDefault();
      select(index, true);
    });
    tab.addEventListener("keydown", (event) => {
      let target;
      const next = desktop.matches ? "ArrowDown" : "ArrowRight";
      const previous = desktop.matches ? "ArrowUp" : "ArrowLeft";
      if (event.key === next) target = (index + 1) % tabs.length;
      if (event.key === previous)
        target = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") target = 0;
      if (event.key === "End") target = tabs.length - 1;
      // Anchors have native Enter activation; Space must activate a tab too.
      if (event.key === " ") target = index;
      if (target !== undefined) {
        event.preventDefault();
        select(target, true);
      }
    });
  });
  desktop.addEventListener("change", orientation);
  orientation();
  const fromHash = panels.findIndex(
    (panel) => `#${panel.id}` === location.hash,
  );
  select(fromHash < 0 ? 0 : fromHash);
  window.addEventListener("hashchange", () => {
    const index = panels.findIndex((panel) => `#${panel.id}` === location.hash);
    if (index < 0) return;
    select(index);
    panels[index].scrollIntoView({ block: "start" });
  });
}

function bindHealth(root) {
  const form = root.querySelector("#healthForm");
  const questions = [...form.querySelectorAll("fieldset")];
  const result = root.querySelector("#healthResult");
  const announcement = root.querySelector("#healthAnnouncement");
  const progress = root.querySelector("#healthProgress");
  const progressLabel = root.querySelector("#healthProgressLabel");
  const score = root.querySelector("#healthScore");
  const headline = root.querySelector("#healthHeadline");
  const body = root.querySelector("#healthBody");
  const gaps = root.querySelector("#healthGaps");
  questions.forEach((fieldset) => (fieldset.disabled = false));
  form.addEventListener("submit", (event) => event.preventDefault());
  function update(reset = false) {
    const data = new FormData(form);
    const answers = hrQuestions.map((q, i) => data.get(`hr-q${i + 1}`));
    const state = scoreHrHealth(answers);
    questions.forEach((fieldset, i) =>
      fieldset.classList.toggle(
        "is-answered",
        hrQuestions[i].choices.some(([value]) => value === answers[i]),
      ),
    );
    const label = `Answered ${state.answered} of ${hrQuestions.length}`;
    progressLabel.textContent = label;
    progress.setAttribute("aria-valuenow", state.answered);
    progress.setAttribute("aria-valuetext", label);
    progress.style.setProperty(
      "--health-progress",
      `${(state.answered / hrQuestions.length) * 100}%`,
    );
    result.hidden = !state.complete;
    gaps.replaceChildren();
    if (!state.complete) {
      score.textContent = "0 / 6";
      headline.textContent = "Your result";
      body.textContent = "";
      announcement.textContent = reset
        ? `Health check reset. ${label}.`
        : `${label}.`;
      return;
    }
    score.textContent = `${state.score} / ${state.applicable}`;
    headline.textContent = state.headline;
    body.textContent = state.body;
    for (const gap of state.gaps) {
      const item = document.createElement("li");
      item.textContent = gap;
      gaps.append(item);
    }
    gaps.hidden = state.gaps.length === 0;
    announcement.textContent = `${label}. ${state.headline} ${state.score} of ${state.applicable} applicable foundations reported in place. Your result is below the questions. This is not a compliance determination.`;
  }
  form.addEventListener("change", () => update());
  root.querySelector("#healthReset").addEventListener("click", () => {
    form.reset();
    update(true);
    form.querySelector("input").focus();
  });
}
