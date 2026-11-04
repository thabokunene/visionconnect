# Before this preview goes live

## Business and content approval

- [x] Add business-owner-confirmed company registration **K2016508305** to company facts, both footer variants and relevant legal drafts.
- [ ] Retain the supporting registry document and confirm any separate TES authority; company registration alone is not proof of TES registration, accreditation or Information Officer registration.
- [ ] Confirm founding year before including it.
- [ ] Verify current B-BBEE certificate/level before including a level or badge.
- [ ] Verify TETA provider/programme accreditation and SAQA pathway claims. Framework names on this preview do **not** imply accreditation.
- [ ] Verify headquarters, service areas, sector coverage and assessor network.
- [ ] Review all operational commitments with leadership, including permanent-placement preference, statutory benefits, verification, reporting and data protection. Copy was supplied by the user and is not an independent legal audit.
- [ ] Review the RPL statements and statutory/CCMA terminology with the appropriate qualified specialists.
- [x] Contact details supplied: `reception@citizenhc.co.za`, `+27 11 451 9898`, Block C, Stoneridge Office Park, 8 Greenstone Pl, Modderfontein, Johannesburg, Gauteng, 1609, South Africa.
- [ ] Test mailbox delivery and phone connectivity before launch.
- [ ] Verify the Google Maps address marker and directions reach the correct building/entrance in a production browser. The map provider is mocked in automated tests.
- [ ] Confirm retention/placement data before adding performance figures. No estimated numbers in preview.

## Real people and images

- [ ] Supply a genuine team/depot hero photograph with consent. Use the supplied descriptive alt text only if it accurately describes that photograph.
- [ ] Supply real names, roles, credentials, approved bios and consented portraits (or initials) before publishing leadership cards.
- [ ] Obtain consent and real attribution before adding the proposed personal pull-quote.
- [ ] Confirm active hiring and provide `/careers` content before including a careers block.

## Integration and deployment

- [ ] Review all populated pages before launch. Every linked internal route now has content, including a distinct Home, What We Do, Drivers, accommodation/proposal guides and three additional legal drafts. Content approval/indexing gates still apply.
- [ ] Publish legally reviewed Privacy Policy, POPIA Notice, PAIA Manual and Terms. Placeholder screens are not legal documents.
- [ ] Approve and operationalise the real test-only Driver and Employer APIs before live intake (see their detailed gates below). Contact prepares an email draft only; it does not submit or store data.
- [ ] Configure route fallback and HTTP not-found behavior on the chosen host.
- [ ] Confirm production origin and canonical URLs; verify route-specific social-sharing metadata after deployment. Generated service/legal/intake/resource documents have static metadata; other routes still rely on client-side updates.
- [ ] Final screen-reader review, actual device testing and business sign-off.

## Conferences and event catalogue

- [ ] Verify the supplied 26 years / 3,000+ total events / 70+ annual events / 10,000+ attendees and “nearly three decades” copy before publishing as business claims.
- [ ] Confirm the eight supplied conference titles, 2026–27 dates, locations and availability; update or retire records as events pass. The catalogue is static supplied content, not a live feed.
- [ ] Confirm the SPRING15 offer is active, which events it covers, validity/expiry and redemption process. Publish approved terms at `/terms`. The page displays the supplied promotion but cannot redeem a code or sell tickets.
- [ ] Supply approved programmes, precise venues, ticket details and a booking integration if required. Current detail pages offer an email enquiry, not online booking.
- [ ] Publish Hotel Offers and Code of Conduct pages before treating those navigation links as launch-ready.
- [ ] Provide actual business social profile URLs if social icons are desired; generic social-network homepages are not used as business profiles.

## Training courses

