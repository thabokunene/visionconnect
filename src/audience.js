import { activate, promo, animations } from "./experience.js";
import { arrow, icon } from "./events.js";
import "./audience.css";

export const audiencePath = "/what-we-do/audience-marketing";
export const audienceDescription =
  "Sponsorship and engagement opportunities across 50+ annual conferences, workshops and training sessions. Connect with C-suite decision-makers and sector leaders across seven industries.";
export const sponsorshipEmail = "sponsorship@citizenhc.co.za";
const audienceRoles = [
  "C-suite executives and senior decision-makers",
  "HR, Finance, Technology and Operations leaders",
  "Education and Health sector professionals",
  "Energy, Infrastructure and Construction",
  "Transport, Logistics and Supply Chain",
  "National, Provincial and Local Government",
];
const benefits = [
  [
    "growth",
    "Lead generation",
    "Connect with qualified and engaged audiences to generate new business leads and nurture existing relationships for growth.",
  ],
  [
    "brand",
    "Brand exposure",
    "Boost industry visibility. Curate your brand presence across multiple touchpoints — pre, during and post event.",
  ],
  [
    "people",
    "Networking",
    "Connect with peers, clients and partners. In-person engagement sparks opportunities and collaborations like no other channel.",
  ],
  [
    "idea",
    "Thought leadership",
    "Establish your position by sharing insights, hosting workshops and joining discussions that shape your sector.",
  ],
];
const opportunities = [
  [
    "Exhibitions and premium events",
    "Connect in person — the best way to do business — with your key audience at our conference expos and exhibitions, where authentic conversations, solution demonstrations and partnership discussions happen in real time.",
  ],
  [
    "Exclusive summits and gala dinners",
    "Host at exclusive summits and gala dinners, including Awards Dinners, to position your brand as a sector thought leader — and reward your team and key clients.",
  ],
  [
    "Executive roundtables and bespoke events",
    "Access, create and curate executive roundtables, bespoke events, workshops and webinars — direct engagement with the decision-makers and influencers who matter most.",
  ],
  [
    "Speaking and thought leadership",
    "Get in front of your critical audience at strategic forums, with speaking and panel opportunities that position your people and your solutions at the forefront — and your organisation as a thought leader.",
  ],
];
function audienceIcon(type) {
  const paths = {
    growth: '<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
    brand:
      '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3m-17-7 2 2m10 10 2 2m0-14-2 2M7 17l-2 2"/>',
    people:
      '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 21c0-3.5 2.9-6.5 6.5-6.5s6.5 3 6.5 6.5"/><circle cx="17" cy="9" r="2.5"/><path d="M15 15.5c3.5-.5 6.5 2.2 6.5 5.5"/>',
    idea: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2Z"/>',
    phone: '<path d="m7 3 3 5-3 3c1 3 3 5 6 6l3-3 5 3-1 4C10 23 1 14 3 4z"/>',
    email:
      '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[type]}</svg>`;
}
function field({
  id,
  name,
  label,
  type = "text",
  autocomplete,
  placeholder,
  max = 120,
  required = false,
  full = false,
}) {
  return `<div class="am-field ${full ? "am-field-full" : ""}"><label for="${id}">${label}${required ? ' <span class="am-required">(Required)</span>' : ' <span class="am-optional">(Optional)</span>'}</label><input id="${id}" name="${name}" type="${type}" autocomplete="${autocomplete}" maxlength="${max}" placeholder="${placeholder}" ${required ? "required" : ""}><p class="am-field-error" id="${id}Error" hidden></p></div>`;
}
export function renderAudience(main) {
  document.title = "Audience Marketing | Citizen Human Capital";
  main.classList.add("conference-page", "audience-page");
  main.innerHTML = `
 <section class="cn-hero am-hero" aria-labelledby="audience-title"><svg class="cn-zebra" aria-hidden="true"><use href="#mark"/></svg><div class="container"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/what-we-do">What we do</a><span>/</span><span>Audience marketing</span></div><div class="cn-hero-inner"><p class="eyebrow" data-cn-reveal>WHAT WE DO · AUDIENCE MARKETING</p><h1 id="audience-title" data-cn-reveal>Audience Marketing</h1><p class="cn-hero-sub" data-cn-reveal>Maximise your impact with in-person events. Connect with the decision-makers, influencers and sector leaders who shape South African business.</p><div class="am-hero-actions" data-cn-reveal><a class="btn btn-primary" href="#enquire">Contact us ${arrow}</a><a class="btn btn-outline" href="/events">See our events ${arrow}</a></div></div><div class="cn-hero-foot"><span>THE RIGHT PEOPLE. THE RIGHT CONVERSATION.</span><span>REAL CONNECTIONS. MEANINGFUL IMPACT.</span></div></div></section>
 <section class="cn-stats" aria-label="Audience reach at a glance"><div class="container">${[
   [26, "", "Years of experience"],
   [50, "+", "Annual events"],
   [70, "+", "Sessions per year"],
   [10000, "+", "Past attendees"],
 ]
   .map(
     ([value, suffix, label]) =>
       `<div><span class="cn-stat" aria-hidden="true" data-count="${value}" data-suffix="${suffix}">${value.toLocaleString("en-US")}${suffix}</span><span class="visually-hidden">${value.toLocaleString("en-US")}${suffix}</span><span class="cn-stat-label">${label}</span></div>`,
   )
   .join("")}</div></section>
 <section class="cn-section" aria-labelledby="why-sponsor-title"><div class="container am-editorial"><div class="am-editorial-copy" data-cn-reveal><p class="eyebrow">WHY EVENT SPONSORSHIP?</p><h2 id="why-sponsor-title">Real business outcomes, in the room where it matters.</h2><p>With 50+ annual conferences spanning seven industry sectors, we offer multiple opportunities to engage in person with your target audiences — in ways that are impactful and meaningful, creating real business outcomes to support your growth ambitions.</p><p>No spray-and-pray. No vanity metrics. Just the right people, in the same room, focused on the same problem — with your brand as the connector.</p><a href="/events" class="btn btn-primary">View all events ${arrow}</a></div><div class="am-stat-media" data-cn-reveal aria-hidden="true"><span class="am-media-kicker">YOUR BRAND. THEIR NEXT BIG IDEA.</span><svg class="am-media-mark"><use href="#mark"/></svg><div class="am-media-bottom"><strong>50<span>+</span></strong><span>ANNUAL OPPORTUNITIES TO CONNECT</span></div></div></div></section>
 <section class="cn-section am-benefits" aria-labelledby="benefits-title"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">FOUR REASONS TO SPONSOR</p><h2 id="benefits-title">What in-person engagement actually delivers.</h2></div><div class="am-benefits-grid">${benefits.map(([type, title, body], index) => `<article class="am-benefit" data-cn-reveal style="--reveal-delay:${index * 100}ms"><span class="am-benefit-icon">${audienceIcon(type)}</span><h3>${title}</h3><p>${body}</p></article>`).join("")}</div></div></section>
 <section class="cn-section" aria-labelledby="difference-title"><div class="container am-editorial"><div class="am-editorial-copy" data-cn-reveal><p class="eyebrow">THE CITIZEN DIFFERENCE</p><h2 id="difference-title">The right people, in the room, every time.</h2><p>We connect your business with the decision-makers and influencers across a wide array of roles and sectors:</p><ul class="am-audience-list">${audienceRoles.map((role) => `<li>${role}</li>`).join("")}</ul><a href="/events" class="btn btn-primary">View events in your sector ${arrow}</a></div><div class="am-difference-media" data-cn-reveal aria-hidden="true"><span class="am-media-pill">CURATED AUDIENCES</span><svg class="am-media-mark"><use href="#mark"/></svg><div class="am-media-bottom"><strong>7</strong><span>SECTORS · ONE TRUSTED PLATFORM</span></div></div></div></section>
 <section class="cn-section cn-subtle" aria-labelledby="opportunities-title"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">ELEVATE AND CONNECT YOUR BRAND</p><h2 id="opportunities-title">Four ways to put your brand in the room.</h2><p>Every opportunity is bespoke. We work with you to shape the right format for your objectives, your audience and your budget.</p></div><div class="am-opportunity-grid">${opportunities.map(([title, body], index) => `<article class="am-opportunity" data-cn-reveal style="--reveal-delay:${(index % 2) * 100}ms"><span class="am-opportunity-number" aria-hidden="true">0${index + 1}</span><h3>${title}</h3><p>${body}</p></article>`).join("")}</div></div></section>
 <section class="cn-section" aria-labelledby="sponsor-testimonial-title"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">WHAT OUR SPONSOR PARTNERS SAY</p><h2 id="sponsor-testimonial-title">A returning partner, every year.</h2></div><figure class="am-testimonial" data-cn-reveal><blockquote>“We sponsor three of Citizen’s annual conferences and it has become a cornerstone of our marketing calendar. The audiences are senior, the conversations are real, and the follow-up leads have converted into some of our biggest contracts. No other channel gets us in front of this many decision-makers this efficiently.”</blockquote><figcaption><strong>Marketing Director</strong><span>National financial services group · Gauteng</span></figcaption></figure></div></section>
 <section class="cn-section cn-subtle am-enquire" id="enquire" aria-labelledby="enquire-title"><div class="container am-enquire-grid"><div class="am-editorial-copy" data-cn-reveal><p class="eyebrow">ENQUIRE ABOUT SPONSORSHIP</p><h2 id="enquire-title">Let’s talk about what fits.</h2><p>Reach out with any inquiry about sponsorship, exhibition or speaking opportunities. We’ll come back with a concrete proposal — packs, pricing and available formats across the events that match your objectives.</p><ul class="am-contact-list"><li><span>${audienceIcon("phone")}</span><a href="tel:+27114519898">+27 11 451 9898</a></li><li><span>${audienceIcon("email")}</span><a href="mailto:${sponsorshipEmail}">${sponsorshipEmail}</a></li><li><span>${icon("pin")}</span><address>Block C, Stoneridge Office Park<br>8 Greenstone Pl, Modderfontein<br>Johannesburg, Gauteng, 1609<br>South Africa</address></li></ul><p class="am-enquire-note">Prefer our main reception? <a href="mailto:reception@citizenhc.co.za">reception@citizenhc.co.za</a></p></div>
 <div class="am-form-card" data-cn-reveal><h2 id="sponsor-form-title">Sponsorship enquiry</h2><p class="am-form-sub">Tell us a little about your objectives — we’ll come back with options. Required fields are marked below.</p><form id="sponsorForm" novalidate aria-labelledby="sponsor-form-title" aria-describedby="sponsor-form-notice"><div class="am-form-fields">
 <div class="am-honeypot" aria-hidden="true"><label for="hpLinkedin">LinkedIn (leave blank)</label><input type="text" id="hpLinkedin" name="linkedin" tabindex="-1" autocomplete="off"></div><input type="hidden" name="pageSource" value="Audience Marketing"><input type="hidden" name="pageUrl" value="https://www.citizenhc.co.za${audiencePath}">
 ${field({ id: "fName", name: "name", label: "Name", autocomplete: "name", placeholder: "Full name", max: 100, required: true })}
 ${field({ id: "fJob", name: "jobTitle", label: "Job title", autocomplete: "organization-title", placeholder: "Job title", required: true })}
 ${field({ id: "fEmail", name: "email", label: "Email", type: "email", autocomplete: "email", placeholder: "Email address", max: 254, required: true })}
 ${field({ id: "fPhone", name: "phone", label: "Phone", type: "tel", autocomplete: "tel", placeholder: "Phone number", max: 50 })}
 ${field({ id: "fCompany", name: "company", label: "Company", autocomplete: "organization", placeholder: "Company", max: 180, required: true, full: true })}
 <div class="am-field am-field-full"><label for="fEnquiry">I’m enquiring about <span class="am-optional">(Optional)</span></label><select id="fEnquiry" name="enquiryType"><option value="">Select a topic…</option>${["Conference", "Training Course", "Workshop", "Sponsorship opportunities", "Speaking opportunities", "Awards", "Other"].map((topic) => `<option>${topic}</option>`).join("")}</select></div>
 <div class="am-field am-field-full"><label for="fMessage">Message <span class="am-optional">(Optional)</span></label><textarea id="fMessage" name="message" placeholder="Anything else we should know — objectives, audience, timeline, budget?" rows="5" maxlength="3000"></textarea></div>
 <div class="am-field am-field-full"><div class="am-consent"><input type="checkbox" id="fConsent" name="consent" required><label for="fConsent">I agree to Citizen using these details to respond to this enquiry. See the <a href="/popia-notice">POPIA Notice</a>. <span class="am-required">(Required)</span></label></div><p class="am-field-error" id="fConsentError" hidden></p></div>
 </div><p class="am-form-notice" id="sponsor-form-notice"><strong>Email-based enquiry.</strong> This form prepares a draft to ${sponsorshipEmail}. You’ll review and send it in your email app. Nothing is sent or stored by this website. Please do not include sensitive personal information or documents.</p><button type="submit" class="btn btn-primary">Prepare email enquiry ${arrow}</button><div id="formStatus" class="am-form-status" role="status" aria-live="polite" aria-atomic="true"></div></form></div></div></section>`;
  activate();
  promo();
  bindSponsorForm(main);
  animations(main);
}
function bindSponsorForm(root) {
  const form = root.querySelector("#sponsorForm");
  const status = root.querySelector("#formStatus");
  const messages = {
    fName: "Please enter your name.",
    fJob: "Please enter your job title.",
    fEmail: "Please enter a valid email address.",
    fCompany: "Please enter your company name.",
    fConsent: "Please agree to using your details to respond to this enquiry.",
  };
  const fields = Object.keys(messages).map((id) =>
    form.querySelector(`#${id}`),
  );
  function valid(field) {
    if (field.type === "checkbox") return field.checked;
    if (field.type === "email")
      return (
        field.validity.valid &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())
      );
    return !!field.value.trim() && field.validity.valid;
  }
  function showError(field) {
    const error = form.querySelector(`#${field.id}Error`);
    if (valid(field)) {
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
      error.hidden = true;
      error.textContent = "";
      return true;
    }
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", error.id);
    error.hidden = false;
    error.textContent = messages[field.id];
    return false;
  }
  form.addEventListener("input", (event) => {
    status.replaceChildren();
    status.className = "am-form-status";
    if (
      fields.includes(event.target) &&
      event.target.hasAttribute("aria-invalid")
    )
      showError(event.target);
  });
  form.addEventListener("change", (event) => {
    status.replaceChildren();
    status.className = "am-form-status";
    if (
      fields.includes(event.target) &&
      event.target.hasAttribute("aria-invalid")
    )
      showError(event.target);
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.replaceChildren();
    status.className = "am-form-status";
    if (form.elements.linkedin.value.trim()) {
      status.classList.add("is-error");
      status.textContent = `Unable to prepare this enquiry. Please email ${sponsorshipEmail} directly.`;
      return;
    }
    const invalid = fields.filter((field) => !showError(field));
    if (invalid.length) {
      status.classList.add("is-error");
      status.textContent = "Please check the highlighted fields and try again.";
      invalid[0].focus();
      return;
    }
    const data = new FormData(form);
    const topic = data.get("enquiryType") || "Sponsorship opportunities";
    const body = [
      `Name: ${String(data.get("name")).trim()}`,
      `Job title: ${String(data.get("jobTitle")).trim()}`,
      `Email: ${String(data.get("email")).trim()}`,
      `Phone: ${String(data.get("phone")).trim() || "Not provided"}`,
      `Company: ${String(data.get("company")).trim()}`,
      `I'm enquiring about: ${topic}`,
      "",
      String(data.get("message") || ""),
      "",
      "Consent: I agree to Citizen using these details to respond to this enquiry.",
      `Source: ${data.get("pageSource")}`,
      `Page: ${data.get("pageUrl")}`,
    ].join("\n");
    status.classList.add("is-ready");
    const message = document.createElement("p");
    message.textContent =
      "Your email draft is ready. Nothing has been sent yet.";
    const link = document.createElement("a");
    link.href = `mailto:${sponsorshipEmail}?subject=${encodeURIComponent(`Sponsorship enquiry: ${topic}`)}&body=${encodeURIComponent(body)}`;
    link.textContent = "Open your email app to review and send →";
    status.append(message, link);
    link.focus();
  });
}
