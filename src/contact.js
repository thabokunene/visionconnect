import { courseTitles, sessions, formatDateRange } from "./training-data.js";
import { events } from "./events.js";

const address =
  "Block C, Stoneridge Office Park, 8 Greenstone Pl, Modderfontein, Johannesburg, Gauteng, 1609, South Africa";
const mapQuery = encodeURIComponent(address);
const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;
const arrow = '<svg aria-hidden="true"><use href="#arrow" /></svg>';
const icons = {
  email:
    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  phone: '<path d="m7 3 3 5-3 3c1 3 3 5 6 6l3-3 5 3-1 4C10 23 1 14 3 4z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
};
function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
}

export function renderContact(main) {
  document.title = "Contact Us | Citizen Human Capital | Johannesburg";
  main.innerHTML = `
    <section class="contact-hero" aria-labelledby="contact-title">
      <div class="container">
        <div class="breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>Contact us</span></div>
        <div class="contact-hero-inner">
          <div><p class="eyebrow"><span class="status-dot"></span> LET’S START A CONVERSATION</p>
            <h1 id="contact-title">Need to <br><span>talk to us?</span></h1>
            <p>Good partnerships start with a conversation. Tell us what you need — we’ll connect you with the right person.</p>
          </div>
          <div class="contact-hero-note"><span class="contact-hero-arrow" aria-hidden="true">${arrow}</span><span>Real people.<br>Practical answers.<br><strong>One accountable partner.</strong></span></div>
        </div>
        <div class="contact-hero-bottom"><span>RECRUITMENT / HR / QUALIFICATIONS</span><span>BASED IN JOHANNESBURG. BUILT AROUND PEOPLE.</span></div>
      </div>
    </section>
    <section class="contact-section" aria-labelledby="enquiry-title">
      <div class="container contact-grid">
        <aside class="contact-details" aria-labelledby="contact-details-title">
          <p class="eyebrow">A DIRECT LINE TO CITIZEN</p>
          <h2 id="contact-details-title">We’re here.<br><span class="muted">Let’s connect.</span></h2>
          <p class="contact-details-intro">Whether you’re building a workforce, looking for HR support or exploring a qualifications pathway, we’d like to hear from you.</p>
          <div class="contact-detail"><span class="contact-icon">${icon("email")}</span><div><h3>Email us</h3><a class="contact-value" href="mailto:reception@citizenhc.co.za">reception@citizenhc.co.za</a></div></div>
          <div class="contact-detail"><span class="contact-icon">${icon("phone")}</span><div><h3>Call us</h3><a class="contact-value" href="tel:+27114519898">+27 11 451 9898</a></div></div>
          <div class="contact-detail"><span class="contact-icon">${icon("pin")}</span><div><h3>Find us</h3><address>Block C, Stoneridge Office Park<br>8 Greenstone Pl, Modderfontein<br>Johannesburg, Gauteng, 1609<br>South Africa</address><a class="text-link contact-directions" href="${directionsUrl}" target="_blank" rel="noopener noreferrer">Get directions ${arrow}<span class="visually-hidden"> (opens Google Maps in a new tab)</span></a></div></div>
          <div class="contact-driver-note"><p class="eyebrow">LOOKING FOR YOUR NEXT OPPORTUNITY?</p><p>Put your experience to work.</p><a class="text-link" href="/apply">Driver application · test preview ${arrow}</a></div>
        </aside>
        <div class="contact-form-card">
          <div class="contact-form-heading"><span class="eyebrow">HOW CAN WE HELP?</span><h2 id="enquiry-title">Tell us a little about yourself.</h2><p>Fields marked “Required” are needed to prepare your enquiry.</p></div>
          <form class="intake-form contact-form" aria-labelledby="enquiry-title" aria-describedby="contact-form-notice">
            <div class="contact-form-fields">
              <label for="contact-name">Name <span>(Required)</span><input id="contact-name" name="name" autocomplete="name" maxlength="100" required></label>
              <label for="contact-job-title">Job title <span>(Required)</span><input id="contact-job-title" name="jobTitle" autocomplete="organization-title" maxlength="120" required></label>
              <label for="contact-email">Email <span>(Required)</span><input id="contact-email" name="email" type="email" autocomplete="email" maxlength="254" required></label>
              <label for="contact-phone">Phone <span>(Optional)</span><input id="contact-phone" name="phone" type="tel" autocomplete="tel" maxlength="50"></label>
              <label for="contact-company" class="field-full">Company <span>(Required)</span><input id="contact-company" name="company" autocomplete="organization" maxlength="180" required></label>
              <label for="contact-topic" class="field-full">I’m enquiring about <span>(Optional)</span><select id="contact-topic" name="topic"><option value="">Select a topic</option><option>Driver recruitment &amp; labour broking</option><option>HR support</option><option>Recognition of Prior Learning</option><option>Professional development</option><option>Training courses</option><option>Sponsorship &amp; audience marketing</option><option>Events &amp; conferences</option><option>General enquiry</option></select></label>
              <label for="contact-message" class="field-full">Message <span>(Optional)</span><textarea id="contact-message" name="message" rows="5" maxlength="3000" placeholder="Tell us what you have in mind…"></textarea></label>
            </div>
            <div class="contact-form-notice" id="contact-form-notice"><strong>A quick note before you send.</strong><p>This form prepares an email to reception@citizenhc.co.za. You’ll review and send it in your own email app. Nothing is sent or stored by this website. Please don’t include ID numbers, medical records or other sensitive documents.</p></div>
            <button type="submit" class="btn btn-primary">Prepare email enquiry ${arrow}</button>
            <div class="email-status" role="status" aria-live="polite"></div>
          </form>
        </div>
      </div>
    </section>
    <section class="contact-location" aria-labelledby="location-title">
      <div class="container">
        <div class="contact-location-heading"><div><p class="eyebrow">FIND YOUR WAY TO US</p><h2 id="location-title">Our corner of Johannesburg.</h2></div><a class="btn contact-map-link" href="${directionsUrl}" target="_blank" rel="noopener noreferrer">Get directions ${arrow}<span class="visually-hidden"> (opens Google Maps in a new tab)</span></a></div>
        <div class="contact-map-frame"><iframe title="Google Maps: Citizen Human Capital at Block C, Stoneridge Office Park, 8 Greenstone Pl, Modderfontein" src="https://maps.google.com/maps?q=${mapQuery}&amp;z=16&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
        <div class="contact-map-caption"><span>${icon("pin")} ${address}</span><span>Interactive map by Google Maps. If it doesn’t load, use “Get directions”.</span></div>
      </div>
    </section>`;

  const path = new URLSearchParams(location.search).get("path");
  const topics = {
    sponsorship: "Sponsorship & audience marketing",
    training: "Training courses",
    events: "Events & conferences",
    employer: "Driver recruitment & labour broking",
    hr: "HR support",
    "hr-urgent": "HR support",
    rpl: "Recognition of Prior Learning",
    "rpl-employer": "Recognition of Prior Learning",
    cpd: "Professional development",
  };
  if (topics[path]) main.querySelector("[name=topic]").value = topics[path];
  if (path === "employer")
    main.querySelector("[name=message]").value =
      "I would like to discuss driver recruitment. Role / licence code: [please complete]. Site / region: [please complete]. Headcount, shift cycle and preferred start date: [please complete]. Please confirm candidate availability, verification scope, permanent or TES terms and a written quote. I will not send candidate records or sensitive documents at this stage.";
  if (path === "hr")
    main.querySelector("[name=message]").value =
      "I'd like to discuss External HR Management and request a 15-minute scoping call. Please confirm availability, the appropriate engagement model and a written quote. I will not send employee records or case documents at this stage.";
  if (path === "hr-urgent") {
    main.querySelector("[name=message]").value =
      "I have a time-sensitive HR matter. Please confirm whether a consultant is available and the appropriate next steps. I understand that this email enquiry does not confirm an assignment, response time or booking. I will not send employee records or case documents at this stage.";
    const notice = document.createElement("p");
    notice.className = "contact-urgent-notice";
    notice.textContent =
      "Time-sensitive matter? Email enquiries do not confirm immediate support. Call to check availability: ";
    const phone = document.createElement("a");
    phone.href = "tel:+27114519898";
    phone.textContent = "+27 11 451 9898";
    notice.append(phone);
    main.querySelector(".contact-form-heading").append(notice);
  }
  if (path === "rpl-employer")
    main.querySelector("[name=message]").value =
      "I'm enquiring about sponsoring an RPL cohort for our employees. Please send me information about eligibility screening, qualification pathways and group rates. I will not send documents or sensitive personal information at this stage.";
  if (path === "rpl")
    main.querySelector("[name=message]").value =
      "I'd like to request a free RPL eligibility screening. Please let me know which qualification pathway may fit my work experience and how to arrange the screening. I will not send documents or sensitive personal information at this stage.";
  const event = events.find(
    (item) => item.slug === new URLSearchParams(location.search).get("event"),
  );
  if (path === "events" && event)
    main.querySelector("[name=message]").value =
      `I'm enquiring about ${event.title} (${event.date}, ${event.location}). Please send me the programme and booking information.`;

  const params = new URLSearchParams(location.search);
  const course = courseTitles.find(
    (item) => item.slug === params.get("course"),
  );
  const session =
    course &&
    sessions.find(
      (item) => item.id === params.get("session") && item.slug === course.slug,
    );
  if (path === "training" && course) {
    const selection = session
      ? ` (${formatDateRange(session.dateStart, session.dateEnd)}, ${session.location})`
      : "";
    main.querySelector("[name=message]").value =
      `I'm enquiring about ${course.title}${selection}. Please send me the course outline, fees and availability.`;
  }

  main.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const topic = data.get("topic") || "General enquiry";
    const subject = `Website enquiry: ${topic}`;
    const body = [
      `Name: ${data.get("name")}`,
      `Job title: ${data.get("jobTitle")}`,
      `Email: ${data.get("email")}`,
      `Phone: ${data.get("phone") || "Not provided"}`,
      `Company: ${data.get("company")}`,
      `I'm enquiring about: ${topic}`,
      "",
      String(data.get("message") || ""),
    ].join("\n");
    const status = main.querySelector(".email-status");
    status.textContent =
      "Your email draft is ready. Nothing has been sent yet. ";
    const link = document.createElement("a");
    link.href = `mailto:reception@citizenhc.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    link.textContent = "Open your email app to review and send →";
    status.append(link);
    link.focus();
  });
}