- [ ] Verify the supplied training headline claims: 26 years, 40+ titles, 250+ annual sessions and 10,000+ professionals trained.
- [ ] Confirm all 30 session records in `src/training-data.js`, including dates, delivery formats, locations and availability. This is a static supplied schedule, not a live booking feed.
- [ ] Confirm featured course durations against individual deliveries: some supplied date ranges differ from the featured-card duration. Date ranges are preserved as supplied, not silently corrected.
- [ ] Supply approved outlines, facilitators, fees, exact venues and any booking integration before promoting full course-detail/booking pages. Preview details offer enquiries only.
- [ ] Provide session dates for the two Operations courses if scheduled; no dates are invented for those titles.
- [ ] Confirm the date-aware policy (Johannesburg time, retain through end date, label ongoing sessions, then remove) and keep future dates current.
- [ ] Confirm SPRING15 eligibility for training and publish approved terms before launch. No coupon redemption or online payment is implemented.

## Audience Marketing and sponsorship

- [ ] Verify the supplied 26 years / 50+ annual events / 70+ sessions per year / 10,000+ past attendees / seven sectors. Align annual conference, event and session definitions with the other marketing pages.
- [ ] Verify the supplied sponsor testimonial, claimed converted contracts and role/organisation attribution; obtain explicit permission to publish. No additional personal attribution is invented.
- [ ] Confirm ownership and delivery for the newly supplied `sponsorship@citizenhc.co.za`. Confirmed main reception details are retained, not replaced.
- [ ] Approve sponsorship, exhibition and speaking availability, formats, proposal process, packs and pricing. This preview does not create bookings or sell packages.
- [ ] Approve the email-draft-only enquiry handoff or provide a secure, POPIA-reviewed submission backend with real delivery/error handling. The website never claims receipt or promises a one-business-day response. Check draft length/client compatibility and the direct-email fallback on actual devices.
- [ ] Publish the legally reviewed POPIA Notice linked from consent, along with privacy/terms documents. The current substantive legal drafts are not adopted legal notices. Review response consent wording, email handling and retention before launch.
- [ ] Confirm SPRING15 applicability to sponsorship, eligibility/expiry and terms; the shared banner is supplied promotional content, not a coupon redemption integration.

## Multi-sector Recognition of Prior Learning

- [ ] Verify the 1,200+ qualifications-awarded claim, ten-sector programme scope and NQF 3–6 offering. Current supplied card examples only span NQF 3–5; no level-6 record has been invented.
- [ ] Verify each of the 25 supplied qualification titles and NQF levels against current SAQA registrations, registration/teach-out status, awarding arrangements and the provider's actual accreditation scope. The list remains illustrative until confirmed.
- [ ] Review health, nursing, emergency care, engineering and other regulated pathways with the appropriate accredited providers/regulators. Confirm professional registration and licence-to-practise requirements; RPL is not represented as automatically granting these rights.
- [ ] Confirm free eligibility screening, the approximately 20-minute screening time, indicative 8–14 weeks, 4–8-week portfolio phase, 4–6-hour weekly commitment, coaching availability, assessment/moderation process and realistic certificate turnaround. No award or completion date is guaranteed.
- [ ] Confirm pathway-specific entry requirements and alternative evidence policies. The preview avoids a blanket guarantee that no matric is required.
- [ ] Approve per-candidate quotes, group rates for cohorts of five or more and reassessment/further-learning costs. No online payment or assessment booking is implemented.
- [ ] Review all B-BBEE, WSP and skills-development treatment with a qualified adviser. Preview wording is conditional, not an automatic claim, saving or scorecard promise.
- [ ] Establish an approved secure evidence-collection, storage, retention and access process before requesting IDs, employment records, clinical/client material or other personal evidence. No document uploads or sensitive records are requested in the initial enquiry.
- [ ] Serve `dist/services/rpl/index.html` at `/services/rpl` or its trailing-slash equivalent before the generic SPA fallback. Verify static cards, canonical, description and OG metadata in the production HTTP response with JavaScript disabled.

## External HR Management

