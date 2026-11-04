import { renderSitePage } from "./site-pages-content.js";
import { serviceCards } from "./resources-data.js";
import {
  insightArticles,
  insightTopics,
  findInsight,
  readingMinutes,
} from "./insights-data.js";
export const escapeResource = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
const esc = escapeResource;
const arrow = '<svg aria-hidden="true"><use href="#arrow"/></svg>';
const mark =
  '<svg class="rs-zebra" aria-hidden="true"><use href="#mark"/></svg>';
const heading = (id, eyebrow, title, body) =>
  `<div class="rs-heading"><p class="eyebrow">${eyebrow}</p><h2 id="${id}" tabindex="-1">${title}</h2>${body ? `<p>${body}</p>` : ""}</div>`;
const actions = (primary, url, secondary, second) =>
  `<div class="rs-actions"><a class="btn btn-primary" href="${url}">${primary} ${arrow}</a>${secondary ? `<a class="btn rs-outline" href="${second}">${secondary} ${arrow}</a>` : ""}</div>`;
function hero(eyebrow, title, body, actionHtml, compact = false) {
  return `<section class="rs-hero${compact ? " rs-hero-compact" : ""}" aria-labelledby="rs-title">${mark}<div class="container"><p class="eyebrow">${eyebrow}</p><h1 id="rs-title">${title}</h1><p class="rs-hero-lead">${body}</p>${actionHtml || ""}</div></section>`;
}
function cta(title = "Start with the work you need done.") {
  return `<section class="rs-cta"><div class="container"><div><p class="eyebrow">LET’S SCOPE IT</p><h2>${title}</h2><p>Tell us the role, the site or the capability gap. Ask about fit, availability and a written scope before committing.</p></div>${actions("Contact the team", "/contact?path=employer", "For employers", "/employers")}<p class="rs-cta-note">Contact prepares an email draft. The employer online enquiry is currently test-only. Prefer a call? <a href="tel:+27114519898">+27 11 451 9898</a>.</p></div></section>`;
}
function renderServices() {
  return `${hero("OUR SERVICES", "Four services.<br><span>One clearer way forward.</span>", "Recruit the people. Support the workforce. Recognise experience. Develop capability. Start with the work you need done—we’ll help define the right scope.", actions("Find your service", "#service-finder", "Compare for your business", "/employers#services"))}
  <section class="rs-service-strip" aria-label="Four areas of support"><div class="container">${serviceCards.map((s) => `<a href="#service-${s.slug}"><span>${s.number}</span>${s.tag}${arrow}</a>`).join("")}</div></section>
  <section class="rs-section" id="service-finder" aria-labelledby="rs-finder-title"><div class="container rs-finder-layout">${heading("rs-finder-title", "START WITH THE NEED", "What needs to change?", "You don’t need to know our service names. Pick the situation closest to yours, or browse all four below.")}<div class="rs-finder"><fieldset disabled><legend>What are you looking for?</legend>${[
    ["driver-recruitment", "Drivers for my operation"],
    ["external-hr-management", "HR capacity or specialist support"],
    ["rpl", "A qualification pathway for experience"],
    ["cpd", "Learning that builds capability"],
    ["scope", "Help deciding where to start"],
  ]
    .map(
      ([value, label]) =>
        `<label><input type="radio" name="service-need" value="${value}"><span>${label}</span>${arrow}</label>`,
    )
    .join(
      "",
    )}</fieldset><div class="rs-recommendation" id="rs-recommendation" role="region" aria-label="Suggested starting point" hidden></div><p class="visually-hidden" id="rs-finder-status" role="status" aria-live="polite"></p><noscript><p class="rs-note">Interactive suggestions need JavaScript. Browse the four service descriptions below, or <a href="/contact?path=employer">contact the team for help deciding</a>.</p></noscript></div></div></section>
  <section class="rs-section rs-subtle" aria-labelledby="rs-services-title"><div class="container">${heading("rs-services-title", "THE WORK WE DO", "Choose the right starting point.", "Use one service or discuss a combined brief. Each engagement needs its own scope, responsibilities and agreed terms.")}<div class="rs-service-grid">${serviceCards.map((s) => `<article class="rs-service-card" id="service-${s.slug}"><div class="rs-card-top"><span>${s.number}</span><small>${s.tag}</small></div><h3><a href="/services/${s.slug}">${s.title}</a></h3><p class="rs-card-strap">${s.strap}</p><p>${s.description}</p><div class="rs-card-fit"><strong>A good starting point for</strong><p>${s.for}</p></div><h4>What to scope</h4><ul>${s.outputs.map((v) => `<li>${v}</li>`).join("")}</ul><a class="rs-card-link" href="/services/${s.slug}">${s.link} ${arrow}</a></article>`).join("")}</div></div></section>
  <section class="rs-section" aria-labelledby="rs-boundaries-title"><div class="container">${heading("rs-boundaries-title", "CLEAR FROM THE START", "The scope matters as much as the service.", "Before work begins, agree the outcome, the evidence and the boundaries—not just the name on the proposal.")}<div class="rs-principles">${[
    [
      "01",
      "Define the outcome",
      "The role to fill, the process to improve, the qualification to assess or the capability to develop.",
    ],
    [
      "02",
      "Agree responsibilities",
      "Who decides, who delivers, what access is needed and which work is explicitly excluded.",
    ],
    [
      "03",
      "Review the evidence",
      "Agree how progress and outcomes will be checked. No placement, award, claim or compliance result is automatic.",
    ],
  ]
    .map(
      ([n, title, body]) =>
        `<article><span>${n}</span><h3>${title}</h3><p>${body}</p></article>`,
    )
    .join(
      "",
    )}</div><a class="rs-text-link" href="/insights/comparing-workforce-service-proposals">Read: compare the scope before comparing the fee ${arrow}</a></div></section>
  <section class="rs-section rs-subtle" aria-labelledby="rs-service-questions"><div class="container rs-narrow">${heading("rs-service-questions", "A FEW PRACTICAL ANSWERS", "Before you choose.", "")}<div class="rs-faq">${[
    [
      "Can we use just one service?",
      "Yes—ask to scope the work you need now. Additional services can be discussed separately. Confirm any minimum commitments, notice periods and exit terms in the actual proposal.",
    ],
    [
      "Is this only for employers?",
      "Employers can brief a workforce need. Drivers can explore recruitment and request application assistance; individuals can also discuss RPL and professional development. The driver online application is currently test-only, so use reception for real assistance.",
    ],
    [
      "Are training and CPD the same thing?",
      "Training describes a learning activity. Professional recognition or CPD points depend on the specific programme and the relevant body’s requirements. Confirm the recognition you need before booking; not every course or attendance certificate carries the same status.",
    ],
    [
      "What information should I send first?",
      "Start with your contact details, the service or problem, location and timing. Do not send ID numbers, employee files, medical records or case evidence in an initial enquiry. Agree a secure process if supporting records are needed.",
    ],
  ]
    .map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`)
    .join("")}</div></div></section>${cta()}`;
}
function renderCpd() {
  return `${hero("SERVICES · PROFESSIONAL DEVELOPMENT", "Build capability.<br><span>Keep the evidence.</span>", "Development starts with a clear outcome—not a course title. Scope learning around your people, their work and the evidence you need to review progress.", actions("Discuss a programme", "/contact?path=cpd", "Browse training courses", "/what-we-do/training-courses"))}
  <div class="rs-breadcrumb container"><a href="/services">Services</a><span aria-hidden="true">/</span><span>Professional development &amp; CPD</span></div>
  <section class="rs-section" aria-labelledby="rs-cpd-fit"><div class="container">${heading("rs-cpd-fit", "THREE WAYS TO START", "Fit the learning to the work.", "The right format depends on the capability gap, the cohort and the starting point. Confirm programme availability and scope before booking.")}<div class="rs-principles">${[
    [
      "01",
      "Open courses",
      "Explore scheduled courses for individual delegates or a small team. Ask about the content, format, dates, fees and any entry requirements for the specific session.",
    ],
    [
      "02",
      "In-house learning",
      "Discuss a programme for your team, using relevant examples, an agreed delivery format and time for practice. Venue, travel, materials and assessment belong in the quote.",
    ],
    [
      "03",
      "Development pathways",
      "Scope a sequence of learning activities around defined roles and outcomes. Agree the manager support, review points and records needed to follow progress over time.",
    ],
  ]
    .map(
      ([n, title, body]) =>
        `<article><span>${n}</span><h3>${title}</h3><p>${body}</p></article>`,
    )
    .join("")}</div></div></section>
  <section class="rs-section rs-subtle" aria-labelledby="rs-cpd-process"><div class="container">${heading("rs-cpd-process", "FROM NEED TO EVIDENCE", "A learning plan with a purpose.", "Agree what should change, how the programme supports that change and what evidence will be available afterwards.")}<ol class="rs-process">${[
    [
      "Understand the gap",
      "Define the roles, starting knowledge, work context and intended capability. Check whether training is the right response.",
    ],
    [
      "Scope the programme",
      "Confirm learning outcomes, content, delivery, practice, assessment, costs and any recognition requirements.",
    ],
    [
      "Deliver and assess",
      "Use the agreed learning and assessment approach. Keep attendance and relevant learning records as scoped.",
    ],
    [
      "Support application",
      "Agree how participants and managers will put learning to work and review the outcome at a suitable point.",
    ],
  ]
    .map(
      ([title, body], i) =>
        `<li><span>${i + 1}</span><h3>${title}</h3><p>${body}</p></li>`,
    )
    .join("")}</ol></div></section>
  <section class="rs-section" aria-labelledby="rs-cpd-recognition"><div class="container rs-two-col">${heading("rs-cpd-recognition", "RECOGNITION IS PROGRAMME-SPECIFIC", "A certificate is not a blanket accreditation claim.", "Confirm the recognition that matters to you before booking a programme.")}<div class="rs-copy"><p>Ask which professional body, qualification or reporting framework is relevant, whether the specific programme meets its requirements and what evidence you will receive.</p><p>Attendance, assessment and recognised CPD points are different things. No universal professional-body accreditation, automatic B-BBEE outcome or WSP/ATR claim acceptance is asserted here.</p><aside class="rs-callout"><strong>Ask before you book</strong><ul><li>Who is the programme for, and what are the entry requirements?</li><li>What will participants be able to do afterwards?</li><li>How is learning assessed, and which records are included?</li><li>Is the specific recognition you need confirmed in writing?</li></ul></aside><a href="/insights/training-outcomes-beyond-attendance" class="rs-text-link">Read the learning-outcomes guide ${arrow}</a></div></div></section>
  <section class="rs-section rs-subtle" aria-labelledby="rs-cpd-brief"><div class="container rs-two-col">${heading("rs-cpd-brief", "A BETTER PROGRAMME BRIEF", "Bring us the gap, not just a headcount.", "A short brief is enough to start a scoping conversation. Do not include personal or confidential learner records.")}<div class="rs-copy"><ul class="rs-checklist"><li>The roles and capability gap to address</li><li>Approximate cohort size, location and preferred format</li><li>Starting knowledge, language and scheduling requirements</li><li>The outcomes, records or programme recognition you need</li><li>Your timing, budget context and internal support</li></ul><p>Open-course fees and in-house costs are quoted for the actual scope. Confirm VAT, materials, assessment, travel, cancellation terms and any further learning costs. A website enquiry does not reserve a session.</p>${actions("Enquire about development", "/contact?path=cpd", "View scheduled courses", "/what-we-do/training-courses")}</div></div></section>${cta("What should your team be able to do next?")}`;
}
function guideCard(article) {
  return `<article class="rs-guide-card" data-guide="${article.slug}" data-topic="${esc(article.topic)}"><a class="rs-guide-link" href="/insights/${article.slug}"><div class="rs-guide-art rs-art-${article.number}" aria-hidden="true"><span>${article.number}</span><svg><use href="#mark"/></svg><i></i><i></i><i></i></div><div class="rs-guide-body"><p class="rs-guide-meta"><span>${article.topic}</span><span>${readingMinutes(article)} min read</span></p><h3>${article.title}</h3><p>${article.summary}</p><span class="rs-guide-read">Read the guide ${arrow}</span></div></a></article>`;
}
function renderInsights() {
  const featured = insightArticles[0];
  return `${hero("CITIZEN INSIGHTS", "Practical thinking.<br><span>For the work ahead.</span>", "Useful questions, clearer briefs and better decisions. Explore recruitment, HR, qualifications and learning—without the jargon or the sales pitch.", actions("Explore the guides", "#insight-library", "Explore our services", "/services"), true)}
  <section class="rs-section" aria-labelledby="rs-feature-title"><div class="container"><div class="rs-editorial-note"><strong>Original practical guides · editorial drafts.</strong> Prepared for review, not previously published news or adopted company policy. No named author, publication date or expert endorsement is implied. General guidance—not legal advice.</div><a class="rs-feature" href="/insights/${featured.slug}"><div class="rs-feature-copy"><p class="eyebrow">THE STARTING POINT · ${featured.topic.toUpperCase()}</p><h2 id="rs-feature-title">${featured.title}</h2><p>${featured.summary}</p><span class="rs-guide-read">${readingMinutes(featured)} min read · Read the guide ${arrow}</span></div><div class="rs-feature-art" aria-hidden="true"><span class="rs-feature-word">THE<br>BRIEF.</span><div><span>01 &nbsp; THE ROLE</span><span>02 &nbsp; THE ROUTE</span><span>03 &nbsp; THE EVIDENCE</span></div></div></a></div></section>
  <section class="rs-section rs-subtle" id="insight-library" aria-labelledby="rs-library-title"><div class="container">${heading("rs-library-title", "THE READING ROOM", "Find something useful.", "Six original guides to help frame a problem, prepare a brief or ask a better question.")}<div class="rs-library-controls" hidden><form role="search" id="rs-insight-search"><label for="rs-search">Search the guides</label><div><input id="rs-search" name="q" type="search" maxlength="150" placeholder="Try evidence, driver or learning…" autocomplete="off"><button class="btn btn-primary" type="submit">Search ${arrow}</button></div></form><fieldset class="rs-topics"><legend>Filter by topic</legend><div>${["All topics", ...insightTopics].map((topic, i) => `<button type="button" data-topic-filter="${i ? esc(topic) : "all"}" aria-pressed="${!i}">${topic}<span>${i ? "1" : insightArticles.length}</span></button>`).join("")}</div></fieldset><div class="rs-library-status"><p id="rs-results" role="status" aria-live="polite">${insightArticles.length} guides</p><button type="button" id="rs-clear" class="rs-text-button">Clear search &amp; filters</button></div></div><noscript><p class="rs-note">All six guides are listed below. Search and topic filters need JavaScript; reading the guides does not.</p></noscript><div class="rs-guide-grid">${insightArticles.map(guideCard).join("")}</div><div class="rs-empty" id="rs-empty" hidden><h3>No matching guides.</h3><p>Try another phrase or clear the filters to see all six guides.</p><button type="button" class="btn btn-primary" data-clear-insights>Show all guides ${arrow}</button></div></div></section>${cta("A question about your own situation?")}`;
}
function renderInsight(article) {
  const related = insightArticles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);
  return `${hero(`INSIGHTS · ${article.topic.toUpperCase()}`, esc(article.title), esc(article.summary), `<div class="rs-article-meta"><span>Practical guide · editorial draft</span><span>${readingMinutes(article)} min read</span><button type="button" class="rs-print" hidden>Print / Save as PDF ${arrow}</button></div>`, true)}
  <div class="rs-breadcrumb container"><a href="/insights">Insights</a><span aria-hidden="true">/</span><span>${article.topic}</span></div>
  <section class="rs-section rs-article-section"><div class="container rs-article-layout"><nav class="rs-contents" aria-label="In this guide"><p class="eyebrow">IN THIS GUIDE</p><ol>${article.sections.map(([id, title], i) => `<li><a href="#${id}"><span>${String(i + 1).padStart(2, "0")}</span>${title}</a></li>`).join("")}<li><a href="#take-it-further"><span>✓</span>Your starting checklist</a></li></ol><a class="rs-text-link" href="/insights">← All insights</a></nav><article class="rs-article" aria-label="Full practical guide"><aside class="rs-editorial-note"><strong>Editorial draft for review.</strong> This is original general guidance, not a statement of current law, an adopted Citizen policy or advice for a specific case. Business/editorial review is required before publication.</aside><p class="rs-takeaway">${article.takeaway}</p>${article.sections.map(([id, title, body, bullets = []], i) => `<section aria-labelledby="${id}"><h2 id="${id}" tabindex="-1"><span>${String(i + 1).padStart(2, "0")}</span>${title}</h2><p>${body}</p>${bullets.length ? `<ul>${bullets.map((v) => `<li>${v}</li>`).join("")}</ul>` : ""}</section>`).join("")}<section class="rs-article-checklist" aria-labelledby="take-it-further"><p class="eyebrow">TAKE IT INTO THE CONVERSATION</p><h2 id="take-it-further" tabindex="-1">Your starting checklist.</h2><ul>${article.checklist.map((v) => `<li>${v}</li>`).join("")}</ul><a href="${article.service}" class="rs-text-link">${article.serviceLabel} ${arrow}</a></section><p class="rs-note">To discuss your situation, <a href="/contact?path=employer">contact reception</a>. Do not send confidential or personal records in an initial enquiry.</p><noscript><p class="rs-note">Use your browser’s Print command to print or save this guide as a PDF.</p></noscript></article></div></section>
  <section class="rs-section rs-subtle" aria-labelledby="rs-related-title"><div class="container">${heading("rs-related-title", "KEEP READING", "A little more context.", "Related practical guides from the reading room.")}<div class="rs-guide-grid">${related.map(guideCard).join("")}</div></div></section>`;
}
export function renderResourceContent(path) {
  if (path === "/services") return renderServices();
  if (path === "/services/cpd") return renderCpd();
  if (path === "/insights") return renderInsights();
  const article = findInsight(path);
  return article ? renderInsight(article) : renderSitePage(path);
}
