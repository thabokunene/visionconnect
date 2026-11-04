import { companyRegistration } from "./company-data.js";
export const sitePageMeta = {
  "/": {
    title: "Citizen Human Capital | People. Capability. Progress.",
    description:
      "Driver recruitment, external HR management, qualifications and professional development for South African organisations. Find your next step with Citizen Human Capital.",
    nav: "/",
  },
  "/what-we-do": {
    title: "What We Do | Citizen Human Capital",
    description:
      "Explore Citizen conferences, training and audience marketing alongside workforce services. Choose the right route for your people, learning or business brief.",
    nav: "/what-we-do",
    menu: "what",
  },
  "/drivers": {
    title: "For Drivers | Citizen Human Capital",
    description:
      "Understand the driver recruitment journey, prepare for an application and find phone or email assistance. The online application currently accepts fictional test information only.",
    nav: "/drivers",
  },
  "/events/hotel-offers": {
    title: "Accommodation & Event Travel | Citizen Human Capital",
    description:
      "Plan accommodation and travel for a Citizen event. Confirm the venue, dates, accessibility and cancellation terms before booking; no negotiated hotel offers are currently verified.",
    nav: "/events",
    parent: true,
    menu: "events",
  },
  "/training-proposal": {
    title: "Plan a Training Proposal | Citizen Human Capital",
    description:
      "Prepare a useful learning brief: outcomes, audience, delivery, timing and evidence. Ask Citizen for a scoped proposal without an automatic booking or quote.",
    nav: "/what-we-do",
    parent: true,
    menu: "what",
  },
  "/privacy-policy": {
    title: "Privacy Policy — Draft | Citizen Human Capital",
    description:
      "Review draft privacy guidance covering website enquiries, test applications, information sharing, browser storage, retention and rights. Business and legal approval required.",
    legal: true,
  },
  "/paia-manual": {
    title: "PAIA Manual — Draft & Access Guide | Citizen Human Capital",
    description:
      "A draft PAIA manual and practical access-to-records guide: request preparation, record categories, identity, review and contact routing. Not an approved statutory manual.",
    legal: true,
  },
  "/terms": {
    title: "Terms of Engagement — Draft | Citizen Human Capital",
    description:
      "Draft engagement terms for review, covering scoping, fees, recruitment, learning, events, confidentiality and cancellation. No contract or booking is created by browsing.",
    legal: true,
  },
};
export const sitePaths = Object.keys(sitePageMeta);
const reception =
  '<a href="mailto:reception@citizenhc.co.za">reception@citizenhc.co.za</a>';