- [ ] Approve the supplied service scope: nine functional roles, all four service domains, named consultant, national coverage, monthly reporting, quarterly health checks and handover process. Role cards describe functions, not nine named staff or verified credentials.
- [ ] Confirm indicative R4,500 monthly pricing for up to 40 staff, typical 15–200-staff client range, VAT treatment, no-setup-fee/no-minimum-term wording, retainer limits, hours bank, exclusions and project/specialist fees. Publish approved quote/engagement terms.
- [ ] Resolve and approve the response-target distinctions: 48-hour CCMA matter response versus critical 4-working-hour, urgent one-business-day and standard three-business-day consultant assignment. Define working hours, retained-client eligibility, capacity, escalation and exclusions; no resolution time or response to website enquiries is promised.
- [ ] Confirm the ten-business-day start-up target from scope agreement and 15-minute scoping-call offer. Contact links prepare email enquiries; no call or consultant is booked automatically.
- [ ] Verify CCMA/bargaining council representation eligibility, practitioner competence, chair independence and current EE/WSP/ATR/POPIA/B-BBEE scope with qualified specialists. No case outcome or compliance certification is guaranteed.
- [ ] Verify the supplied HR Practice Lead statement, attribution and publication permission; no additional personal attribution is invented.
- [ ] Review all six health-check questions, gap prompts and scoring with an HR/legal specialist before launch. The check is not an audit: EE “Not required” is excluded; WSP/ATR “Not sure” remains a review gap. No answers are sent or persisted by the website.
- [ ] Establish the secure employee-record/payroll/case-document collection, access, transfer and retention process before onboarding. The initial website/email enquiry expressly requests no sensitive records.
- [ ] Verify static service HTML and metadata at `/services/external-hr-management` in production before applying the generic SPA fallback. Check no-JavaScript service/FAQ fallbacks, keyboard tabs/radios and actual devices.

## Driver Recruitment & Labour Broking

- [ ] Business owner approves six-check workflow, evidence actually available for each area, registered/appropriate criminal-record provider, recency, reference permissions, and practical-assessment qualifications. Do not label uncompleted or inapplicable checks “passed”. Confirm actual licence classes and PrDP requirements per vehicle/route; legacy Code 8/10/14 names are enquiry labels, not sufficient entitlement proof.
- [ ] Approve lawful criminal-record screening, fair role-relevant decisions, special personal information handling, medical fitness minimisation, candidate notification/consent, retention, secure transfer and recipient access controls under POPIA. The current public dossier is fictional and marked as such; never replace it with a real candidate without documented lawful authority and publication consent.
- [ ] Confirm evidence summaries and secure delivery process before claiming they accompany every shortlist. No sensitive record collection or automatic document delivery is connected on this site.
- [ ] Validate 2,400+ placements, 96% shift-fill and 18-day average against auditable records, definitions and reporting period before adding them. These original template statistics are deliberately withheld; no animated performance count is fabricated.
- [ ] Approve the proposed 30-day replacement period, eligibility, exclusions, notice, fee trigger, refund position, candidate availability and TES replacement charges in signed terms. Do not promise lifetime/unconditional/free replacements or “everything included”.
- [ ] Confirm rate basis (annual CTC percentage or hourly/monthly), VAT, statutory components, bargaining-council obligations, overtime/public holidays, allowances, travel, checks, minimum billing, cancellations and any volume terms. No numeric price is invented.
- [ ] South African labour-law review of LRA sections 198/198A, applicable earnings threshold, genuinely temporary work, duration/deeming provisions, equal treatment, client/joint liability, fair procedures and occupational safety. Do not publish the template’s categorical “TES, not client, employs” or full risk-transfer claim without qualification. Confirm Citizen’s ability and registrations to deliver the proposed TES service.
- [ ] Validate four-province and cross-border capabilities, permits, evaluator access and staffing before confirming site coverage. Approve indicative single 5–10 and bulk 10–20 business-day plans; verification completeness overrides these targets. No one-business-day website response guarantee is published.
- [ ] Approve employer email-draft copy and driver-application wording. Employer service CTAs to /contact remain email-draft-only; /employers and /apply have real test intake, but live processing and placement promises remain gated.
- [ ] Verify deployed canonical/trailing-slash Driver URL serves its pre-rendered document ahead of SPA fallback, including metadata, no-JS content, independent mobile table scrolling, FAQ keyboard operation and local fonts.

