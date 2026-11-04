import { companyRegistration } from "./company-data.js";
import { sectors, escapeHtml, arrow } from "./events.js";
import "./conferences.css";
const pagePath = "/what-we-do/conferences";

function footer() {
  const audience =
    location.pathname.replace(/\/$/, "") === "/what-we-do/audience-marketing";
  const training =
    location.pathname.startsWith("/training/") ||
    location.pathname.replace(/\/$/, "") === "/what-we-do/training-courses";
  const quickLinks = training || audience;
  const element = document.querySelector(".site-footer");
  element.classList.add("cn-footer");
  element.innerHTML = `<div class="container"><div class="cn-footer-grid">
    <div class="cn-footer-brand"><a class="logo" href="/" aria-label="Citizen Human Capital home"><svg aria-hidden="true"><use href="#mark"/></svg><span>CITIZEN <small>HUMAN CAPITAL</small></span></a><p>Human capital, handled. ${audience ? "Sponsorship, conferences, training" : training ? "Premium training, conferences" : "Conferences, training"}, recruitment, HR and qualification services for South African organisations and the people who power them.</p><a href="tel:+27114519898">+27 11 451 9898</a><a href="mailto:reception@citizenhc.co.za">reception@citizenhc.co.za</a>${audience ? '<a href="mailto:sponsorship@citizenhc.co.za">sponsorship@citizenhc.co.za</a>' : ""}<p>Block C, Stoneridge Office Park<br>8 Greenstone Pl, Modderfontein<br>Johannesburg, Gauteng, 1609</p></div>
    <div><h2 class="footer-heading">Events by sector</h2>${sectors.map((sector) => `<a href="/events/${sector.slug}">${escapeHtml(sector.label)}</a>`).join("")}</div>
    <div><h2 class="footer-heading">Our events</h2><a href="/events">All events</a><a href="${pagePath}">Conferences</a><a href="/what-we-do/training-courses">Training courses</a><a href="/what-we-do/audience-marketing">Audience marketing</a><a href="/events/hotel-offers">Accommodation &amp; travel guidance</a><a href="/training-proposal">Training proposal</a></div>
    <div><h2 class="footer-heading">Explore Citizen</h2><a href="/">Home</a><a href="/services">Services</a><a href="/drivers">For drivers</a><a href="/employers">For employers</a><a href="/insights">Insights</a><a href="/about">Our story</a><a href="/about#purpose">Our Purpose</a><a href="/about#team">Our Team</a><a href="/about#sustainability">Sustainability</a><a href="/contact">Contact us</a></div>
    ${quickLinks ? '<div><h2 class="footer-heading">Quick links</h2><a href="/services/driver-recruitment">Driver Recruitment</a><a href="/services/external-hr-management">HR Management</a><a href="/services/rpl">Recognition of Prior Learning</a><a href="/services/cpd">CPD Programmes</a><a href="/apply">Apply as a Driver</a></div>' : '<div><h2 class="footer-heading">Legal</h2><a href="/terms">Terms &amp; Conditions</a><a href="/code-of-conduct">Code of Conduct</a><a href="/privacy-policy">Privacy Policy</a><a href="/popia-notice">POPIA Notice</a><a href="/paia-manual">PAIA Manual</a></div>'}
    </div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Citizen Human Capital (Pty) Ltd.<br />Company registration: ${companyRegistration}</span>${quickLinks ? '<div><a href="/terms">Terms &amp; Conditions</a><a href="/code-of-conduct">Code of Conduct</a><a href="/privacy-policy">Privacy Policy</a></div>' : "<span>Human capital, handled.</span>"}<a href="#main" class="back-top">Back to top ↑</a></div></div>`;
}
export function activate({ preserveFooter = false } = {}) {
  document.body.classList.add("conference-route");
  document
    .querySelector(
      location.pathname.startsWith("/services/")
        ? '.desktop-nav > a[href="/services"]'
        : location.pathname.startsWith("/events")
          ? "#events-menu-trigger"
          : "#what-menu-trigger",
    )
    .setAttribute("aria-current", "true");
  if (!preserveFooter) footer();
  document
    .querySelectorAll(`a[href="${location.pathname.replace(/\/$/, "")}"]`)
    .forEach((link) => link.setAttribute("aria-current", "page"));
}
export function promo() {
  const banner = document.createElement("section");
  banner.className = "cn-promo";
  banner.setAttribute("aria-label", "Promotional offer");
  banner.innerHTML = `<div><span class="cn-promo-tag">SPRING SALE</span><p>Enjoy 15% off with promo code <strong>SPRING15</strong></p><a href="/terms#promotions">Confirm offer terms ${arrow}</a></div><button type="button" aria-label="Dismiss promotional banner"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button>`;
  document.querySelector(".site-header").before(banner);
  try {
    banner.hidden =
      sessionStorage.getItem("citizen-spring15-dismissed") === "1";
  } catch {
    /* Privacy modes can disable storage. */
  }
  banner.querySelector("button").addEventListener("click", () => {
    banner.hidden = true;
    try {
      sessionStorage.setItem("citizen-spring15-dismissed", "1");
    } catch {
      /* Dismissal still works for this page. */
    }
    document.querySelector(".site-header .logo").focus({ preventScroll: true });
  });
}
export function animations(root) {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  if (motion.matches || !("IntersectionObserver" in window)) return;
  const reveals = [...root.querySelectorAll("[data-cn-reveal]")];
  root.classList.add("cn-motion");
  const revealObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        }
      }),
    { threshold: 0.06 },
  );
  reveals.forEach((element) => revealObserver.observe(element));
  const frames = new Set();
  const countObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countObserver.unobserve(entry.target);
        const element = entry.target;
        const target = Number(element.dataset.count);
        let start;
        function tick(time) {
          if (motion.matches) {
            element.textContent =
              target.toLocaleString("en-US") + (element.dataset.suffix || "");
            return;
          }
          start ??= time;
          const progress = Math.min((time - start) / 1500, 1);
          element.textContent =
            Math.round(target * (1 - Math.pow(1 - progress, 3))).toLocaleString(
              "en-US",
            ) + (element.dataset.suffix || "");
          if (progress < 1) {
            const frame = requestAnimationFrame((next) => {
              frames.delete(frame);
              tick(next);
            });
            frames.add(frame);
          }
        }
        const frame = requestAnimationFrame((time) => {
          frames.delete(frame);
          tick(time);
        });
        frames.add(frame);
      }),
    { threshold: 0.3 },
  );
  root
    .querySelectorAll("[data-count]")
    .forEach((element) => countObserver.observe(element));
  motion.addEventListener("change", (event) => {
    if (!event.matches) return;
    root.classList.remove("cn-motion");
    revealObserver.disconnect();
    countObserver.disconnect();
    frames.forEach((frame) => cancelAnimationFrame(frame));
    frames.clear();
    root
      .querySelectorAll("[data-count]")
      .forEach(
        (element) =>
          (element.textContent =
            Number(element.dataset.count).toLocaleString("en-US") +
            (element.dataset.suffix || "")),
      );
  });
}
