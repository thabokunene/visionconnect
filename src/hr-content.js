import { hrRoles, hrDomains, hrQuestions } from "./hr-data.js";
const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const arrow = '<svg aria-hidden="true"><use href="#arrow"/></svg>';
const paths = {
  person:
    '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  clipboard:
    '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 11h6M9 15h6"/>',
  growth: '<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
  pay: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  people:
    '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 21c0-3.5 2.9-6.5 6.5-6.5s6.5 3 6.5 6.5"/><circle cx="17" cy="9" r="2.5"/><path d="M15 15.5c3.5-.5 6.5 2.2 6.5 5.5"/>',
  education:
    '<path d="m3 8 9-4 9 4-9 4-9-4Zm4 2v4c0 1.5 2.2 3 5 3s5-1.5 5-3v-4M21 8v6"/>',
  shield:
    '<path d="m12 2 8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4Zm-3.5 10 2.5 2.5 4.5-4.5"/>',
  case: '<path d="M3 6h18l-2 13H5L3 6Zm5 0V4a4 4 0 0 1 8 0v2"/>',
  document:
    '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};
function icon(type) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[type]}</svg>`;
}
const models = [
  [
    "Most common",
    "Retained HR partner",
    "SMEs with 15–200 staff and no in-house HR manager.",
    "Monthly retainer, named consultant, agreed SLA",
    "Includes: all four service domains, monthly reporting, quarterly health check.",
  ],
  [
    "Project",
    "Project-based",
    "A specific problem: restructuring, policy suite, CCMA case, EE audit.",
    "Scoped and quoted per project",
    "Includes: written scope, fixed fee, agreed deliverables and timeline.",
  ],
  [
    "Advisory",
    "Advisory retainer",
    "Businesses with a junior HR officer who needs backup and escalation support.",
    "Monthly hours bank + escalation support",
    "Includes: on-call advice, escalations and quarterly review, within the agreed scope.",
  ],
];
const commitments = [
  [
    "Critical",
    "Hearing or deadline within 5 days",
    "4 hrs",
    "Consultant assigned within 4 working hours. Hearing support or urgent intervention scoped same-day.",
  ],
  [
    "Urgent",
    "Needs attention this week",
    "1 day",
    "Consultant assigned within one business day. Response plan and timeline agreed in writing.",
  ],
  [
    "Standard",
    "Planning, advisory or non-urgent",
    "3 days",
    "Consultant assigned within three business days. Scheduled advice session or written response.",
  ],
];
const faqs = [
  [
    "Will you replace our existing HR person?",
    "Usually not. We most often <strong>support</strong> a small HR team, cover a vacancy, or handle specialist work — CCMA, EE reporting, restructuring — that an internal generalist isn't resourced for.",
  ],
  [
    "Are you available for CCMA cases?",
    "Ask about support with conciliation and arbitration, including representation <strong>where permitted by the applicable CCMA or bargaining council rules</strong>. We will confirm eligibility, scope and whether specialist counsel is needed. We also help you consider whether settlement is appropriate; no case outcome is guaranteed.",
  ],
  [
    "How quickly can you start?",
    "Retained engagements typically begin <strong>within 10 business days of scope agreement</strong>, subject to availability and the agreed SLA. Ask about the 48-hour response target for CCMA matters. Critical, urgent and standard assignment targets apply to retained clients under their signed SLA, not automatically to website enquiries.",
  ],
  [
    "Do you work outside Gauteng?",
    "Yes. <strong>Retained clients are served nationally</strong>, with on-site attendance scoped per engagement. Most advisory work happens by phone, video and email. Confirm travel, coverage and any associated costs in your quote.",
  ],
  [
    "What happens when we hire our own HR person?",
    "We hand over cleanly. Files, policies, records and open matters are transferred through an agreed secure process. Some clients keep an <strong>advisory retainer</strong> for specialist backup; others end the engagement, in line with the agreed terms.",
  ],
];
export function renderHrContent() {
  return `<section class="cn-hero hm-hero" aria-labelledby="hr-title"><svg class="cn-zebra" aria-hidden="true"><use href="#mark"/></svg><div class="container"><div class="breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/services">Services</a><span aria-hidden="true">/</span><span>External HR Management</span></div><div class="cn-hero-inner"><p class="eyebrow" data-cn-reveal>SERVICES · EXTERNAL HR MANAGEMENT</p><h1 id="hr-title" data-cn-reveal>A full HR function.<br><span>Without the headcount.</span></h1><p class="hm-hero-sub" data-cn-reveal>Contracts, policies, disciplinary processes, CCMA representation, payroll administration, Employment Equity reporting, WSP/ATR and BBBEE — delivered by a named consultant on a monthly retainer, with a documented SLA.</p><div class="hm-actions" data-cn-reveal><a href="/contact?path=hr" class="btn btn-primary">Talk to an HR consultant ${arrow}</a><a href="#health-check" class="btn btn-outline">Take the 2-min health check ${arrow}</a></div><p class="hm-micro" data-cn-reveal>Named consultant · Documented SLA · 48-hour CCMA response target · National coverage</p></div></div></section>
  <section class="cn-stats hm-stats" aria-label="External HR Management at a glance"><div class="container">${[
    ["15–200", "Typical client headcount"],
    ["48 hrs", "CCMA response target"],
    ["10 days", "Retainer start-up*"],
    ["1", "Named consultant"],
  ]
    .map(
      ([figure, label]) =>
        `<div><span class="cn-stat">${figure}</span><span class="cn-stat-label">${label}</span></div>`,
    )
    .join("")}</div></section>
  <section class="cn-section hm-manifesto" aria-labelledby="hr-intro-title"><div class="container hm-editorial"><div class="hm-definition" data-cn-reveal><p class="eyebrow">THE WALL WE WALK IN ON</p><h2 class="visually-hidden" id="hr-intro-title">When your workforce outgrows informal HR.</h2><p>Most growing South African businesses hit the same wall: the workforce outgrows the informal way of doing things — and suddenly there are contracts to write, grievances to handle, a CCMA date on the calendar and a BBBEE scorecard to defend.</p></div><div class="hm-body-copy" data-cn-reveal><p>We step in as your <strong>HR department</strong> — until you're ready to build your own. You get the function, the discipline, the paper trail and the advice, without the cost and lead-time of hiring a senior HR manager.</p><p>If you already have a junior HR officer, we back them up — handling specialist work (CCMA, EE reporting, restructuring, policy suite) that a generalist isn't resourced for.</p><p>No handover cliff. When you're ready to hire internally, we hand over cleanly.</p><p class="hm-small">*The indicative start-up target is 10 business days from scope agreement. Response targets, service availability and exclusions are confirmed in the signed SLA.</p></div></div></section>
  <section class="cn-section cn-subtle" aria-labelledby="hr-coverage-title"><div class="container"><div class="cn-heading hm-centered" data-cn-reveal><p class="eyebrow">THE COVERAGE YOU GET</p><h2 id="hr-coverage-title">Nine HR roles. One retainer.</h2><p>You don't hire these people. You get their work — coordinated by a named consultant who knows your business and answers the phone.</p></div><div class="hm-roles">${hrRoles.map(([type, name, sub], i) => `<article class="hm-role" data-cn-reveal style="--reveal-delay:${(i % 3) * 100}ms"><span class="hm-role-icon">${icon(type)}</span><h3>${escape(name)}</h3><p>${escape(sub)}</p></article>`).join("")}</div><div class="hm-coverage-banner" data-cn-reveal><div><span class="hm-badge">${icon("check")} ALL COVERED</span><p>Nine roles. One retainer. <span>From R4,500/month.</span></p><small>Indicative pricing; scope and terms confirmed in your quote.</small></div><a href="/contact?path=hr" class="btn btn-primary">Get a quote ${arrow}</a></div></div></section>
  <section class="cn-section" aria-labelledby="hr-scope-title"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">WHAT'S INCLUDED</p><h2 id="hr-scope-title">The full HR scope, on one page.</h2><p>Four domains. The standard retained engagement brings these together; confirm your inclusions, limits and any specialist work in the written scope.</p></div><div class="hm-tabs-wrap"><div class="hm-tabs-nav" role="group" aria-label="HR service scope">${hrDomains.map((domain, i) => `<a class="hm-tab" href="#hr-panel-${i + 1}" id="hr-tab-${i + 1}" data-hr-tab="${i}"><span aria-hidden="true">0${i + 1}</span>${domain.label}</a>`).join("")}</div><div class="hm-panels">${hrDomains.map((domain, i) => `<section class="hm-panel" id="hr-panel-${i + 1}" aria-labelledby="hr-panel-heading-${i + 1}" data-hr-panel><div class="hm-panel-head"><h3 id="hr-panel-heading-${i + 1}">${domain.title}</h3><p>${domain.intro}</p></div><ul>${domain.items.map((item) => `<li>${icon("check")}<span>${escape(item)}</span></li>`).join("")}</ul></section>`).join("")}</div></div><p class="hm-small">Representation and regulated services remain subject to applicable eligibility rules. Service descriptions are not legal advice or a guarantee of compliance or case outcomes.</p></div></section>
  <section class="cn-section cn-subtle" aria-labelledby="hr-models-title"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">ENGAGEMENT MODELS</p><h2 id="hr-models-title">Three ways to work with us.</h2><p>Every model comes with a named consultant, a documented SLA and monthly reporting. The difference is rhythm and scope.</p></div><div class="hm-models">${models.map(([tag, title, best, rhythm, includes], i) => `<article class="hm-model ${i === 0 ? "hm-model-featured" : ""}" data-cn-reveal style="--reveal-delay:${i * 100}ms"><span class="hm-badge">${tag}</span><h3>${title}</h3><p>${best}</p><div class="hm-model-rhythm">${icon("clock")}<strong>${rhythm}</strong></div><p class="hm-model-includes">${includes}</p></article>`).join("")}</div></div></section>
  <section class="cn-section" aria-labelledby="hr-need-title"><div class="container hm-editorial"><div class="hm-body-copy" data-cn-reveal><p class="eyebrow">WHAT WE NEED FROM YOU</p><h2 id="hr-need-title">Three things. That's it.</h2><p><strong>Access to employee records.</strong> Contracts, files, payroll data — whatever exists. We'll work with what we find, and tell you what's missing.</p><p><strong>A single point of contact.</strong> One person on your side who can approve, decide, and escalate. Not a committee.</p><p><strong>Honest context.</strong> We'd rather hear the messy version first — it's cheaper to fix early than to discover it during a CCMA hearing.</p><p class="hm-record-notice"><strong>Not through this website.</strong> Do not send employee files, payroll data, ID numbers or case documents in the initial enquiry. Access to records is arranged through an agreed secure process after scoping.</p></div><figure class="hm-quote" data-cn-reveal><blockquote>Most clients tell us the same thing: they knew something was wrong, but they didn't know what to ask. That's exactly what the first call is for.</blockquote><figcaption><strong>HR Practice Lead</strong><span>Citizen Human Capital</span></figcaption></figure></div></section>
  <section class="cn-section hm-commitments" aria-labelledby="hr-commit-title"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">RESPONSE COMMITMENTS</p><h2 id="hr-commit-title">What we promise, and when.</h2><p>Retained clients get named-consultant access with explicit response times. Confirm these targets in your signed SLA, including working hours, coverage and exclusions.</p></div><div class="hm-commit-grid">${commitments.map(([tier, label, response, desc], i) => `<article class="hm-commit" data-cn-reveal style="--reveal-delay:${i * 100}ms"><span class="hm-tier hm-tier-${tier.toLowerCase()}">${tier}</span><h3>${label}</h3><p class="hm-response">${response}</p><p class="hm-commit-desc">${desc}</p></article>`).join("")}</div><p class="hm-sla-note">These are retained-client assignment targets, not promises that a website enquiry will be read, a consultant assigned, or a matter resolved within that time. For a time-sensitive matter, call <a href="tel:+27114519898">+27 11 451 9898</a> and confirm availability directly.</p></div></section>
  <section class="cn-section" id="health-check" aria-labelledby="health-title"><div class="container"><div class="hm-health"><div class="cn-heading hm-centered" data-cn-reveal><p class="eyebrow">2-MINUTE HR HEALTH CHECK</p><h2 id="health-title">How solid is your HR foundation?</h2><p>Six quick questions. Answer honestly to identify areas to review. No contact details required; your answers stay in this page and are not sent or saved.</p></div><p class="hm-health-disclaimer" id="healthDisclaimer">This is a self-check, not a compliance audit or legal advice. “Not required” excludes Employment Equity from the score; “Not sure” on WSP/ATR flags an area to review. A high score does not certify compliance.</p><div class="hm-health-card"><div class="hm-health-progress"><span id="healthProgressLabel">Answered 0 of 6</span><div id="healthProgress" role="progressbar" aria-label="Health check completion" aria-valuemin="0" aria-valuemax="6" aria-valuenow="0" aria-valuetext="Answered 0 of 6"><span></span></div></div><form id="healthForm" novalidate aria-labelledby="health-title" aria-describedby="healthDisclaimer">${hrQuestions.map((q, i) => `<fieldset class="hm-question" data-question="${i}" disabled><legend><span class="hm-question-num" aria-hidden="true">${i + 1}</span><span>${escape(q.question)}</span></legend><div class="hm-health-choices">${q.choices.map(([value, label]) => `<label class="hm-choice" for="hr-q${i + 1}-${value}"><input type="radio" name="hr-q${i + 1}" value="${value}" id="hr-q${i + 1}-${value}"><span>${label}</span></label>`).join("")}</div></fieldset>`).join("")}</form><p class="visually-hidden" id="healthAnnouncement" role="status" aria-live="polite" aria-atomic="true"></p><section class="hm-health-result" id="healthResult" aria-labelledby="healthHeadline" hidden><div class="hm-result-head"><span id="healthScore">0 / 6</span><h3 id="healthHeadline">Your result</h3></div><p id="healthBody"></p><ul id="healthGaps"></ul><p class="hm-result-footnote">Based only on your answers. Not a compliance determination, audit or legal opinion.</p><div class="hm-actions"><a href="/contact?path=hr" class="btn btn-primary">Talk to an HR consultant ${arrow}</a><button type="button" class="btn btn-outline" id="healthReset">Start over</button></div></section></div><noscript><p class="hm-small">JavaScript is needed to calculate a result. You can read the questions and all service information, or contact reception to discuss your HR needs.</p></noscript></div></div></section>
  <section class="cn-section cn-subtle" aria-labelledby="hr-cost-title"><div class="container hm-editorial hm-cost"><div class="hm-body-copy" data-cn-reveal><p class="eyebrow">PRICING</p><h2 id="hr-cost-title">Transparent pricing. No surprise invoices.</h2><p>Retainers are quoted per engagement, based on headcount and scope. There's no per-call charge, no per-document fee, no charge for asking a question within the agreed retainer.</p><p>If a matter falls outside the retainer — a large restructuring, an arbitration requiring specialist counsel — we tell you before we start, in writing.</p><a href="/contact?path=hr" class="btn btn-primary">Request a quote ${arrow}</a></div><div class="hm-cost-card" data-cn-reveal><span class="hm-badge">INDICATIVE</span><p class="hm-price">From R4,500<small>per month · retained engagement · up to 40 staff</small></p><p>Indicative figure. Retainer scales with headcount and scope. Indicative terms: no setup fee; no minimum term in year one. Project and advisory models are quoted separately. Confirm scope, VAT treatment, exclusions and all terms in the written quote.</p></div></div></section>
  <section class="cn-section" aria-labelledby="hr-faq-title"><div class="container"><div class="cn-heading hm-centered" data-cn-reveal><p class="eyebrow">FREQUENTLY ASKED</p><h2 id="hr-faq-title">Questions we actually get asked.</h2></div><div class="hm-faq">${faqs.map(([question, answer]) => `<details class="hm-faq-item" name="hr-faq"><summary>${question}<span aria-hidden="true">+</span></summary><div>${answer}</div></details>`).join("")}</div></div></section>
  <section class="hm-dual" aria-label="Get started"><div class="hm-dual-urgent"><div data-cn-reveal><p class="eyebrow">TIME-SENSITIVE MATTERS</p><h2>Need HR help now?</h2><p>A hearing this week, an inspection, a resignation that leaves you exposed — call us to confirm availability. Retained-client response targets are subject to the signed SLA.</p><div class="hm-actions"><a href="/contact?path=hr-urgent" class="btn cn-secondary">Get HR support now ${arrow}</a><a href="tel:+27114519898" class="hm-call">Call +27 11 451 9898</a></div></div></div><div class="hm-dual-scoping"><div data-cn-reveal><p class="eyebrow">LET'S FIND THE RIGHT FIT</p><h2>Not sure what you need?</h2><p>Request a 15-minute scoping call. Describe the problem; we'll tell you which engagement model fits — or honestly say we're the wrong fit.</p><a href="/contact?path=hr" class="btn btn-primary">Request a scoping call ${arrow}</a><p class="hm-booking-note">Email enquiry only. A call is not booked until confirmed by the team.</p></div></div></section>`;
}