## POPIA Notice — draft, not ready for adoption/indexing

- [ ] Obtain authorised business and South African legal approval for the section 18 notice and processing inventory. The supplied v1.2 / 1 November 2026 date is only a proposed draft date. Confirm real adoption, effective date and version history; do not auto-generate a review date.
- [x] Include company registration **K2016508305**, confirmed by the business owner; no placeholder registration is used.
- [ ] Confirm and publish the named Information Officer, registration and direct contact channel. Verify any Deputy Information Officer appointment and routing. `privacy@citizenhc.co.za` is not treated as a live monitored mailbox; current interim routing is confirmed reception, expressly not identified as the officer.
- [ ] Approve responsible-party/operator roles per service and the written operator agreements required for actual mandates. A client mandate does not automatically make Citizen the responsible party for employee records.
- [ ] Validate collected categories, sources, notices, compulsory/optional fields, consequences of non-supply, recipients, lawful bases and actual onboarding processes. The current site prepares email drafts and has no upload, checkout or applicant submission backend.
- [ ] Review sections 11, 14, 18–24, 26–35, 55–56, 69, 71–72 and applicable regulations against current law. Confirm special-information authorisations, health-data restrictions, criminal-check fairness, children’s-data handling and any prior authorisation requirements; do not assume general consent legitimises every activity.
- [ ] Approve the proposed retention table against actual records, statutory triggers, council/accreditation rules, legal holds and backup/provider deletion practices. Do not describe every proposed five-year period as a statutory minimum. No current analytics integration supports a 26-month analytics-retention claim.
- [ ] Identify all providers, countries, subprocessors, access controls and safeguards. Confirm section 72 basis for each transfer. Verify encryption, MFA, supplier contracts, access reviews and incident procedures before turning proposed safeguards into assurances.
- [ ] Approve access/correction/objection procedures, lawful fees, identity verification and timelines. The template's 30-calendar-day / 10-business-day targets and first-request-free policy are not asserted as law or adopted practice. Correct form labels: POPIA 1 objection, POPIA 2 correction/deletion, POPIA 5 complaint; distinguish PAIA access Form 2.
- [ ] Approve complaint acknowledgement/substantive-response targets and material-change/review commitments before promising them. Preserve the right to complain directly to the Regulator.
- [ ] Recheck https://inforegulator.org.za/contact-us/ and /popia-forms/ before publication. Current source lists the Woodmead address and POPIAComplaints@inforegulator.org.za, not the old details supplied in the template.
- [ ] Audit deployed hosting logs, embedded Google Maps, promo-dismissal sessionStorage and email-provider processing. No analytics, advertising pixels, cookie banner, preferences control or payment gateway are implemented in the current app; do not claim they exist. Update the notice before adding them.
- [ ] Review and adopt the substantive Privacy Policy, PAIA Manual and Terms drafts separately. Related links acknowledge draft—not adopted—status.
- [ ] Only after approval: replace draft/proposed wording with verified adopted facts and dates, remove the visible approval warning, and change `scripts/generate-popia.js` from `noindex, follow` to the approved indexing directive. Verify static/JS metadata stay aligned. Never remove the indexing gate alone.
- [ ] Verify deployed canonical/trailing-slash document before SPA fallback; check keyboard contents links, deep links/history, mobile scrolling, no-JS text, all twelve sections and A4 print/PDF with tables unclipped and contact details legible.

## Code of Conduct — approval and usable reporting are release gates

