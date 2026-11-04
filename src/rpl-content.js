import { qualifications, rplSectors } from "./rpl-data.js";

const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const arrow = '<svg aria-hidden="true"><use href="#arrow"/></svg>';
const check =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m4 12 5 5L20 6"/></svg>';
const who = [
  [
    "<path d='M14.7 6.3a4.5 4.5 0 0 0-5.4 5.4l-6.2 6.2a2.1 2.1 0 0 0 3 3l6.2-6.2a4.5 4.5 0 0 0 5.4-5.4l-2.6 2.6-2.4-2.4 2-3Z'/>",
    "Experienced tradespeople & technicians",
    "You've built, repaired, installed, welded, wired for years — but nothing formal on record.",
  ],
  [
    "<circle cx='9' cy='8' r='3.5'/><path d='M2.5 21c0-3.5 2.9-6.5 6.5-6.5s6.5 3 6.5 6.5'/><circle cx='17' cy='9' r='2.5'/><path d='M15 15.5c3.5-.5 6.5 2.2 6.5 5.5'/>",
    "Supervisors & team leaders",
    "You lead the team, run the shift, own the outcomes — but can't formally prove it yet.",
  ],
  [
    "<rect x='5' y='11' width='14' height='10' rx='2'/><path d='M8 11V7a4 4 0 0 1 8 0v4'/>",
    "Professionals without the papers",
    "You do the work of an engineer, accountant, HR officer or manager — without the qualification to match.",
  ],
  [
    "<path d='m3 8 9-4 9 4-9 4-9-4Z'/><path d='M7 10v4c0 1.5 2.2 3 5 3s5-1.5 5-3v-4M21 8v6'/>",
    "Employers investing in skills",
    "You want your skills development spend to produce a real, registered outcome for your team.",
  ],
];
const stages = [
  [
    "Eligibility screening",
    "No cost · 20 minutes",
    "We review your CV, work history and existing certificates against the requirements of the target qualification — and tell you honestly whether RPL is the right route for you.",
  ],
  [
    "Portfolio of Evidence",
    "4–8 weeks · part-time",
    "With a coach, you assemble the evidence: employment letters, job descriptions, logbooks, supervisor testimonials, certificates, photographs of work, and a written account of your experience.",
  ],
  [
    "Assessment",
    "Format shared in advance",
    "An accredited assessor reviews your portfolio and conducts a practical and/or oral assessment where required. You'll know the format in advance — no surprises.",
  ],
  [
    "Moderation and award",
    "Subject to successful assessment",
    "Assessment decisions are moderated internally and externally. Following successful assessment and moderation, the qualification can be awarded and the relevant records updated.",
  ],
];
const faqs = [
  [
    "Is RPL a real qualification, or a certificate of attendance?",
    "<strong>A qualification, not a certificate of attendance.</strong> RPL assesses prior learning against a registered qualification through an appropriately accredited provider and moderated assessment. Any award depends on meeting the qualification requirements. Confirm the current registration and provider scope during screening.",
  ],
  [
    "Is this only for drivers?",
    "No. The illustrative pathways span <strong>transport, trades, finance, engineering, health, education, HR, IT, safety and management</strong>. If your profession isn't listed above, ask: we may still be able to help. Eligibility and availability are confirmed during screening.",
  ],
  [
    "Which qualification do I qualify for?",
    "We work that out during your <strong>free eligibility screening</strong>. Your CV and work history help us map your experience against the relevant qualification requirements. The screening takes about 20 minutes and comes with an honest answer — including whether RPL is the right route at all. Please do not send documents through the website enquiry form.",
  ],
  [
    "How long does it take?",
    "The supplied indicative timeline is <strong>8 to 14 weeks</strong>. Timing depends on the qualification, evidence gathering, assessment and moderation. Your specific timeline is confirmed during screening; it is not a guaranteed completion date.",
  ],
  [
    "What if my old employer has closed down?",
    "We can discuss alternative evidence such as affidavits, colleague testimonials, payslips, logbooks and site records. What is acceptable depends on the qualification and the assessor's evidence requirements.",
  ],
  [
    "Can my employer pay for it?",
    "Yes — ask about an employer-sponsored cohort. Costs are quoted per qualification and candidate, with group rates for cohorts of five or more. Any skills-development, B-BBEE or WSP treatment depends on the applicable rules and your approved plan; confirm it with your skills development adviser.",
  ],
  [
    "What if I don't pass the assessment?",
    "You receive specific feedback on gaps and can discuss supplementing your portfolio or further learning. Reassessment requirements, timelines and any additional costs should be confirmed before starting. Screening is not a guarantee of an award.",
  ],
];

