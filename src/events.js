// Event names, dates and headline metrics are supplied content, not a live booking feed.
export const sectors = [
  { slug: "contracts-law", label: "Contracts, Law, Regulations, & Governance" },
  { slug: "education", label: "Education" },
  { slug: "energy-utilities", label: "Energy, Utilities & Construction" },
  { slug: "finance-accounting", label: "Finance & Accounting" },
  { slug: "health", label: "Health" },
  { slug: "marketing-comms", label: "Marketing, Comms & PR" },
  { slug: "technology-cyber-data", label: "Technology, Cyber, Data, & CX" },
];
export const events = [
  {
    slug: "nursing-and-the-law",
    title: "Nursing & The Law",
    sector: "health",
    tag: "Health",
    date: "10–11 Nov 2026",
    start: "2026-11-10",
    location: "Johannesburg",
  },
  {
    slug: "ubuntu-education-conference",
    title: "The Ubuntu Education Conference",
    sector: "education",
    tag: "Education",
    date: "10–11 Nov 2026",
    start: "2026-11-10",
    location: "Cape Town",
  },
  {
    slug: "employment-leave-reform",
    title: "Employment Leave Reform Conference",
    sector: "contracts-law",
    tag: "Contracts & Law",
    date: "23 Nov 2026",
    start: "2026-11-23",
    location: "Johannesburg",
  },
  {
    slug: "charities-nfps-updates",
    title: "Essential Updates for Charities & NFPs",
    sector: "education",
    tag: "Education",
    date: "22–23 Feb 2027",
    start: "2027-02-22",
    location: "Johannesburg & Virtual",
  },
  {
    slug: "strategic-finance-leader",
    title: "The Strategic Finance Leader Series",
    sector: "finance-accounting",
    tag: "Finance",
    date: "23–25 Feb 2027",
    start: "2027-02-23",
    location: "Virtual",
  },
  {
    slug: "nursing-leaders-summit",
    title: "Annual South African Nursing Leaders’ Summit",
    sector: "health",
    tag: "Health",
    date: "24–25 Feb 2027",
    start: "2027-02-24",
    location: "Johannesburg",
  },
  {
    slug: "medico-legal-congress",
    title: "24th Annual South African Medico Legal Congress",
    sector: "health",
    tag: "Health",
    date: "24–25 Feb 2027",
    start: "2027-02-24",
    location: "Cape Town",
  },
  {
    slug: "quality-safety-healthcare",
    title: "Quality & Safety in Healthcare",
    sector: "health",
    tag: "Health",
    date: "24–25 Feb 2027",
    start: "2027-02-24",
    location: "Durban",
  },
];
export const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
export const arrow = '<svg aria-hidden="true"><use href="#arrow" /></svg>';
export function icon(type) {
  const paths = {
    calendar:
      '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    pin: '<path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    conference:
      '<path d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8l2-4h12l2 4M9 14h6"/>',
    management:
      '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M7 15h4M15 15h2"/>',
    award:
      '<circle cx="12" cy="9" r="5"/><path d="m9 13.5-2 8.5 5-2.5 5 2.5-2-8.5"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[type]}</svg>`;
}
export function eventCards() {
  return events
    .map(
      (
        event,
      ) => `<a class="cn-event" href="/events/${event.slug}" data-event-slug="${event.slug}" data-cn-reveal>
    <span class="cn-sector">${escapeHtml(event.tag)}</span><h3>${escapeHtml(event.title)}</h3>
    <div class="cn-event-meta"><span>${icon("calendar")}<time datetime="${event.start}">${event.date}</time></span><span>${icon("pin")}${escapeHtml(event.location)}</span></div>
    <span class="cn-event-link">Read more ${arrow}</span></a>`,
    )
    .join("");
}
export function eventResults() {
  return `<p class="cn-results" role="status" aria-live="polite" aria-atomic="true">8 events</p><div class="cn-events-grid">${eventCards()}<div class="cn-empty" hidden><h3>No events match your search.</h3><p>Try a different title, sector or location, or clear your filters to see all conferences.</p><button type="button" class="btn cn-secondary" data-clear-search>Clear filters ${arrow}</button></div></div>`;
}
export function bindSearch(root, { sector = "" } = {}) {
  const searches = [...root.querySelectorAll("[data-event-search]")];
  const select = root.querySelector("[data-sector-filter]");
  if (select) select.value = sector;
  const cards = [...root.querySelectorAll(".cn-event")];
  const status = root.querySelector(".cn-results");
  const empty = root.querySelector(".cn-empty");
  const normalize = (value) =>
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  function filter(value = searches[0]?.value || "") {
    searches.forEach((input) => {
      if (input.value !== value) input.value = value;
    });
    const words = normalize(value).split(" ").filter(Boolean);
    let count = 0;
    cards.forEach((card) => {
      const event = events.find((item) => item.slug === card.dataset.eventSlug);
      const text = normalize(
        `${event.title} ${event.tag} ${event.location} ${event.date} ${sectors.find((item) => item.slug === event.sector).label}`,
      );
      const match =
        words.every((word) => text.includes(word)) &&
        (!select?.value || event.sector === select.value);
      card.hidden = !match;
      // A newly matched off-screen card must not remain hidden by a reveal animation.
      if (match && (value || select?.value)) card.classList.add("is-revealed");
      if (match) count++;
    });
    status.textContent = `${count} ${count === 1 ? "event" : "events"}${value.trim() ? ` matching “${value.trim()}”` : ""}`;
    empty.hidden = count !== 0;
  }
  searches.forEach((input) =>
    input.addEventListener("input", () => filter(input.value)),
  );
  select?.addEventListener("change", () => filter());
  root.querySelector("[data-clear-search]").addEventListener("click", () => {
    if (select) select.value = "";
    filter("");
    (root.querySelector("#conference-filter") || searches[0]).focus();
  });
  const heroForm = root.querySelector(".cn-hero-search");
  heroForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    root.querySelector("#upcoming-events").scrollIntoView();
    root.querySelector("#conference-filter").focus({ preventScroll: true });
  });
  filter();
}
export function sectorOptions() {
  return sectors
    .map(
      (sector) =>
        `<option value="${sector.slug}">${escapeHtml(sector.label)}</option>`,
    )
    .join("");
}