- [ ] Obtain leadership and South African employment/legal approval for the Code, actual scope and enforcement authority. Confirm the real version/effective date, communication/acknowledgement process, incorporation into agreements and ongoing review history. v1.4 / 1 November 2026 is explicitly proposed, not an assertion of adoption or review.
- [ ] Authorise the leadership letter and obtain a real signatory, title and publication consent. Current letter is labelled proposed/unsigned; no name, CEO attribution, signature or invented initials-based identity is shown.
- [ ] Confirm four values and practical commitments against the approved brand/policy position. Avoid implying proven compliance, registration or accreditation merely from the wording of a value.
- [ ] Confirm named Ethics Contact, independence/conflict routing, actual monitored mailbox and business telephone coverage before publishing those as reporting channels. Current reception routing is a shared business contact, **not** a confidential or independent ethics service. Do not solicit allegations/evidence there without assessing privacy and safety.
- [ ] Commission and verify any independent whistleblowing provider before adding a hotline, portal or anonymity promise: ownership, availability, accessibility, toll-free status, handling languages, reference/follow-up process, recipient independence, security, retention, privacy notice and test report workflow. The template's ethics inbox, whistleblowing URL and dummy telephone are not live links. Pending card deliberately says the service is not confirmed/available here.
- [ ] Approve non-retaliation policy, protected-disclosure treatment, safeguarding steps, conflict-independent escalation and consequences for retaliation. A report not proved is not automatically dishonest. Never promise absolute confidentiality or anonymity via shared email. Preserve appropriate external routes and no internal-exhaustion prerequisite where law permits.
- [ ] Assign owners and validate the proposed three-business-day acknowledgement / five-business-day assessment targets. Confirm actual support/EAP arrangements before promising counselling. Current targets and support are expressly unconfirmed; this is not an emergency response service.
- [ ] Review driver safety, fatigue/impairment, medication privacy, accident duties, unsafe-work refusal, permanent-placement versus TES employment authority, site duties and applicable laws/agreements. Keep safe stopping/reporting guidance; do not prescribe identical automatic penalties for different safety allegations.
- [ ] Approve the proposed R500 gift threshold, aggregation/context rules, decision authority and gift-register owner/review process. The figure is not a legal safe harbour or current permission. Confirm anti-bribery/PRECCA and any engagement-specific foreign-law duties.
- [ ] Approve harassment/discrimination handling, reasonable accommodation, impartial investigation, support and sharing limits. Avoid treating every allegation as established or every disagreement as harassment.
- [ ] Approve the five-tier response table and fair procedures. No automatic dismissal for alleged crime/retaliation, no predetermined guilt, and no claimed disciplinary authority over non-employees. Confirm representation, internal appeals, contracts and statutory remedies.
- [ ] Confirm lawful confidentiality/retention practices; preserve protected disclosures and evidence. Draft POPIA retention text is not an approved destruction instruction. Do not cross-reference a fabricated clause in unapproved draft Terms.
- [ ] Keep related-document status accurate. `/terms`, `/privacy-policy`, `/paia-manual` and POPIA are all substantive drafts for approval. Do not describe an adopted legal pack as complete.
- [ ] Only after sign-off and verified reporting arrangements: replace proposed/pending statements with evidenced adopted facts, update the visible version status, and change `scripts/generate-conduct.js` from `noindex, follow` to the approved indexing directive. Do not remove noindex alone.
- [ ] Verify deployed canonical/trailing/query routes before SPA fallback, all fifteen native anchors, desktop active/sticky contents at short heights, keyboard focus, mobile reading/table scroll, no-JS contact links, print output and all Speak Up details on paper as well as screen.

## Driver application release gates

