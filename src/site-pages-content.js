import { sitePageMeta, legalDrafts } from "./site-pages-data.js";
import { serviceCards } from "./resources-data.js";
const arrow = '<svg aria-hidden="true"><use href="#arrow"/></svg>';
const link = (label, url, secondary = false) =>
  `<a class="btn ${secondary ? "rs-outline" : "btn-primary"}" href="${url}">${label} ${arrow}</a>`;
const actions = (...items) => `<div class="rs-actions">${items.join("")}</div>`;
function hero(label, title, body, buttons = "") {
  return `<section class="rs-hero" aria-labelledby="rs-title"><svg class="rs-zebra" aria-hidden="true"><use href="#mark"/></svg><div class="container"><p class="eyebrow">${label}</p><h1 id="rs-title">${title}</h1><p class="rs-hero-lead">${body}</p>${buttons}</div></section>`;
}
function heading(id, label, title, body = "") {
  return `<div class="rs-heading"><p class="eyebrow">${label}</p><h2 id="${id}" tabindex="-1">${title}</h2>${body ? `<p>${body}</p>` : ""}</div>`;
}
function section(id, label, title, body, content, subtle = false) {
  return `<section class="rs-section${subtle ? " rs-subtle" : ""}" aria-labelledby="${id}"><div class="container">${heading(id, label, title, body)}${content}</div></section>`;
}
function cards(items) {
  return `<div class="rs-service-grid">${items.map(([title, body, url, cta = "Explore"], i) => `<article class="rs-service-card"><div class="rs-card-top"><span>0${i + 1}</span></div><h3>${title}</h3><p>${body}</p><a class="rs-card-link" href="${url}">${cta} ${arrow}</a></article>`).join("")}</div>`;
}
function checklist(items) {
  return `<ul class="sp-checklist">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}
function process(items) {
  return `<ol class="rs-process" style="--sp-steps:${items.length}">${items.map(([title, body], i) => `<li><span>0${i + 1}</span><h3>${title}</h3><p>${body}</p></li>`).join("")}</ol>`;
}
function contact(title, body, path = "employer") {
  return `<section class="rs-cta"><div class="container"><div><p class="eyebrow">A PRACTICAL NEXT STEP</p><h2>${title}</h2><p>${body}</p></div>${actions(link("Prepare an enquiry", `/contact?path=${path}`), link("Call +27 11 451 9898", "tel:+27114519898", true))}<p class="rs-cta-note">Contact prepares an email draft for you to review and send. It does not submit a booking, quote or application.</p></div></section>`;
}
const opportunities = [
  [
    "Conferences & events",
    "Find a sector conversation that matters to your work. Review the listed dates, then ask for the programme, venue and availability before booking.",
    "/what-we-do/conferences",
    "Explore conferences",
  ],
  [
    "Training courses",
    "Browse scheduled learning by topic, location and date. Ask for the outline, facilitator details, fees and the evidence you will receive.",
    "/what-we-do/training-courses",
    "Browse courses",
  ],
  [
    "Audience marketing",
    "Discuss sponsorship or an event format around a clear audience and objective. Ask for a written scope, agreed deliverables and permissions.",
    "/what-we-do/audience-marketing",
    "Explore audience marketing",
  ],
  [
    "A scoped learning proposal",
    "Brief the audience, capability gap, practical outcomes and constraints. Start a proposal conversation rather than guessing at a course title.",
    "/training-proposal",
    "Prepare your brief",
  ],
];
function home() {
  return (
    hero(
      "CITIZEN HUMAN CAPITAL",
      "People. Capability.<br><span>Progress.</span>",
      "Recruit the people. Support the workforce. Recognise experience. Build the capability to do the work ahead.",
      actions(
        link("Explore our services", "/services"),
        link("Talk to the team", "/contact", true),
      ),
    ) +
    section(
      "home-paths",
      "START WHERE YOU ARE",
      "One partner. Different starting points.",
      "Find the route that matches your need—not just a list of services.",
      cards([
        [
          "For employers",
          "Build a recruitment, workforce or learning brief. Compare the four service areas, scope the evidence and agree the responsibilities.",
          "/employers",
          "Explore employer support",
        ],
        [
          "For drivers",
          "Understand the recruitment journey, prepare the right information and get application assistance. Online intake is currently test-only.",
          "/drivers",
          "Your next step as a driver",
        ],
        [
          "For learning & events",
          "Explore conferences, training and audience opportunities. Availability, programmes and booking terms must be confirmed.",
          "/what-we-do",
          "Explore what we do",
        ],
        [
          "For a clearer decision",
          "Read six original practical guides on recruitment, HR, qualifications, learning, privacy and buying a service. Editorial drafts for review.",
          "/insights",
          "Visit Insights",
        ],
      ]),
    ) +
    section(
      "home-services",
      "HUMAN CAPITAL, HANDLED",
      "Four areas of support.",
      "Start with the work you need done. Every engagement needs its own agreed scope.",
      cards(
        serviceCards.map((s) => [
          s.title,
          s.description,
          `/services/${s.slug}`,
          s.link,
        ]),
      ),
      true,
    ) +
    section(
      "home-approach",
      "CLEAR BEFORE COMMITMENT",
      "Useful work starts with a clearer brief.",
      "No invented performance figures, automatic bookings or blanket qualification promises.",
      process([
        [
          "Understand the need",
          "Explain the role, site, people or capability gap.",
        ],
        [
          "Agree the scope",
          "Confirm deliverables, evidence, availability, fees and responsibilities.",
        ],
        [
          "Confirm the next step",
          "Use the actual written agreement and approved information-sharing route.",
        ],
      ]),
    ) +
    section(
      "home-about",
      "MEET CITIZEN",
      "Built around the people doing the work.",
      "Get to know our purpose, our approach and what still needs business verification before launch.",
      actions(
        link("Read our story", "/about"),
        link("Our purpose", "/about#purpose", true),
      ),
      true,
    ) +
    contact(
      "What needs to move forward?",
      "You do not have to know the service name. Tell us the situation and ask for help defining a useful next step.",
    )
  );
}
function overview() {
  return (
    hero(
      "WHAT WE DO",
      "Connect. Learn.<br><span>Move forward.</span>",
      "Conferences, training and audience opportunities alongside practical workforce support. Start with the outcome you want—not a format chosen in advance.",
      actions(
        link("Explore the options", "#work-options"),
        link("All events", "/events", true),
      ),
    ) +
    section(
      "work-options",
      "CHOOSE YOUR ROUTE",
      "The right format for the work.",
      "Confirm the current programme, availability and commercial terms with the team.",
      cards(opportunities),
    ) +
    section(
      "workforce-support",
      "BEYOND THE EVENT",
      "Need people or workforce support?",
      "Our four human-capital services sit alongside the learning and events offer.",
      cards(
        serviceCards.map((s) => [
          s.title,
          s.description,
          `/services/${s.slug}`,
          s.link,
        ]),
      ),
      true,
    ) +
    section(
      "work-brief",
      "MAKE THE CONVERSATION USEFUL",
      "Bring a short brief.",
      "A few grounded details help distinguish a public course, an in-house programme, a conference or a workforce engagement.",
      checklist([
        "The problem or opportunity you want to address.",
        "Who needs to attend, learn or be supported.",
        "Location, timing, shift or accessibility constraints.",
        "What evidence of progress you need and who will review it.",
        "Budget parameters and who can approve the final scope.",
      ]),
    ) +
    contact(
      "Not sure which route fits?",
      "Tell us your audience, objective and constraints. Ask about fit before arranging attendance or instructing work.",
      "events",
    )
  );
}
function drivers() {
  return (
    hero(
      "FOR DRIVERS",
      "Your experience matters.<br><span>Make your next step clearer.</span>",
      "Understand what recruitment involves, prepare your information and ask for assistance. An application is an expression of interest—not a job offer or a promise of placement.",
      actions(
        link("Explore application · test preview", "/apply"),
        link("Ask for assistance", "#driver-help", true),
      ),
    ) +
    section(
      "driver-preview",
      "BEFORE YOU START",
      "The online application is currently test-only.",
      "Use fictional answers and sample files. Do not upload a real ID, licence, medical record or other personal document until live processing has been approved.",
      `<aside class="rs-editorial-note"><strong>No live vacancy or placement is promised.</strong> The site does not publish a verified live-vacancy feed. A test receipt confirms storage of test information, not recruitment review, acceptance or a booked interview.</aside>${actions(link("Application test preview", "/apply"), link("How employer recruitment works", "/services/driver-recruitment", true))}`,
    ) +
    section(
      "driver-prepare",
      "PREPARE, DON’T OVERSHARE",
      "Information to have ready for a live process.",
      "This is preparation guidance, not a request to send records now.",
      checklist([
        "Contact details and the region in which you can work.",
        "Licence category, issue/expiry dates and PrDP status where relevant to the role.",
        "Vehicles and route types you have actually driven, with an honest experience history.",
        "Employment/notice status, availability and work preferences.",
        "References and role-specific evidence only when requested through an agreed safe process.",
      ]),
      true,
    ) +
    section(
      "driver-journey",
      "WHAT HAPPENS NEXT",
      "A recruitment journey, not an automatic match.",
      "The role requirements, checks and timing depend on the actual vacancy and employer.",
      process([
        [
          "Share an accurate profile",
          "In a live process, explain your experience and what work you are available for.",
        ],
        [
          "Clarify the role",
          "Confirm vehicle, route, site, shift, location and any eligibility requirements.",
        ],
        [
          "Check relevant evidence",
          "Agree lawful licence, reference and role-specific checks. Outstanding checks are not passed checks.",
        ],
        [
          "Confirm any offer in writing",
          "Review the actual employer, engagement type, conditions and start arrangements.",
        ],
      ]),
    ) +
    section(
      "driver-questions",
      "COMMON QUESTIONS",
      "Before you apply.",
      "",
      `<div class="rs-faq">${[
        [
          "Is there a job available for me?",
          "No live vacancy or guaranteed match is represented here. Ask the team about the actual opportunities and requirements. The online application is a test preview.",
        ],
        [
          "What if my licence or PrDP needs attention?",
          "State the actual status. Requirements must be checked against a real role before placement; do not claim a document is current when it is not. Ask what must be resolved.",
        ],
        [
          "Should I email my ID or medical documents?",
          "No. Start with a general assistance request and ask for the approved secure route if documents are genuinely needed later.",
        ],
        [
          "Can I get help without completing the online form?",
          "Yes—use the confirmed phone or email contact below to ask for assistance. A WhatsApp channel and opening hours have not been confirmed.",
        ],
      ]
        .map(
          ([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`,
        )
        .join("")}</div>`,
      true,
    ) +
    section(
      "driver-help",
      "PHONE OR EMAIL",
      "Need application assistance?",
      "Call +27 11 451 9898 or email reception@citizenhc.co.za. Explain that you need driver application help, without attaching sensitive documents.",
      actions(
        link("Call the team", "tel:+27114519898"),
        link(
          "Email for assistance",
          "mailto:reception@citizenhc.co.za?subject=Driver%20application%20assistance",
          true,
        ),
      ),
    )
  );
}
function hotels() {
  return (
    hero(
      "EVENT TRAVEL & ACCOMMODATION",
      "Plan the stay.<br><span>Confirm the details first.</span>",
      "Practical accommodation guidance for event delegates. No negotiated hotel rates, partner offers, room inventory or booking service are currently verified on this website.",
      actions(
        link("Ask about event logistics", "/contact?path=events"),
        link("Browse events", "/events", true),
      ),
    ) +
    section(
      "stay-status",
      "OFFER STATUS",
      "No confirmed hotel offers are listed.",
      "This page is a planning guide, not an accommodation catalogue or an invitation to pay.",
      cards([
        [
          "Confirm the event first",
          "Ask for the actual venue, dates, start/end times and booking status before committing to travel. A city in an event listing is not a confirmed hotel address.",
          "/events",
          "Find your event",
        ],
        [
          "Ask the right questions",
          "Check distance to the venue, safe transport, accessibility, check-in/out, meals, taxes and cancellation terms directly with the accommodation provider.",
          "/contact?path=events",
          "Ask the events team",
        ],
      ]),
    ) +
    section(
      "stay-checklist",
      "BEFORE YOU BOOK",
      "A useful delegate travel checklist.",
      "Keep the event booking and any separate accommodation booking clearly distinguished.",
      checklist([
        "Written confirmation of event date and venue.",
        "Travel time, traffic and transport for the actual programme hours.",
        "Accessibility, room configuration and any dietary requirements.",
        "The total price, deposit, taxes and what is included.",
        "Cancellation, rescheduling and no-show terms—including if the event changes.",
        "A verified provider and payment route; independently confirm changed banking instructions.",
      ]),
      true,
    ) +
    section(
      "stay-boundaries",
      "CLEAR RESPONSIBILITY",
      "A room enquiry is not a reservation.",
      "Citizen does not display live room availability or take accommodation payments here.",
      `<p>Unless a specific written agreement states otherwise, a hotel booking is between you and the accommodation provider. Ask who handles confirmations, refunds, invoices and changes. Do not assume a venue recommendation includes a negotiated rate, insurance or transport.</p><p>See the <a class="rs-text-link" href="/terms#terms-events">draft event engagement principles</a> and confirm the approved terms for the actual event before booking.</p>`,
    ) +
    contact(
      "Need the venue details?",
      "Name the event and the dates you are considering. Ask the team to confirm the current venue and any genuinely available delegate arrangements.",
      "events",
    )
  );
}
function proposal() {
  return (
    hero(
      "LEARNING & DEVELOPMENT",
      "A better learning brief.<br><span>A more useful proposal.</span>",
      "Define who needs to do what differently, then agree the format and evidence. This guide helps prepare an enquiry; it does not generate a quote or reserve a facilitator.",
      actions(
        link("Discuss a training proposal", "/contact?path=training"),
        link("Browse scheduled courses", "/what-we-do/training-courses", true),
      ),
    ) +
    section(
      "proposal-brief",
      "SIX USEFUL INPUTS",
      "Bring the context, not an employee file.",
      "Avoid personal learner records at this initial stage.",
      checklist([
        "The work problem and the practical capability you want to develop.",
        "Audience size, roles, starting knowledge and language/accessibility needs.",
        "Public-course, in-house or blended preferences—without assuming every format is available.",
        "Location, timing, shift cover, equipment and delivery constraints.",
        "How learning will be assessed and supported back at work.",
        "Budget parameters, approver, procurement requirements and any recognition you need verified.",
      ]),
    ) +
    section(
      "proposal-process",
      "FROM BRIEF TO DECISION",
      "Scope before you commit.",
      "Agree the commercial and learning detail in writing.",
      process([
        [
          "Clarify the outcome",
          "Separate the need to attend a course from the capability the team needs.",
        ],
        [
          "Review the proposed approach",
          "Ask for the outline, facilitator, prerequisites, delivery and learner support.",
        ],
        [
          "Agree evidence and terms",
          "Confirm assessment, certificates, specific recognition, fees and cancellation terms.",
        ],
        [
          "Confirm the actual booking",
          "An enquiry or draft proposal is not a booking or a guarantee of available dates.",
        ],
      ]),
      true,
    ) +
    section(
      "proposal-routes",
      "CHOOSE A STARTING POINT",
      "A course, a programme or an experience pathway?",
      "",
      cards([
        [
          "Scheduled courses",
          "Find the currently listed sessions and enquire about the actual outline, fees and availability.",
          "/what-we-do/training-courses",
          "Browse courses",
        ],
        [
          "Professional development",
          "Discuss open, in-house and scoped development pathways, with recognition confirmed per programme.",
          "/services/cpd",
          "Explore development",
        ],
        [
          "Recognition of Prior Learning",
          "Explore an evidence-based pathway for existing experience. Eligibility, assessment and award decisions are not automatic.",
          "/services/rpl",
          "Explore RPL",
        ],
        [
          "Learning outcomes",
          "Read a practical editorial draft on taking training beyond attendance and supporting application back at work.",
          "/insights/training-outcomes-beyond-attendance",
          "Read the guide",
        ],
      ]),
    ) +
    contact(
      "Start with the capability gap.",
      "Use the brief above to prepare a training enquiry. Ask for a scoped proposal rather than treating a course title as the whole solution.",
      "training",
    )
  );
}
function legal(path) {
  const d = legalDrafts[path];
  return (
    hero(
      "LEGAL · DRAFT FOR REVIEW",
      d.title,
      d.lead,
      `<button class="btn rs-outline rs-print" type="button" hidden>Print / Save as PDF ${arrow}</button><noscript><p>Use your browser’s Print command to print or save this draft.</p></noscript>`,
    ) +
    `<section class="rs-section rs-article-section"><div class="container rs-article-layout"><nav class="rs-contents" aria-label="In this document"><p class="eyebrow">IN THIS DRAFT</p><ol>${d.sections.map(([id, title], i) => `<li><a href="#${id}"><span>${String(i + 1).padStart(2, "0")}</span>${title}</a></li>`).join("")}</ol><a class="rs-text-link" href="/contact">Contact Citizen</a></nav><article class="rs-article" aria-label="Full draft document"><aside class="rs-editorial-note"><strong>Draft for approval.</strong> ${d.status}</aside>${d.sections.map(([id, title, body], i) => `<section aria-labelledby="${id}"><h2 id="${id}" tabindex="-1"><span>${String(i + 1).padStart(2, "0")}</span>${title}</h2>${body}</section>`).join("")}<aside class="sp-legal-contact"><h2 id="legal-assistance" tabindex="-1">Ask for the approved document.</h2><p>Contact <a href="mailto:reception@citizenhc.co.za">reception@citizenhc.co.za</a> or <a href="tel:+27114519898">+27 11 451 9898</a>. Do not send sensitive records with an initial request.</p></aside></article></div></section>` +
    section(
      "legal-related",
      "READ TOGETHER",
      "Related draft documents.",
      "Each draft has its own approval gate. A link is not evidence of adoption.",
      cards(
        [
          [
            "/privacy-policy",
            "Privacy Policy",
            "Website information flows, storage and rights.",
          ],
          [
            "/popia-notice",
            "POPIA Notice",
            "Detailed service-level personal-information guidance.",
          ],
          [
            "/paia-manual",
            "PAIA Manual & Access Guide",
            "Prepare a focused access-to-records request.",
          ],
          [
            "/terms",
            "Terms of Engagement",
            "Scope, commercial questions and service boundaries.",
          ],
          [
            "/code-of-conduct",
            "Code of Conduct",
            "Proposed conduct and reporting principles.",
          ],
        ]
          .filter(([url]) => url !== path)
          .map(([url, title, body]) => [title, body, url, "Read the draft"]),
      ),
      true,
    )
  );
}
export function renderSitePage(path) {
  if (!Object.hasOwn(sitePageMeta, path)) return "";
  if (legalDrafts[path]) return legal(path);
  return {
    "/": home,
    "/what-we-do": overview,
    "/drivers": drivers,
    "/events/hotel-offers": hotels,
    "/training-proposal": proposal,
  }[path]();
}
