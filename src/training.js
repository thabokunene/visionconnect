import { activate, promo, animations } from "./experience.js";
import { escapeHtml, arrow, icon } from "./events.js";
import {
  courseTitles,
  courseCategories,
  trainingPath,
  upcomingSessions,
  formatDateRange,
  shortDate,
  southAfricaToday,
} from "./training-data.js";
import "./training.css";

const clock =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const normalize = (value) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
const courseUrl = (course) => `/training/${course.slug}`;
const enquiry = (course, session) =>
  `/contact?path=training${course ? `&amp;course=${encodeURIComponent(course.slug)}` : ""}${session ? `&amp;session=${encodeURIComponent(session.id)}` : ""}`;

function courseRows(items, today, { detail = false } = {}) {
  return items
    .map((session) => {
      const date = shortDate(session.dateStart);
      const inProgress = session.dateStart < today && session.dateEnd >= today;
      return `<li class="tr-row" data-session-id="${session.id}"><time class="tr-row-date" datetime="${session.dateStart}"><strong>${date.day}</strong><span>${date.month} ${date.year}</span></time><div class="tr-row-info"><h3>${escapeHtml(session.title)}</h3><div class="tr-row-meta"><span>${escapeHtml(session.category)}</span><span>${formatDateRange(session.dateStart, session.dateEnd)}</span>${inProgress ? '<span class="tr-progress">In progress</span>' : ""}</div></div><span class="tr-row-location">${icon("pin")}${escapeHtml(session.location)}</span><a class="btn tr-row-action" href="${detail ? enquiry({ slug: session.slug }, session) : `${courseUrl(session)}?session=${encodeURIComponent(session.id)}`}" aria-label="${detail ? "Enquire about" : "Read more about"} ${escapeHtml(session.title)} — ${formatDateRange(session.dateStart, session.dateEnd)}, ${escapeHtml(session.location)}">${detail ? "Enquire" : "Read more"} ${arrow}</a></li>`;
    })
    .join("");
}
function featuredCards() {
  return courseTitles
    .filter((course) => course.featured !== false)
    .map(
      (course, index) =>
        `<a class="tr-course-card" href="${courseUrl(course)}" data-cn-reveal style="--reveal-delay:${(index % 3) * 100}ms"><div class="tr-course-meta"><span class="cn-sector">${escapeHtml(course.category)}</span><span class="tr-duration">${clock}${course.days} ${course.days === 1 ? "day" : "days"}</span></div><h3>${escapeHtml(course.title)}</h3><span class="cn-event-link">Read more ${arrow}</span></a>`,
    )
    .join("");
}
const reasons = [
  [
    "Interactive learning experience",
    "Our courses offer a highly interactive, hands-on learning experience that fosters deep understanding. Engage in discussions, ask questions, and collaborate with peers to enhance your learning journey.",
  ],
  [
    "Expert facilitators",
    "Our facilitators are not only experts in their fields but also exceptional trainers dedicated to your success — top-notch training that is both informative and engaging.",
  ],
  [
    "Networking opportunities",
    "Interact with peers to exchange ideas, share experiences, and build valuable connections that can benefit you personally and professionally.",
  ],
  [
    "Personalised experience",
    "Unlike one-size-fits-all online courses, our training is personalised to meet the specific needs of participants — so you can apply what you’ve learned effectively in your own context.",
  ],
  [
    "Career advancement",
    "Whether you’re acquiring new skills, enhancing existing ones, or staying ahead in your industry, our courses help you achieve your professional goals.",
  ],
  [
    "Local context",
    "Our facilitators have deep understanding of your local context — relevant examples, case studies, and discussions tailored to your world, drawing from years of South African insight.",
  ],
];
export function renderTraining(main) {
  document.title = "Training Courses | Citizen Human Capital";
  main.classList.add("conference-page", "training-page");
  main.innerHTML = `
 <section class="cn-hero tr-hero" aria-labelledby="training-title"><svg class="cn-zebra" aria-hidden="true"><use href="#mark"/></svg><div class="container"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/what-we-do">What we do</a><span>/</span><span>Training courses</span></div><div class="cn-hero-inner"><p class="eyebrow" data-cn-reveal>WHAT WE DO · TRAINING COURSES</p><h1 id="training-title" data-cn-reveal>Training Courses</h1><p class="cn-hero-sub" data-cn-reveal>Unlock your potential with premium, in-person training courses — led by expert facilitators and tailored for professional growth.</p><a href="#upcoming-courses" class="btn btn-primary" data-cn-reveal>See upcoming courses ${arrow}</a><form class="cn-hero-search" role="search" aria-label="Training course search" data-cn-reveal>${icon("search")}<label class="visually-hidden" for="courseSearch">Search courses, topics or cities</label><input id="courseSearch" type="search" data-training-search placeholder="Search courses, topics or cities…" autocomplete="off" aria-controls="courseList"><button type="submit" aria-label="View course search results">${arrow}</button></form></div><div class="cn-hero-foot"><span>QUALITY OVER QUANTITY. ALWAYS.</span><span>EXPERT-LED. BUILT FOR YOUR WORLD.</span></div></div></section>
 <section class="cn-stats" aria-label="Training experience at a glance"><div class="container">${[
   [26, "", "Years of experience"],
   [40, "+", "Course titles"],
   [250, "+", "Sessions run each year"],
   [10000, "+", "Professionals trained"],
 ]
   .map(
     ([value, suffix, label]) =>
       `<div><span class="cn-stat" aria-hidden="true" data-count="${value}" data-suffix="${suffix}">${value.toLocaleString("en-US")}${suffix}</span><span class="visually-hidden">${value.toLocaleString("en-US")}${suffix}</span><span class="cn-stat-label">${label}</span></div>`,
   )
   .join("")}</div></section>
 <section class="cn-section tr-manifesto" aria-labelledby="manifesto-title"><div class="container tr-manifesto-grid"><div data-cn-reveal><h2 class="eyebrow" id="manifesto-title">THE CITIZEN LEARNING PHILOSOPHY</h2><blockquote>In a world inundated with online and self-directed learning, investing your time and money in a premium, in-person training course can make all the difference.</blockquote><p class="tr-quote-cite">— THE CITIZEN LEARNING PHILOSOPHY</p></div><div class="tr-manifesto-copy" data-cn-reveal><p>By choosing one of our courses, you’re choosing <strong>quality over quantity</strong> — ensuring you get the most out of your learning experience.</p><p>Why settle for mediocrity when you can strive for excellence? Our premium skills training and sector-specific courses are designed to unlock your full potential, in the room, with experts and peers who take professional development as seriously as you do.</p></div></div></section>
 <section class="cn-section" aria-labelledby="featured-title"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">OUR TRAINING COURSES</p><h2 id="featured-title">A range of premium training courses designed to equip you with cutting-edge skills and insights.</h2><p>Led by top experts and tailored for professional growth across industries.</p></div><div class="tr-course-grid">${featuredCards()}</div></div></section>
 <section class="cn-section tr-why" aria-labelledby="why-training-title"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">WHY CHOOSE CITIZEN</p><h2 id="why-training-title">Six reasons professionals come back.</h2><p>Every course is built on the same standard: expert-led, hands-on, and tailored to your context.</p></div><div class="tr-reasons-grid">${reasons.map(([title, body], index) => `<article class="tr-reason" data-cn-reveal style="--reveal-delay:${(index % 3) * 100}ms"><span class="tr-reason-number" aria-hidden="true">0${index + 1}</span><h3>${title}</h3><p>${body}</p></article>`).join("")}</div></div></section>
 <section class="cn-section cn-subtle" id="upcoming-courses" aria-labelledby="upcoming-title"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">UPCOMING</p><h2 id="upcoming-title">Training courses near you.</h2></div><label for="scheduleSearch" class="cn-filter-search tr-schedule-search">${icon("search")}<span class="visually-hidden">Search upcoming training sessions</span><input id="scheduleSearch" type="search" data-training-search placeholder="Search courses, topics or cities…" aria-controls="courseList"></label><div class="tr-filter-bar" role="group" aria-label="Filter training sessions by category">${["All", ...courseCategories].map((category, index) => `<button type="button" class="tr-filter-chip" data-category="${escapeHtml(index === 0 ? "all" : category)}" aria-pressed="${index === 0 ? "true" : "false"}">${escapeHtml(category)} <span data-training-count="${escapeHtml(index === 0 ? "all" : category)}">0</span></button>`).join("")}</div><p class="tr-results" id="courseResultsCount" role="status" aria-live="polite" aria-atomic="true"></p><ol class="tr-course-list" id="courseList" aria-label="Upcoming course sessions"></ol><div class="tr-empty" hidden><h3>No courses match that search.</h3><p>Try a different term, or clear the filters to see all upcoming sessions.</p><button type="button" class="btn cn-secondary" data-training-reset>Clear filters ${arrow}</button></div><nav class="tr-pagination" id="pagination" aria-label="Course pagination"></nav></div></section>
 <section class="cn-section cn-know"><div class="container" data-cn-reveal><p class="eyebrow">KEEP YOUR NEXT CHAPTER MOVING</p><h2>Want to know more?</h2><p>Ask us about any of our training courses by getting in touch below.</p><a href="${enquiry()}" class="btn btn-primary">Contact us ${arrow}</a></div></section>`;
  activate();
  promo();
  bindTrainingSchedule(main);
  animations(main);
}
function bindTrainingSchedule(root) {
  const today = southAfricaToday();
  const available = upcomingSessions(today);
  const state = { category: "all", query: "", page: 1, perPage: 10 };
  const inputs = [...root.querySelectorAll("[data-training-search]")];
  const list = root.querySelector("#courseList");
  const pagination = root.querySelector("#pagination");
  const results = root.querySelector("#courseResultsCount");
  const chips = [...root.querySelectorAll("[data-category]")];
  function render() {
    const words = normalize(state.query).split(" ").filter(Boolean);
    const queryMatches = available.filter((session) => {
      const hay = normalize(
        `${session.title} ${session.category} ${session.location}`,
      );
      return words.every((word) => hay.includes(word));
    });
    root.querySelectorAll("[data-training-count]").forEach((counter) => {
      counter.textContent =
        counter.dataset.trainingCount === "all"
          ? queryMatches.length
          : queryMatches.filter(
              (session) => session.category === counter.dataset.trainingCount,
            ).length;
    });
    const matches = queryMatches.filter(
      (session) =>
        state.category === "all" || session.category === state.category,
    );
    const pages = Math.max(1, Math.ceil(matches.length / state.perPage));
    state.page = Math.max(1, Math.min(state.page, pages));
    const offset = (state.page - 1) * state.perPage;
    const shown = matches.slice(offset, offset + state.perPage);
    list.innerHTML = courseRows(shown, today);
    root.querySelector(".tr-empty").hidden = matches.length !== 0;
    list.hidden = matches.length === 0;
    results.textContent = matches.length
      ? `Showing ${offset + 1}–${offset + shown.length} of ${matches.length} ${matches.length === 1 ? "session" : "sessions"}${state.query.trim() || state.category !== "all" ? ` (${available.length} total)` : ""} · page ${state.page} of ${pages}`
      : "No matching courses.";
    chips.forEach((chip) =>
      chip.setAttribute(
        "aria-pressed",
        String(chip.dataset.category === state.category),
      ),
    );
    if (pages <= 1) {
      pagination.innerHTML = "";
      return;
    }
    pagination.innerHTML = `<button type="button" class="tr-page" data-page="${state.page - 1}" aria-label="Previous page" ${state.page === 1 ? 'disabled aria-disabled="true"' : ""}>${arrow}</button>${Array.from({ length: pages }, (_, index) => `<button type="button" class="tr-page" data-page="${index + 1}" aria-label="Page ${index + 1}" ${index + 1 === state.page ? 'aria-current="page"' : ""}>${index + 1}</button>`).join("")}<button type="button" class="tr-page" data-page="${state.page + 1}" aria-label="Next page" ${state.page === pages ? 'disabled aria-disabled="true"' : ""}>${arrow}</button>`;
  }
  inputs.forEach((input) =>
    input.addEventListener("input", () => {
      state.query = input.value;
      state.page = 1;
      inputs.forEach((other) => {
        if (other !== input) other.value = input.value;
      });
      render();
    }),
  );
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      state.category = chip.dataset.category;
      state.page = 1;
      render();
    }),
  );
  pagination.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page]");
    if (!button || button.disabled) return;
    const page = Number(button.dataset.page);
    if (!Number.isInteger(page) || page === state.page) return;
    state.page = page;
    render();
    pagination
      .querySelector('[aria-current="page"]')
      ?.focus({ preventScroll: true });
    root.querySelector("#upcoming-courses").scrollIntoView();
  });
  root.querySelector("[data-training-reset]").addEventListener("click", () => {
    state.category = "all";
    state.query = "";
    state.page = 1;
    inputs.forEach((input) => (input.value = ""));
    render();
    root.querySelector("#scheduleSearch").focus();
  });
  root.querySelector(".cn-hero-search").addEventListener("submit", (event) => {
    event.preventDefault();
    root.querySelector("#upcoming-courses").scrollIntoView();
    root.querySelector("#scheduleSearch").focus({ preventScroll: true });
  });
  render();
}
export function isTrainingDetail(pathname) {
  return courseTitles.some((course) => pathname === courseUrl(course));
}
export function renderTrainingDetail(main, pathname) {
  const course = courseTitles.find((item) => pathname === courseUrl(item));
  document.title = `${course.title} | Citizen Human Capital`;
  main.classList.add("conference-page", "training-page");
  const today = southAfricaToday();
  const scheduled = upcomingSessions(today).filter(
    (session) => session.slug === course.slug,
  );
  const selected = scheduled.find(
    (session) =>
      session.id === new URLSearchParams(location.search).get("session"),
  );
  main.innerHTML = `<section class="cn-section tr-course-detail"><div class="container"><a class="text-link" href="${trainingPath}#upcoming-courses">← All training courses</a><p class="eyebrow">${escapeHtml(course.category)}</p><h1>${escapeHtml(course.title)}</h1><p class="tr-detail-intro">Ask our training team for the course outline, facilitator information, fees and availability. Online bookings are not available on this website.</p>${selected ? `<div class="tr-selected"><strong>Your selected session</strong><p>${formatDateRange(selected.dateStart, selected.dateEnd)} · ${escapeHtml(selected.location)}</p><a href="${enquiry(course, selected)}" class="btn btn-primary">Enquire about this session ${arrow}</a></div>` : ""}<h2>Scheduled sessions</h2>${scheduled.length ? `<ol class="tr-course-list" aria-label="Scheduled sessions">${courseRows(scheduled, today, { detail: true })}</ol>` : "<p>No upcoming sessions are currently listed for this course. Contact the team about future dates or your training requirements.</p>"}<a href="${enquiry(course)}" class="btn ${selected ? "cn-secondary" : "btn-primary"} tr-general-enquiry">Enquire about this course ${arrow}</a></div></section>`;
  activate();
}
