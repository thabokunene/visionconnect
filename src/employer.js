import { renderEmployerContent } from "./employer-content.js";
import { employerTitle, employerPath, scopeChoice } from "./employer-data.js";
import { validateEnquiry, enquiryLabels } from "./employer-schema.js";
import "./employer.css";
export function renderEmployer(main) {
  document.title = employerTitle;
  main.classList.add("employer-page");
  if (!main.querySelector("#em-title"))
    main.innerHTML = renderEmployerContent();
  const $ = (s) => main.querySelector(s);
  const $$ = (s) => [...main.querySelectorAll(s)];
  document
    .querySelectorAll(`a[href="${employerPath}"]`)
    .forEach((a) => a.setAttribute("aria-current", "page"));
  const form = $("#em-enquiry-form"),
    banner = $("#em-errors"),
    submit = $("#em-submit"),
    success = $("#em-success"),
    serviceStatus = $("#em-api-status");
  let config = null,
    sending = false,
    requestId = crypto.randomUUID();
  submit.hidden = false;
  function focusAt(el) {
    el.focus({ preventScroll: true });
    const header = document.querySelector(".site-header");
    window.scrollTo({
      top: Math.max(
        0,
        scrollY +
          el.getBoundingClientRect().top -
          (header?.getBoundingClientRect().height || 88) -
          22,
      ),
      behavior: "instant",
    });
  }
  function values() {
    const data = new FormData(form);
    return {
      ...Object.fromEntries(data),
      services: data.getAll("services"),
      consent: form.elements.consent.checked,
    };
  }
  function clearErrors() {
    banner.hidden = true;
    banner.replaceChildren();
    $$(".em-error").forEach((e) => (e.textContent = ""));
    $$("[aria-invalid]").forEach((e) => e.removeAttribute("aria-invalid"));
  }
  function errorState(
    errors = {},
    message = "Please check the highlighted fields.",
  ) {
    clearErrors();
    banner.hidden = false;
    const title = document.createElement("strong");
    title.textContent = message;
    banner.append(title);
    const list = document.createElement("ul");
    for (const [name, error] of Object.entries(errors)) {
      const controls = [...form.querySelectorAll(`[name="${name}"]`)];
      if (!controls.length) continue;
      controls.forEach((c) => {
        if (name !== "hp") c.setAttribute("aria-invalid", "true");
      });
      const inline = $(`#em-${name}-error`);
      if (inline) inline.textContent = error;
      if (name === "hp") continue;
      const li = document.createElement("li"),
        link = document.createElement("a");
      link.href = `#${controls[0].id || "em-enquiry-form"}`;
      link.textContent = `${enquiryLabels[name]}: ${error}`;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        focusAt(controls[0]);
      });
      li.append(link);
      list.append(li);
    }
    if (list.childNodes.length) banner.append(list);
    focusAt(banner);
  }
  for (const type of ["input", "change"])
    form.addEventListener(type, (event) => {
      const name = event.target.name;
      if (!name) return;
      requestId = crypto.randomUUID();
      const error = $(`#em-${name}-error`);
      if (error) error.textContent = "";
      form
        .querySelectorAll(`[name="${name}"]`)
        .forEach((c) => c.removeAttribute("aria-invalid"));
      banner.hidden = true;
    });
  $$("a[href^='#']").forEach((a) =>
    a.addEventListener("click", (event) => {
      const target = main.querySelector(a.getAttribute("href"));
      if (!target) return;
      if (a.hasAttribute("data-em-scope")) {
        const input = [...form.querySelectorAll('[name="services"]')].find(
          (c) => c.value === scopeChoice,
        );
        input.checked = true;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
      if (a.dataset.emService) {
        const input = [...form.querySelectorAll('[name="services"]')].find(
          (c) => c.value === a.dataset.emService,
        );
        if (input) {
          input.checked = true;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
      event.preventDefault();
      history.pushState(null, "", a.getAttribute("href"));
      focusAt(target.querySelector("h2") || target);
    }),
  );
  $$(".em-faq details").forEach((item) =>
    item.addEventListener("toggle", () => {
      if (item.open)
        $$(".em-faq details").forEach((other) => {
          if (other !== item) other.open = false;
        });
    }),
  );
  async function connect() {
    config = null;
    submit.disabled = true;
    try {
      const r = await fetch("/api/client-enquiry/config", {
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      if (!r.ok) throw new Error("Unavailable");
      const result = await r.json();
      if (
        !["test", "live"].includes(result.mode) ||
        typeof result.accepting !== "boolean"
      )
        throw new Error("Invalid configuration");
      config = result;
      serviceStatus.replaceChildren();
      const strong = document.createElement("strong");
      strong.textContent =
        result.mode === "test"
          ? "Test enquiry · fictional business and contact details only"
          : "Online client enquiry";
      const text =
        result.mode === "test"
          ? "The test server stores this enquiry but does not notify a consultant or start an engagement. Live intake and the privacy notice still need approval."
          : "A receipt confirms server storage. Availability, scope, costs and response timing must be agreed with the team.";
      serviceStatus.append(strong, document.createTextNode(text));
      if (!result.accepting)
        serviceStatus.append(
          document.createTextNode(
            " Online enquiries are currently closed. Call reception for assistance.",
          ),
        );
      submit.disabled = !result.accepting;
      submit.textContent =
        result.mode === "test" ? "Send test enquiry →" : "Send my enquiry →";
    } catch {
      serviceStatus.textContent =
        "The enquiry service is unavailable. No enquiry has been sent. Your answers remain on this page only. Call +27 11 451 9898 or retry the connection. ";
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "em-text-button";
      retry.textContent = "Retry connection";
      retry.addEventListener("click", connect);
      serviceStatus.append(retry);
    }
  }
  connect();
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;
    const raw = values();
    if (raw.hp)
      return errorState(
        {},
        "This enquiry could not be accepted. Leave the extra field blank, or call reception.",
      );
    const { data, errors } = validateEnquiry(raw);
    if (Object.keys(errors).length) return errorState(errors);
    if (!config?.accepting)
      return errorState(
        {},
        "Online enquiries are unavailable. Nothing has been sent. Retry the connection or contact reception.",
      );
    clearErrors();
    sending = true;
    submit.disabled = true;
    submit.textContent = "Sending… keep this page open";
    form.inert = true;
    form.setAttribute("aria-busy", "true");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch("/api/client-enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": requestId,
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      const receipt = await response.json();
      if (!response.ok) {
        form.inert = false;
        errorState(
          receipt.errors || {},
          receipt.error || "Receipt could not be confirmed. Please retry.",
        );
        return;
      }
      if (
        !/^ENQ-[A-F0-9]{12}$/.test(receipt.reference || "") ||
        !["test", "live"].includes(receipt.mode)
      )
        throw new Error("Invalid receipt");
      $("#em-reference").textContent = receipt.reference;
      $("#em-success-mode").textContent =
        receipt.mode === "test"
          ? "TEST RECEIPT · NOT A LIVE CLIENT ENQUIRY"
          : "CLIENT ENQUIRY RECEIVED";
      $("#em-success-title").textContent =
        receipt.mode === "test" ? "Test enquiry stored." : "Enquiry received.";
      $("#em-success-body").textContent =
        receipt.mode === "test"
          ? "The server accepted and stored your test enquiry. No consultant has been notified, no call is booked and no live engagement has begun. Keep this reference for testing."
          : "The server accepted and stored your enquiry. Keep the reference for follow-up. If it is urgent, call reception to ask about availability and timing.";
      form.hidden = true;
      success.hidden = false;
      focusAt($("#em-success-title"));
      // Clear personal values only after an accepted response. No local/session storage is used.
      form.reset();
    } catch {
      form.inert = false;
      errorState(
        {},
        "Receipt could not be confirmed. Keep this page open and retry with the same answers. An unchanged retry uses the same request identifier to avoid a second stored enquiry.",
      );
    } finally {
      clearTimeout(timeout);
      sending = false;
      form.inert = false;
      form.removeAttribute("aria-busy");
      submit.disabled = !config?.accepting;
      submit.textContent =
        config?.mode === "test" ? "Send test enquiry →" : "Send my enquiry →";
    }
  });
  $("#em-copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($("#em-reference").textContent);
      $("#em-copy-status").textContent = "Reference copied.";
    } catch {
      $("#em-copy-status").textContent =
        "Copy unavailable. Select the reference above and copy it manually.";
    }
  });
  $("#em-new").addEventListener("click", () => {
    form.reset();
    clearErrors();
    success.hidden = true;
    form.hidden = false;
    requestId = crypto.randomUUID();
    $("#em-copy-status").textContent = "";
    focusAt($("#em-yourName"));
  });
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let observer;
  function revealAll() {
    main.classList.remove("em-motion");
    observer?.disconnect();
  }
  if (!motion.matches && "IntersectionObserver" in window) {
    main.classList.add("em-motion");
    observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("em-revealed");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.06 },
    );
    $$("[data-em-reveal]").forEach((el) => observer.observe(el));
    main.addEventListener("focusin", (event) =>
      event.target.closest("[data-em-reveal]")?.classList.add("em-revealed"),
    );
  }
  motion.addEventListener("change", (e) => {
    if (e.matches) revealAll();
  });
  // Deep links must never land on a hidden reveal target.
  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    if (target && main.contains(target))
      requestAnimationFrame(() => {
        target.classList.add("em-revealed");
        focusAt(target.querySelector("h2") || target);
      });
  }
}
