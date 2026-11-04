import { activate, promo, animations } from "./experience.js";
import {
  events,
  sectors,
  escapeHtml,
  arrow,
  icon,
  eventResults,
  bindSearch,
  sectorOptions,
} from "./events.js";
import "./conferences.css";

export const conferenceDescription =
  "High-impact conferences, workshops and training across seven sectors — in-person, virtual and hybrid. Explore upcoming events and see how we manage the full lifecycle.";
const list = (items) =>
  `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
const enquiry = "/contact?path=events";
const pagePath = "/what-we-do/conferences";

export function renderConferences(main) {
  document.title = "Conferences | Citizen Human Capital";
  main.classList.add("conference-page");
  main.innerHTML = `
  <section class="cn-hero" aria-labelledby="conference-title"><svg class="cn-zebra" aria-hidden="true"><use href="#mark"/></svg><div class="container"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/what-we-do">What we do</a><span>/</span><span>Conferences</span></div><div class="cn-hero-inner">
    <p class="eyebrow" data-cn-reveal>WHAT WE DO · CONFERENCES</p><h1 id="conference-title" data-cn-reveal>Conferences</h1><p class="cn-hero-sub" data-cn-reveal>Your event creation powerhouse:<br>in-person, virtual &amp; hybrid.</p><a class="btn btn-primary" href="#upcoming-events" data-cn-reveal>See upcoming events ${arrow}</a>
    <form role="search" class="cn-hero-search" data-cn-reveal><label for="eventSearch" class="visually-hidden">Search conferences, workshops or training</label>${icon("search")}<input type="search" id="eventSearch" data-event-search placeholder="Search conferences, workshops or training…" autocomplete="off" aria-controls="eventsGrid"><button type="submit" aria-label="View search results">${arrow}</button></form>
    </div><div class="cn-hero-foot"><span>CONNECTION. CAPABILITY. REAL IMPACT.</span><span>BUILT FOR SOUTH AFRICA.</span></div></div></section>
  <section class="cn-stats" aria-label="Conference experience at a glance"><div class="container">${[
    [26, "", "Years of experience"],
    [3000, "+", "Events run in total"],
    [70, "+", "Annual events"],
    [10000, "+", "Past attendees"],
  ]
    .map(
      ([count, suffix, label]) =>
        `<div><span class="cn-stat" aria-hidden="true" data-count="${count}" data-suffix="${suffix}">${count.toLocaleString("en-US")}${suffix}</span><span class="visually-hidden">${count.toLocaleString("en-US")}${suffix}</span><span class="cn-stat-label">${label}</span></div>`,
    )
    .join("")}</div></section>
  <section class="cn-section"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">FROM THE FIRST IDEA TO THE FINAL APPLAUSE</p><h2>Craft unforgettable experiences.<br><span class="muted">From concept to execution, we do it all.</span></h2></div><div class="cn-capabilities">${[
    [
      "conference",
      "Conferences, workshops &amp; training",
      "We produce high-impact learning and connection, from concept and content creation to marketing and attendee engagement.",
    ],
    [
      "management",
      "Conference management",
      "Partner with us to manage your event seamlessly. We handle everything from logistics, marketing and programme development through to virtual, hybrid and on-site delivery.",
    ],
    [
      "award",
      "Industry awards programmes",
      "We deliver world-class, professional awards programmes, designed to showcase and celebrate the very best in talent and achievement.",
    ],
  ]
    .map(
      ([type, title, body], index) =>
        `<article class="cn-cap-card" data-cn-reveal style="--reveal-delay:${index * 100}ms"><span class="cn-card-icon">${icon(type)}</span><h3>${title}</h3><p>${body}</p></article>`,
    )
    .join("")}</div></div></section>
  <section class="cn-partner-intro"><div class="container" data-cn-reveal><p class="eyebrow">WHO WE WORK WITH</p><h2>Partnership is in our DNA — and we deliver great outcomes with every partner, collaborating all the way through.</h2></div></section>
  <section class="cn-section"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">CONFERENCES AND WORKSHOPS</p><h2>We understand what it takes to plan, market and execute conferences, workshops and custom events that deliver great outcomes.</h2></div><div class="cn-detail-grid"><div class="cn-detail-list" data-cn-reveal><h3>Event production &amp; management</h3>${list(["Conferences", "Workshops", "Training", "Awards programmes", "Exhibitions", "Virtual conferences", "Virtual training programme design and delivery"])}</div><div class="cn-detail-list" data-cn-reveal><h3>Creative &amp; experiential design</h3>${list(["Event design and budget management", "Supplier sourcing and contract management", "Virtual and hybrid event design and delivery", "Sector research", "Programme development", "Speaker and talent management", "Website and ticketing", "Theming", "Attendee engagement", "Health &amp; safety", "Venue security"])}</div></div></div></section>
  <section class="cn-section cn-subtle"><div class="container cn-deep"><div data-cn-reveal><p class="eyebrow">CONFERENCE MANAGEMENT</p><h2>Comprehensive event experience development and management.</h2><p>At our core, we specialise in strategic planning and execution for conferences, meetings, corporate events and more. With a relationship-first approach, we prioritise listening, questioning and careful assessment to provide informed advice.</p><p>Once we define the project scope, our diligent execution includes budgeting, sponsorship acquisition, marketing strategies, logistics management, registration oversight and speaker coordination — to ensure every event meets and exceeds KPIs.</p><a class="btn btn-primary" href="${enquiry}">Talk to us today ${arrow}</a></div><div class="cn-media" data-cn-reveal aria-hidden="true"><span class="cn-media-top">THE DETAILS, HANDLED.</span><strong>70<span>+</span></strong><span class="cn-media-label">ANNUAL EVENTS</span><svg class="cn-media-mark"><use href="#mark"/></svg><span class="cn-media-bottom">From the big picture to the smallest detail.</span><span class="cn-media-quote">“</span></div></div></section>
  <section class="cn-partnership cn-section"><div class="container" data-cn-reveal><p class="eyebrow">WORKING IN PARTNERSHIP</p><h2>Partnering is in our DNA.</h2><p>At Citizen Human Capital, we thrive on open and constructive partnerships that drive success in everything we do.</p><p>With nearly three decades of experience, we specialise in collaborating with private sector businesses and industry and professional associations to deliver world-leading connection and capability experiences. Whether it’s conferences, workshops, webinars or custom events, we’re here to enhance your organisation’s impact through meaningful engagements.</p><a href="${enquiry}" class="btn btn-primary">Who we partner with ${arrow}</a></div></section>
  <section class="cn-section"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">AWARDS PROGRAMMES</p><h2>End-to-end awards planning and execution.</h2><p>We offer a full awards planning &amp; execution service — matched with our experience in creating amazing gala awards dinners. Our project manager will help you plan the key elements, then roll out an execution strategy.</p></div><div class="cn-awards-grid">${[
    [
      "Strategy and planning",
      [
        "Development of awards categories",
        "Sponsorship targeting &amp; table sales",
        "Marketing for entries",
        "Personal teleservices to encourage entries",
      ],
    ],
    [
      "Execution and management",
      [
        "Judging committee management",
        "Specialised awards software",
        "Judging process management (online &amp; judging days)",
      ],
    ],
    [
      "Event coordination",
      [
        "Plan and execute your gala awards function &amp; ceremony",
        "Venue and supplier coordination",
        "On-the-night production and stage management",
      ],
    ],
  ]
    .map(
      ([title, items], index) =>
        `<article class="cn-awards-card" data-cn-reveal><span class="cn-phase">0${index + 1}</span><h3>${title}</h3>${list(items)}</article>`,
    )
    .join("")}</div></div></section>
  <section class="cn-section cn-subtle" id="upcoming-events" aria-labelledby="events-title"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">UPCOMING EVENTS</p><h2 id="events-title">What’s on next.</h2></div><div class="cn-filter-bar"><label for="conference-filter" class="cn-filter-search">${icon("search")}<span class="visually-hidden">Filter events by title, sector or location</span><input id="conference-filter" type="search" data-event-search placeholder="Find your next event…" aria-controls="eventsGrid"></label><label class="cn-select"><span class="visually-hidden">Filter by sector</span><select data-sector-filter aria-controls="eventsGrid"><option value="">All sectors</option>${sectorOptions()}</select></label></div><div id="eventsGrid">${eventResults()}</div><div class="cn-events-cta"><a class="btn cn-secondary" href="/events">Browse all conferences ${arrow}</a></div></div></section>
  <section class="cn-know cn-section"><div class="container" data-cn-reveal><p class="eyebrow">LET’S MAKE IT HAPPEN</p><h2>Want to know more?</h2><p>Ask us about any of our events by getting in touch below.</p><a class="btn btn-primary" href="${enquiry}">Contact us ${arrow}</a></div></section>`;
  activate();
  promo();
  bindSearch(main);
  animations(main);
}

export function renderEvents(main, pathname) {
  main.classList.add("conference-page");
  const slug = pathname.split("/")[2];
  const event = events.find((item) => item.slug === slug);
  const sector = sectors.find((item) => item.slug === slug);
  if (event) {
    document.title = `${event.title} | Citizen Human Capital`;
    main.innerHTML = `<section class="cn-section cn-event-detail"><div class="container"><a class="text-link" href="/events">← All conferences</a><p class="eyebrow">${escapeHtml(event.tag)}</p><h1>${escapeHtml(event.title)}</h1><div class="cn-detail-meta"><span>${icon("calendar")}<time datetime="${event.start}">${event.date}</time></span><span>${icon("pin")}${escapeHtml(event.location)}</span></div><h2>Interested in attending?</h2><p>Contact our events team for the programme, venue, availability and booking information. Online bookings are not available on this website.</p><a class="btn btn-primary" href="${enquiry}&amp;event=${encodeURIComponent(event.slug)}">Enquire about this event ${arrow}</a></div></section>`;
  } else {
    document.title = `${sector?.label || "All conferences"} | Citizen Human Capital`;
    main.innerHTML = `<section class="cn-section cn-catalogue"><div class="container"><p class="eyebrow">CONNECT. LEARN. MOVE FORWARD.</p><h1>${escapeHtml(sector?.label || "All conferences")}</h1><p>Find your next conference, workshop or training event.</p><div class="cn-filter-bar"><label class="cn-filter-search" for="conference-filter">${icon("search")}<span class="visually-hidden">Search events</span><input id="conference-filter" type="search" data-event-search placeholder="Search by title, sector or location…" aria-controls="eventsGrid"></label><label class="cn-select"><span class="visually-hidden">Filter by sector</span><select data-sector-filter aria-controls="eventsGrid"><option value="">All sectors</option>${sectorOptions()}</select></label></div><div id="eventsGrid">${eventResults()}</div><a class="text-link" href="${pagePath}">About our conferences ${arrow}</a></div></section>`;
    bindSearch(main, { sector: sector?.slug || "" });
  }
  activate();
}
export function isEventRoute(pathname) {
  return (
    pathname === "/events" ||
    events.some((event) => pathname === `/events/${event.slug}`) ||
    sectors.some((sector) => pathname === `/events/${sector.slug}`)
  );
}