- [ ] `/apply` is currently **test-only/noindex**. Do not route real candidates into it or remove the warning until the following controls are approved and verified.
- [ ] Adopt the privacy notice and specific recruitment/medical-document processing basis, notification, employer-sharing process and separate marketing permission wording. Update the application’s draft/test copy and FAQs together; an environment notice-version value is not legal approval.
- [ ] Confirm identity and medical-data necessity, minimum collection, licence/PrDP requirements, lawful verification and secure assisted alternatives for applicants without SA IDs. No inferred compliance badge or invented review SLA.
- [ ] Deploy the single-instance API behind same-origin HTTPS, private API port, exact origin/proxy configuration and upstream body/time/concurrency/rate limits. Static-only deployment cannot receive applications.
- [ ] Store data outside the web root/repository, restrict host access, provision production encryption secret through a secret manager, verify encrypted backups/recovery and key rotation/migration. Test keys must not be used live.
- [ ] Install and verify a ClamAV-compatible scanner, update signatures, exercise infected-file/timeout/unavailable-scanner rejection and private temporary-file cleanup. Test mode bypasses scanning and must contain fictional data only.
- [ ] Establish authorised staff access, review ownership and daily monitoring/notification. There is no staff web dashboard, SSO, notification delivery or automated candidate update service yet; host-only management must not be mistaken for these.
- [ ] Approve retention days, run/schedule and monitor the explicit purge utility, handle exports/backups/legal holds separately, test correction/deletion requests and secure identity verification. Browser draft expiration is checked on visit, not guaranteed seven-day background erasure.
- [ ] Review and test OS/host auditing and the management utility’s export/list/delete controls; primary-store deletion does not delete backups or decrypted exports. Establish breach and incident response.
- [ ] Load/security-test bounded in-memory uploads and denial-of-service controls. Do not scale to multiple processes/instances without transactional idempotency and a production storage design.
- [ ] Confirm secure assistance process using +27 11 451 9898 / reception@citizenhc.co.za. No WhatsApp number is verified; never add the supplied dummy number.
- [ ] Confirm what counts as a duplicate/reapplication and how applicants securely update profiles. Current retry dedup is request-specific; device receipt is not an ID lookup. No six-month restriction is asserted.
- [ ] Run backend integration, full browser regression, Android/slow-connection and real deployment receipt/retry/upload tests. Recheck screen readers and document previews on actual phones; Office files require a document viewer.

## For Employers release gates

- [ ] `/employers` currently has a real **test-only** enquiry API and remains noindex. Use fictional business/contact details; do not treat a test receipt as delivery to the client team.
- [ ] Validate placements, fill rates, client-size claims and response SLAs from auditable records before publishing the supplied metrics. The current band uses page facts, not unverified performance figures.
- [ ] Obtain the real source, approved attribution and publication permission for any client testimonial. The supplied anonymous MD growth story is withheld; the page uses an unquoted accountability/evidence panel instead.
- [ ] Approve all four service scopes, indicative timelines, rate structures, CCMA representation eligibility, geography, sector capability and consultant capacity. CPD’s dedicated overview is now implemented; confirm the actual programme availability and scope before approval.
- [ ] Confirm qualification/provider authority, CPD recognition and applicable B-BBEE/WSP/ATR conditions. No award, claim acceptance, compliance/audit outcome, promotion or retention result is guaranteed by the comparison.
- [ ] Agree business enquiry response/quote timing and consultant ownership. There is no one-day SLA, automatic calendar booking, CRM queue or staff notification service. Establish and test a monitored review workflow before live intake.
- [ ] Adopt the privacy notice and short-enquiry purpose, permission wording, record/access/retention arrangements and controller/operator roles. No acceptance of unapproved draft Terms is required; approve and publish applicable terms before contracting.
- [ ] Configure `ENQUIRIES_ENABLED=true` only after live approval and the shared API security/deployment gates. Driver and enquiry enable flags are independent; production must use the protected shared storage/key, HTTPS origin and trusted proxy configuration.
- [ ] Approve **ENQUIRY_RETENTION_DAYS** separately from driver retention; host purge skips employer records without it. Include exports, backups, holds, correction/deletion and host audit procedures.
- [ ] Recheck reception phone/email and assistance process. No verified `clients@`, WhatsApp number, opening hours or dummy company registration is published here.
- [ ] Confirm Contact’s actual behaviour remains accurately described: `/contact?path=employer` currently prepares an email draft, not a full four-step online intake. Training Proposal and remaining legal documents are not silently completed by this page; CPD now has a separate overview.
- [ ] Verify employer JSON payload limits, origin checks, rate/concurrency controls, safe error handling, durable storage, lost-response retries, private exports/deletion, Android/slow-network use, screen readers, no-JS content and full-site regression before launch.

