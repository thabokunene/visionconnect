import { resourceMeta, serviceCards } from "./resources-data.js";
import { renderResourceContent } from "./resources-content.js";
import { insightArticles, insightTopics } from "./insights-data.js";
import { enhanceLegalDocument } from "./legal-document.js";
import "./resources.css";

const normalize = (value) =>
  value
    .toLocaleLowerCase("en-ZA")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
export function renderResources(main, path) {
  const meta = resourceMeta(path);
  if (!meta) return;
  document.title = meta.title;
  main.classList.add("resource-page");
  if (
    meta.legal ||
    [
      "/",
      "/drivers",
      "/what-we-do",
      "/training-proposal",
      "/events/hotel-offers",
    ].includes(path)
  )
    main.classList.add("site-page");
  if (!main.querySelector("#rs-title"))
    main.innerHTML = renderResourceContent(path);
  if (meta.menu)
    document
      .querySelector(`#${meta.menu}-menu-trigger`)
      ?.setAttribute("aria-current", "true");
  if (meta.nav)
    document
      .querySelectorAll(`a[href="${meta.nav}"]`)
      .forEach((link) =>
        link.setAttribute("aria-current", meta.parent ? "true" : "page"),
      );
  document
    .querySelectorAll(`a[href="${path}"]`)
    .forEach((link) => link.setAttribute("aria-current", "page"));
  if (path === "/services") bindFinder(main);
  if (path === "/insights") bindLibrary(main);
  if (main.querySelector(".rs-contents"))
    enhanceLegalDocument(main, {
      contentsSelector: ".rs-contents ol a",
      printSelector: ".rs-print",
    });
  main.querySelectorAll('a[href^="#"]').forEach((link) => {
    if (link.closest(".rs-contents")) return;
    const target = document.getElementById(link.hash.slice(1));
    if (target)
      link.addEventListener("click", () =>
        (target.querySelector("h2") || target).focus({ preventScroll: true }),
      );
  });
}
function bindFinder(main) {
  main.querySelector(".rs-finder fieldset").disabled = false;
  const result = main.querySelector("#rs-recommendation");
  main.querySelectorAll('[name="service-need"]').forEach((input) =>
    input.addEventListener("change", () => {
      const service = serviceCards.find((s) => s.slug === input.value);
      result.replaceChildren();
      result.hidden = false;
      const title = document.createElement("strong");
      title.textContent = service
        ? service.title
        : "Let’s scope the need first.";
      const body = document.createElement("p");
      body.textContent = service
        ? service.description
        : "Describe the problem, your site and your timing. You do not have to choose a service before asking for help.";
      const link = document.createElement("a");
      link.href = service
        ? `/services/${service.slug}`
        : "/contact?path=employer";
      link.textContent = service
        ? `${service.link} →`
        : "Ask for scoping help →";
      result.append(title, body, link);
      main.querySelector("#rs-finder-status").textContent =
        `Suggested starting point: ${title.textContent}`;
    }),
  );
}
function bindLibrary(main) {
  const input = main.querySelector("#rs-search"),
    controls = main.querySelector(".rs-library-controls"),
    result = main.querySelector("#rs-results"),
    empty = main.querySelector("#rs-empty");
  const chips = [...main.querySelectorAll("[data-topic-filter]")];
  const cards = [...main.querySelectorAll("[data-guide]")];
  let topic = "all";
  const texts = new Map(
    insightArticles.map((a) => [
      a.slug,
      normalize(
        [
          a.title,
          a.summary,
          a.topic,
          a.takeaway,
          ...a.sections.flatMap(([, title, body, bullets = []]) => [
            title,
            body,
            ...bullets,
          ]),
        ].join(" "),
      ),
    ]),
  );
  function apply(historyMode = "replace") {
    const query = input.value.trim().slice(0, 150);
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    const matching = insightArticles.filter((a) =>
      tokens.every((token) => texts.get(a.slug).includes(token)),
    );
    let count = 0;
    cards.forEach((card) => {
      const show =
        matching.some((a) => a.slug === card.dataset.guide) &&
        (topic === "all" || card.dataset.topic === topic);
      card.hidden = !show;
      if (show) count++;
    });
    chips.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.topicFilter === topic),
      );
      const n =
        button.dataset.topicFilter === "all"
          ? matching.length
          : matching.filter((a) => a.topic === button.dataset.topicFilter)
              .length;
      button.querySelector("span").textContent = String(n);
    });
    result.textContent = `${count} ${count === 1 ? "guide" : "guides"}${topic === "all" ? "" : ` · ${topic}`}${query ? ` matching “${query}”` : ""}`;
    empty.hidden = count !== 0;
    if (historyMode) {
      const url = new URL(location.href);
      if (query) url.searchParams.set("q", query);
      else url.searchParams.delete("q");
      if (topic !== "all") url.searchParams.set("topic", topic);
      else url.searchParams.delete("topic");
      if (url.href !== location.href)
        history[historyMode === "push" ? "pushState" : "replaceState"](
          null,
          "",
          url,
        );
    }
  }
  function restore() {
    const params = new URLSearchParams(location.search);
    input.value = (params.get("q") || "").slice(0, 150);
    const requested = params.get("topic");
    topic = insightTopics.includes(requested) ? requested : "all";
    apply(null);
  }
  function clear() {
    input.value = "";
    topic = "all";
    apply("push");
    input.focus({ preventScroll: true });
  }
  controls.hidden = false;
  input.addEventListener("input", () => apply());
  main
    .querySelector("#rs-insight-search")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      apply("push");
    });
  chips.forEach((button) =>
    button.addEventListener("click", () => {
      topic = button.dataset.topicFilter;
      apply("push");
    }),
  );
  main.querySelector("#rs-clear").addEventListener("click", clear);
  main.querySelector("[data-clear-insights]").addEventListener("click", clear);
  window.addEventListener("popstate", restore);
  restore();
}