export function renderRplContent() {
  return `<section class="cn-hero rp-hero" aria-labelledby="rpl-title">
  <svg class="cn-zebra" aria-hidden="true"><use href="#mark"/></svg>
  <div class="container"><div class="breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/services">Services</a><span aria-hidden="true">/</span><span>Recognition of Prior Learning</span></div>
  <div class="cn-hero-inner"><p class="eyebrow" data-cn-reveal>SERVICES · RECOGNITION OF PRIOR LEARNING</p>
  <h1 id="rpl-title" data-cn-reveal>You've been doing the job for years.<br><span>Let's make it official.</span></h1>
  <p class="rp-hero-sub" data-cn-reveal>Recognition of Prior Learning turns what you already know and can do — gained through work, not a classroom — into credit towards a registered, SAQA-aligned qualification. Drivers, engineers, accountants, nurses, HR professionals, IT specialists, tradespeople, managers — whatever field you've worked in, start by finding out how your experience fits.</p>
  <div class="rp-actions" data-cn-reveal><a class="btn btn-primary" href="/contact?path=rpl">Request a free eligibility screening ${arrow}</a><a class="btn btn-outline" href="#qualifications">Browse qualifications ${arrow}</a></div>
  <div class="rp-sector-strip" data-cn-reveal><strong>ACROSS TEN SECTORS</strong><span>Transport</span><span>Trades</span><span>Finance</span><span>Engineering</span><span>Health</span><span>Education</span><span>HR</span><span>IT</span><span>Safety</span><span>Management</span></div></div></div></section>
  <section class="cn-stats rp-stats" aria-label="RPL programme at a glance"><div class="container"><div><span class="cn-stat" data-count="1200" data-suffix="+" aria-hidden="true">1,200+</span><span class="visually-hidden">1,200+</span><span class="cn-stat-label">Qualifications awarded</span></div><div><span class="cn-stat">10</span><span class="cn-stat-label">Sectors covered</span></div><div><span class="cn-stat">NQF 3–6</span><span class="cn-stat-label">Qualification levels</span></div><div><span class="cn-stat">8–14 wks</span><span class="cn-stat-label">Average duration</span></div></div></section>
  <section class="cn-section rp-manifesto" aria-labelledby="rpl-intro-title"><div class="container rp-manifesto-grid"><div class="rp-definition" data-cn-reveal><p class="eyebrow">WHAT RPL ACTUALLY IS</p><h2 id="rpl-intro-title">You already know the job.</h2><p>RPL is a formal process that assesses what you already know and can do — gained through work, not a classroom — and credits it towards a registered qualification.</p></div><div class="rp-body-copy" data-cn-reveal><p>For experienced professionals, it's a <strong>route to a qualification on the National Qualifications Framework</strong> — without starting from the beginning.</p><p>You assemble the evidence of what you've already learned on the job, and an appropriately accredited assessor assesses it against the requirements of a registered qualification. Further learning may be needed where there are gaps.</p><p>It works in the workshop, in the depot, in the consulting room, on the site, and behind the desk. Start with your experience — then find out which pathway fits.</p></div></div></section>
  <section class="cn-section" aria-labelledby="rpl-who-title"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">WHO IT'S FOR</p><h2 id="rpl-who-title">Not just drivers.</h2><p>If you've built your capability through years of work, and don't have the paper to prove it — explore whether RPL is right for you.</p></div><div class="rp-who-grid">${who.map(([svg, title, body], i) => `<article class="rp-who-card" data-cn-reveal style="--reveal-delay:${i * 100}ms"><span class="rp-who-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svg}</svg></span><h3>${escape(title)}</h3><p>${escape(body)}</p></article>`).join("")}</div></div></section>
  <section class="cn-section cn-subtle" aria-labelledby="rpl-process-title"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">THE PROGRAMME</p><h2 id="rpl-process-title">Four stages. One qualification.</h2><p>You don't start from scratch. You start from where you already are.</p></div><ol class="rp-stages" id="rpl-stages">${stages.map(([title, meta, body], i) => `<li class="rp-stage" data-cn-reveal><span class="rp-stage-marker" aria-hidden="true">0${i + 1}</span><div class="rp-stage-head"><h3>${title}</h3><span>${meta}</span></div><p>${body}</p></li>`).join("")}</ol><div class="rp-actions" data-cn-reveal><a class="btn btn-dark cn-secondary" href="/contact?path=rpl">Start with a free screening ${arrow}</a></div></div></section>
  <section class="cn-section" id="qualifications" aria-labelledby="qual-title"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">QUALIFICATION PATHWAYS</p><h2 id="qual-title">One programme. Ten sectors. Real qualifications.</h2><p>A snapshot of the qualification pathways we support. Exact availability is confirmed during your screening. Filter by sector to find yours.</p></div>
  <div class="rp-filter-bar" role="group" aria-label="Filter qualifications by sector">${["all", ...rplSectors].map((sector) => `<button type="button" disabled class="rp-filter-chip" data-rpl-filter="${escape(sector)}" aria-pressed="${sector === "all"}" aria-controls="qualGrid">${sector === "all" ? "All" : escape(sector)} <span class="rp-chip-count">${sector === "all" ? qualifications.length : qualifications.filter((q) => q.sector === sector).length}</span></button>`).join("")}</div>
  <p class="rp-qual-count" id="qualCount" role="status" aria-live="polite" aria-atomic="true">Showing all ${qualifications.length} qualification pathways across ten sectors.</p>
  <div class="rp-qual-grid" id="qualGrid">${qualifications.map((q) => `<article class="rp-qual-card" data-sector="${escape(q.sector)}"><span class="rp-qual-sector">${escape(q.sector)}</span><h3>${escape(q.title)}</h3><div class="rp-qual-meta"><span class="rp-nqf rp-nqf-${q.nqf}">NQF ${q.nqf}</span><span class="rp-candidate">${escape(q.candidate)}</span></div></article>`).join("")}</div>
  <p class="rp-note">This list is illustrative, not exhaustive. Qualification names, NQF levels, current SAQA registrations, provider accreditation scope and availability must be confirmed during screening. The current examples span NQF 3–5; ask about NQF 6 availability. If your profession isn't listed, ask: we may still be able to help.</p><p class="rp-professional-note"><strong>A qualification is not a licence to practise.</strong> RPL does not automatically confer professional registration or authorisation to practise in a regulated profession. Additional regulator requirements may apply.</p>
  <noscript><p class="rp-note">All ${qualifications.length} pathways are shown. Sector filtering requires JavaScript; you can browse the full list and use the enquiry links without it.</p></noscript></div></section>
  <section class="cn-section cn-subtle" aria-labelledby="rpl-ba-title"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">BEFORE AND AFTER</p><h2 id="rpl-ba-title">The same experience. A different outcome.</h2></div><div class="rp-ba"><article class="rp-ba-before" data-cn-reveal><span class="rp-ba-badge">WITHOUT FORMAL RECOGNITION</span><h3>Fifteen years of doing the job. Nothing formal on record.</h3><ul><li>Experience that isn't formally recognised</li><li>Promotion blocked by a qualification requirement</li><li>Skills development spend without a registered qualification outcome</li></ul></article><article class="rp-ba-after" data-cn-reveal><span class="rp-ba-badge">WITH SUCCESSFUL RPL</span><h3>Same experience. Now officially credited.</h3><ul><li>Credit towards, or award of, a registered qualification</li><li>A route to meeting qualification requirements for progression</li><li>Potential skills-development contribution, subject to applicable rules</li></ul></article></div></div></section>
  <section class="cn-section" aria-labelledby="rpl-needs-title"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">WHAT YOU'LL NEED</p><h2 id="rpl-needs-title">Practical, not bureaucratic.</h2></div><div class="rp-needs"><article class="rp-needs-card" data-cn-reveal><h3>For your portfolio</h3><ul>${["Certified copy of your ID", "CV or work history", "Employment confirmation letters — or affidavits where an employer no longer exists", "Any certificates you already hold", "Sector-specific evidence — varies by qualification (logbooks, portfolios, site records, client work)", "Access to a coach, and roughly 4–6 hours a week for the portfolio phase"].map((item) => `<li>${check}<span>${item}</span></li>`).join("")}</ul><p class="rp-note"><strong>Not at enquiry stage.</strong> Please do not send ID copies, client records, medical information or other sensitive evidence through this website or the initial email enquiry. Ask for the approved secure document process after screening.</p></article><aside class="rp-reassurance" data-cn-reveal aria-labelledby="rpl-reassurance-title"><span>REASSURANCE</span><h3 id="rpl-reassurance-title">No matric? Let's check your pathway.</h3><p>A school qualification is not the only way to demonstrate prior learning. Entry and evidence requirements vary by qualification. Screening will establish what your chosen pathway requires.</p></aside></div></div></section>
  <section class="cn-section cn-subtle" aria-labelledby="rpl-cost-title"><div class="container"><div class="cn-heading" data-cn-reveal><p class="eyebrow">TIMELINE AND COST</p><h2 id="rpl-cost-title">Transparent from day one.</h2></div><div class="rp-cost-grid"><article class="rp-cost-card" data-cn-reveal><h3>TYPICAL DURATION</h3><p class="rp-cost-figure">8–14 weeks</p><p>Indicative time from initial screening to award, depending on the qualification, how quickly evidence is gathered, assessment and moderation. Your timeline is confirmed during screening.</p></article><article class="rp-cost-card" data-cn-reveal><h3>COST</h3><p class="rp-cost-figure">Quoted per candidate</p><p>Priced per qualification and per candidate. Ask about group rates for employer-sponsored cohorts of five or more. The quote will set out the scope and any further learning or reassessment costs.</p></article></div><p class="rp-note">Employer note: skills-development, B-BBEE and WSP treatment depends on the applicable rules and your approved plan. Confirm eligibility with your skills development adviser; it is not an automatic claim or scorecard outcome.</p></div></section>
  <section class="cn-section" aria-labelledby="rpl-faq-title"><div class="container"><div class="cn-heading rp-faq-heading" data-cn-reveal><p class="eyebrow">FREQUENTLY ASKED</p><h2 id="rpl-faq-title">Questions we actually get asked.</h2></div><div class="rp-faq" id="rpl-faq">${faqs.map(([question, answer]) => `<details class="rp-faq-item" name="rpl-faq"><summary>${question}<span aria-hidden="true">+</span></summary><div>${answer}</div></details>`).join("")}</div></div></section>
  <section class="rp-dual-cta" aria-label="Get started"><div class="rp-cta-individual"><div data-cn-reveal><p class="eyebrow">FOR INDIVIDUALS · INCLUDING DRIVERS</p><h2>Find out if your experience qualifies.</h2><p>The eligibility screening is free and takes about 20 minutes. No obligation, no pressure — just an honest answer.</p><a class="btn btn-dark cn-secondary" href="/contact?path=rpl">Request an RPL assessment ${arrow}</a></div></div><div class="rp-cta-employer"><div data-cn-reveal><p class="eyebrow">FOR EMPLOYERS</p><h2>Sponsor a cohort.</h2><p>Turn your most experienced people — drivers, technicians, supervisors, professionals — into qualified, promotable staff.</p><a class="btn btn-primary" href="/contact?path=rpl-employer">Talk to us about group RPL ${arrow}</a></div></div></section>`;
}