## Services and Insights review gates

- [ ] Review `/services`, `/services/cpd`, `/insights` and all six `/insights/{slug}` guides. They are complete review pages, not permission to publish unapproved business/editorial claims.
- [ ] Confirm current professional-development formats, programme/provider authority, capacity, fees, delivery terms, evidence, accessibility and cancellation arrangements. Add CPD points or professional-body recognition only for a verified specific programme; do not imply blanket accreditation, B-BBEE/claim acceptance, a qualification award or guaranteed workplace results.
- [ ] Approve or revise all six original guides as general guidance. They are visibly labelled editorial drafts, not previously published news, adopted company policy or case-specific legal advice. Do not add invented authors/dates; obtain real author approval before adding attribution and record an actual publication/review date when published.
- [ ] Confirm the Contact handoff remains an email draft, not a submitted enquiry/booking. Search/filter performs local text matching only and needs no subscription, analytics or personal-data collection.
- [ ] Test native article contents/keyboard focus, screen-reader announcements, print/PDF, all six topic filters, search empty/reset/URL history, 320px mobile and no-JavaScript reading on real devices/assistive technology.
- [ ] Review and approve content before changing `scripts/generate-resources.js` from `noindex, follow`. Keep employer/driver intake and legal approvals independent; removing the resource noindex does not make those operationally ready.
- [ ] Deploy all nine generated resource documents before SPA fallback, verify canonical/slash/query routes and static social metadata, and return actual HTTP 404s for unknown article paths.

## Previously empty routes and link audit

- [ ] Approve Home, What We Do, Drivers and training-proposal content. Confirm actual service/programme capacity and candidate assistance, without turning test intake into a live recruitment promise.
- [ ] Accommodation is currently guidance only. Publish a real hotel offer only after verifying the provider, venue, availability, rates/tax, cancellation/refund responsibility and booking/payment route. Do not infer a partner or discounted rate from the historical `/events/hotel-offers` path.
- [ ] Review all Privacy Policy, PAIA Manual and Terms sections with the business and legal owners. Complete actual entity/Information Officer details, statutory record schedules, prescribed request/fee/review procedures, provider flows, retention and the service-specific approved contract. The PAIA access guide is not proof of statutory compliance; the draft Terms are not a browsing/enquiry contract.
- [ ] Confirm SPRING15 eligibility, validity and exclusions before public promotion. The existing banner now links directly to the draft confirmation guidance, not an invented adopted promotion agreement.
- [ ] Keep all new pages `noindex, follow` until their separate approvals. Do not remove the driver/employer test-only or legal-draft gates merely because no linked page is empty.
- [ ] Build and verify `dist/index.html` is Home, `/about` is the full preserved story, and legacy About aliases resolve. Deploy all generated index documents before fallback, strip Home’s scoped classes for other client-rendered routes and configure actual HTTP 404s for unknown pages.
- [ ] Run `npm run audit:links` against development and `AUDIT_BASE_URL=...` production preview. Check reported external links separately in a network-enabled production browser. Re-run after content or navigation changes, including query handoffs and cross-page fragments.
- [ ] Finish manual screen-reader and real-device testing. Automated accessibility, responsive checks and a clean internal crawl do not certify the site legally or operationally launch-ready.