export const legalDrafts = {
  "/privacy-policy": {
    title: "Privacy Policy",
    lead: "Understand the information journey—not just the checkbox.",
    status:
      "Draft for business and legal review. This is not an adopted privacy policy. Production providers, retention schedules and Information Officer details require confirmation. Use fictional details in test intake.",
    sections: [
      [
        "privacy-scope",
        "Who and what this covers",
        `<p>Citizen Human Capital (Pty) Ltd provides recruitment, HR, qualification, professional-development and event services. This draft explains the website and initial contact journey. An engagement may need an additional collection notice, operator agreement or employment document. Read the <a href="/popia-notice">draft POPIA Notice</a> for the service-level detail.</p><p>The responsible party and any operator role depend on who determines the purpose and means of a particular activity. They must be identified in the actual engagement, not assumed from a service label. Company registration number: <strong>${companyRegistration}</strong>. The named Information Officer and their appointment/registration still require confirmation.</p>`,
      ],
      [
        "privacy-collection",
        "What the website collects",
        `<ul><li><strong>Contact:</strong> name, job title, company and email, with optional phone, topic and message. This form prepares an email in your email app. The website does not submit or store the form merely because you complete it.</li><li><strong>Employer enquiry:</strong> the separate test-only API accepts business/contact details, selected services, a situation summary, timeline and processing permission. A receipt confirms encrypted storage, not delivery to a consultant.</li><li><strong>Driver application:</strong> the test-only application includes application answers, permission and selected uploads. Use fictional records; do not upload a real ID, licence or medical document before live intake is approved.</li><li><strong>Technical information:</strong> hosting and network providers may handle IP addresses and request logs. Production providers and their logging/retention need confirmation.</li></ul><p>Do not include employee case files, medical histories or other sensitive records in a general enquiry. Ask for an agreed secure channel if later work requires them.</p>`,
      ],
      [
        "privacy-purposes",
        "Purpose and lawful processing",
        `<p>Enquiries are intended to help assess a request and respond. Later service delivery may require eligibility, verification, attendance, assessment, payroll or invoicing information. Explain the actual purpose, required/optional information and consequences at collection.</p><p>Identify the applicable lawful basis for each activity. Consent is not a substitute for an assessment of necessity or the additional safeguards for special personal information. A response-processing permission is not a marketing permission, nor permission to disclose an entire employee file.</p>`,
      ],
      [
        "privacy-sharing",
        "Sharing and service providers",
        `<p>Limit information to authorised recipients who need it for the agreed purpose. Potential recipients in an actual engagement may include a recruiting employer, verification provider, learning/assessment partner or technical operator. Agree roles, minimum data, security and any onward disclosure first.</p><p>Do not assume that submitting a test application distributes it to employers: no automatic placement, staff notification or candidate-sharing workflow is implemented here. Production processors, locations and cross-border safeguards must be confirmed before live use.</p>`,
      ],
      [
        "privacy-storage",
        "Browser storage, cookies and external services",
        `<p>No analytics, advertising tracking or payment integration is implemented in the application. Dismissing an event promotion uses session storage. The driver application can save an optional draft in local storage when you choose that feature; uploaded files are not part of that saved draft. Employer enquiry answers are not saved in browser storage.</p><p>Insights search uses query parameters in the URL, so a shared URL or browser history can retain those search words. Do not enter personal or confidential information into search. Contact embeds Google Maps; loading that external map involves Google services and their own privacy terms. Email, telephone and external links use the services you choose.</p><p>Test intake records are encrypted in a private server directory. This is not a claim of end-to-end encryption, a completed independent security audit or an approved live deployment.</p>`,
      ],
      [
        "privacy-retention",
        "Retention and protection",
        `<p>Keep records only for an identified lawful purpose and applicable requirements. Separate driver and employer retention periods require approval; there is no universal published period that applies to every record. Backups, exports, disputes and legal holds need their own controls.</p><p>Approved staff access, identity checks, incident response, deletion and backup procedures are operational release gates. A website draft does not demonstrate that those procedures are already adopted. Ask for the actual service-specific notice before providing real records.</p>`,
      ],
      [
        "privacy-rights",
        "Questions, access and correction",
        `<p>Ask about information held about you, correction, objection or deletion as applicable. The right and procedure depend on the context; a request does not automatically require deletion of a record that must lawfully be retained. Use the <a href="/paia-manual">draft PAIA access guide</a> for access-to-records preparation.</p><p>Start with ${reception} or <a href="tel:+27114519898">+27 11 451 9898</a> and ask for privacy routing. Reception is an interim contact, not a published appointment as Information Officer. Explain the request without emailing an ID copy unsolicited. Ask how identity can be verified safely.</p><p>You may also approach the <a href="https://inforegulator.org.za/contact-us/" target="_blank" rel="noopener noreferrer">Information Regulator (opens a new tab)</a> directly. You do not have to complain to Citizen first.</p>`,
      ],
      [
        "privacy-review",
        "Review before publication",
        `<p>Confirm the responsible contact, processors, data flows, security arrangements, retention schedules and request procedures before adopting this draft. Update this policy when actual processing changes, and record a genuine approval/version date rather than an invented effective date.</p>`,
      ],
    ],
  },
  "/paia-manual": {
    title: "PAIA Manual & Access Guide",
    lead: "A practical starting point for an access-to-records request.",
    status:
      "Draft manual for legal review—not an approved section 51 PAIA manual. Officer appointments, statutory record schedules, request fees and the final prescribed procedure require verification. Do not use this draft as proof of statutory compliance.",
    sections: [
      [
        "paia-purpose",
        "Purpose and scope",
        `<p>The Promotion of Access to Information Act (PAIA) provides a process for requesting access to records. Access to records of a private body depends on the applicable legal requirements, including the right being exercised or protected; it is not a general right to all commercial or personal information.</p><p>This draft helps prepare an enquiry to Citizen Human Capital (Pty) Ltd. It does not replace the Act, its regulations, the Information Regulator’s guidance or an approved manual. POPIA requests for correction or objection may follow a different procedure.</p>`,
      ],
      [
        "paia-contact",
        "Organisation and contact routing",
        `<p><strong>Organisation:</strong> Citizen Human Capital (Pty) Ltd. Company registration number: <strong>${companyRegistration}</strong>.</p><p><strong>Physical contact:</strong> Block C, Stoneridge Office Park, 8 Greenstone Pl, Modderfontein, Johannesburg, Gauteng, 1609, South Africa.</p><p><strong>Initial routing:</strong> ${reception} · <a href="tel:+27114519898">+27 11 451 9898</a>. Ask for the person responsible for PAIA requests and the approved manual. No named Information Officer, registration or deputy appointment is represented as confirmed here.</p>`,
      ],
      [
        "paia-records",
        "Records that may be relevant",
        `<p>The actual holdings and statutory record schedule must be confirmed. Depending on the engagement, relevant categories may include:</p><ul><li>Corporate, financial, supplier and client-engagement records.</li><li>Recruitment, application and role-verification records.</li><li>Employment, payroll or HR records, where Citizen actually holds them in the relevant capacity.</li><li>Learning enrolment, attendance, assessment and qualification-pathway records.</li><li>Event, sponsorship and correspondence records.</li></ul><p>A category is not a promise that a particular record exists or that access must be granted. A client may be the appropriate responsible body for records Citizen processes only under its instructions. Public website guides can be read without making a PAIA request.</p>`,
      ],
      [
        "paia-prepare",
        "Prepare a focused request",
        `<ol><li>Identify the record as precisely as possible: subject, relevant dates, service and any reference you already have.</li><li>Explain the right you seek to exercise or protect and why the requested record is needed, where applicable.</li><li>State whether you act for yourself or someone else, and the authority relied on.</li><li>Specify the format or access arrangement requested and any accessibility requirement.</li><li>Provide a safe reply route. Ask for the applicable prescribed PAIA request form, fees and secure identity-verification process.</li></ol><p>PAIA access Form 2 and POPIA correction/deletion Form 2 are different documents. Confirm that you are using the form for your actual request. Do not attach identity documents or another person’s records to an initial general email.</p>`,
      ],
      [
        "paia-process",
        "Assessment, fees and response",
        `<p>A request may require clarification, proportionate identity/authority checks, assessment of the relevant legal requirements, third-party consultation and any applicable fee procedure. Ask for the actual prescribed fees and payment instructions; no fee schedule or payment link is invented here.</p><p>Applicable statutory periods, lawful extensions and review rights govern. This draft does not promise same-day access or replace the required written decision. Access may be limited or refused on lawful grounds, including protections for personal information and other legally protected records. Ask for reasons and the applicable review route.</p>`,
      ],
      [
        "paia-review",
        "Guidance, complaints and review",
        `<p>Consult the <a href="https://inforegulator.org.za/" target="_blank" rel="noopener noreferrer">Information Regulator’s official website (opens a new tab)</a> for its PAIA guide, prescribed materials and current processes. Confirm deadlines and the correct complaint or court route promptly; this website is not legal advice.</p><p>For personal-information purposes and rights, also read the <a href="/popia-notice">draft POPIA Notice</a> and <a href="/privacy-policy">draft Privacy Policy</a>. You do not need to wait for an informal Citizen response before seeking independent advice or approaching the Regulator as permitted.</p>`,
      ],
      [
        "paia-adoption",
        "What must be completed for adoption",
        `<p>Verify entity and officer details; the schedule of records held under applicable legislation; available-without-request records; data-subject/recipient categories; cross-border flows and security descriptions; prescribed forms, fees and decision/review procedures; and how the approved manual is made available. Legal and operational owners must approve the final manual and record its actual review date.</p>`,
      ],
    ],
  },
  "/terms": {
    title: "Terms of Engagement",
    lead: "Agree the scope, the evidence and the responsibilities before work begins.",
    status:
      "Draft terms for business and legal review. These are proposed engagement principles, not adopted standard terms or a contract accepted by browsing, enquiry or test submission. Request an approved written agreement for the specific service before instructing work.",
    sections: [
      [
        "terms-scope",
        "Parties and written scope",
        `<p>Citizen Human Capital (Pty) Ltd and the client should identify the contracting parties and authorised representatives in writing. Citizen’s company registration number is <strong>${companyRegistration}</strong>. Any service-specific authority must still be verified before agreement.</p><p>The engagement should state the services, sites, deliverables, assumptions, exclusions, responsibilities, dates and acceptance evidence. A website description is an introduction, not a substitute for the agreed scope. A request for information or a test receipt does not appoint Citizen or reserve capacity.</p>`,
      ],
      [
        "terms-fees",
        "Fees, tax and payment",
        `<p>Request a written quotation stating the currency, applicable tax treatment, included work, expenses, payment milestones and quote validity. Agree any changes before additional work is undertaken. No price, deposit, interest rate or payment deadline is created by this draft.</p><p>Do not make payment based only on an unsolicited message. Confirm invoice details and any changed banking instructions through a trusted contact route. This website does not offer checkout or a payment gateway.</p>`,
      ],
      [
        "terms-recruitment",
        "Recruitment and temporary employment services",
        `<p>Distinguish permanent placement from labour broking / temporary employment services (TES). The agreement should identify the actual employer, site responsibilities, lawful checks, verification status, pay and time administration where applicable, and escalation responsibilities.</p><p>Any replacement arrangement, suitability criteria, service levels, insurance or site requirements must be expressly agreed. An application is not a job offer or a guarantee of placement. A document copy is not itself a completed verification, and an outstanding check must not be reported as passed.</p>`,
      ],
      [
        "terms-hr",
        "HR, qualification and learning work",
        `<p>Agree the HR mandate, decision-making authority, case information, confidentiality and evidence required. Advice or preparation does not guarantee a dispute, compliance or audit outcome. Representation depends on applicable rules and eligibility.</p><p>For RPL, identify the relevant qualification, provider/assessment requirements, candidate evidence, fees and decision authority. Experience alone does not guarantee an award. For training or CPD, confirm the programme, outcomes, facilitator, delivery, attendance/assessment evidence and any programme-specific recognition. Do not infer blanket accreditation, CPD points or B-BBEE/claim treatment from a service label.</p>`,
      ],
      [
        "terms-events",
        "Events, accommodation and changes",
        `<p>Confirm the event programme, date, venue, availability, fee and actual booking process with the team. A website enquiry is not a booking. Travel and accommodation should not be purchased on the assumption that an unconfirmed event or venue is fixed.</p><p>Agree substitutions, rescheduling, cancellations, refunds and any force-majeure arrangements in the approved booking terms. No cancellation percentage, hotel rate, partner benefit or blanket no-refund rule is asserted here. A third-party hotel contract is separate unless an actual written arrangement says otherwise.</p>`,
      ],
      [
        "promotions",
        "Promotions and offer confirmation",
        `<p>A promotional banner or code, including SPRING15 where displayed, is not proof that a particular event or course qualifies. Ask for written confirmation of eligibility, validity dates, exclusions, available places, the price before/after discount and whether offers may be combined.</p><p>No offer expiry date, minimum spend or automatic discount application is invented. Do not pay or arrange travel on the assumption that a code has been accepted. Confirm the applicable promotion terms with the events/training team.</p>`,
      ],
      [
        "terms-confidentiality",
        "Information, confidentiality and materials",
        `<p>Agree the purpose, authorised recipients, data-protection roles, secure channels, retention and any operator obligations before sharing confidential or personal records. Ask for review of any NDA; this draft is not evidence that mutual confidentiality terms have already been signed.</p><p>Agree ownership and permitted use of reports, training materials and client-supplied information. Do not publish candidate records, assessment evidence or another party’s confidential materials without authority. Statutory rights and lawful protected disclosures must not be overridden.</p>`,
      ],
      [
        "terms-changes",
        "Changes, concerns and ending work",
        `<p>Record approved scope changes, their fee/timing implications and the people authorised to instruct them. Agree proportionate escalation and termination arrangements, handover, outstanding payment and lawful records handling. Liability, indemnities and dispute terms need service-specific legal review; no blanket waiver of statutory rights is imposed here.</p><p>Raise a service concern through ${reception} or <a href="tel:+27114519898">+27 11 451 9898</a>. For conduct or personal-information concerns, see the <a href="/code-of-conduct">draft Code of Conduct</a> and <a href="/popia-notice">draft POPIA Notice</a>. This general contact is not an emergency, independent whistleblowing or privileged legal channel.</p>`,
      ],
    ],
  },
};
