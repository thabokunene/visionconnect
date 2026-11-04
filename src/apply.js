import { renderApplyContent, applyTitle } from "./apply-content.js";
import {
  documents,
  steps,
  fieldsByStep,
  labels,
  normalizeAnswers,
  validateAnswers,
  idBirthDate,
  fileError,
} from "./application-schema.js";
import "./apply.css";
const DRAFT = "chc.driver-draft.v1";
const RECEIPT = "chc.driver-receipt.v1";
const escape = (v) =>
  String(v)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
export function renderApply(main) {
  document.title = applyTitle;
  main.classList.add("apply-page");
  const header = document.querySelector(".site-header");
  if (header)
    new ResizeObserver(() =>
      main.style.setProperty(
        "--ap-header-height",
        `${header.getBoundingClientRect().height}px`,
      ),
    ).observe(header);
  if (!main.querySelector("#ap-form")) main.innerHTML = renderApplyContent();
  const $ = (s) => main.querySelector(s);
  const $$ = (s) => [...main.querySelectorAll(s)];
  const form = $("#ap-form");
  const progress = $(".ap-progress");
  const status = $("#ap-save-status");
  const optin = $("#ap-save-optin");
  const summary = $("#ap-error-summary");
  function focusAt(element) {
    element.focus({ preventScroll: true });
    const offset =
      (header?.getBoundingClientRect().height || 0) +
      (progress.hidden ? 0 : progress.getBoundingClientRect().height) +
      20;
    window.scrollTo({
      top: Math.max(
        0,
        window.scrollY + element.getBoundingClientRect().top - offset,
      ),
      behavior: "instant",
    });
  }

  let step = 0,
    furthest = 0,
    editing = false,
    timer,
    requestId = crypto.randomUUID(),
    config = null,
    submitting = false;
  let restoredFiles = {};
  const files = new Map();
  const urls = new Map();
  function readStorage(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      try {
        localStorage.removeItem(key);
      } catch {
        /* blocked storage */
      }
      status.textContent = "Saved data unavailable · continue without saving";
      return null;
    }
  }
  function removeStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      status.textContent =
        "Could not clear browser storage · use browser settings";
      return false;
    }
  }
  function answers() {
    const data = new FormData(form);
    const raw = Object.fromEntries(data);
    for (const key of ["vehicles", "routes", "preferredProvinces"])
      raw[key] = data.getAll(key);
    raw.processingConsent = form.elements.processingConsent.checked;
    raw.marketingConsent = form.elements.marketingConsent.checked;
    return normalizeAnswers(raw);
  }
  function save() {
    clearTimeout(timer);
    if (!optin.checked) return;
    try {
      // File bytes and processing/marketing permissions never persist in browser storage.
      const data = answers();
      data.processingConsent = false;
      data.marketingConsent = false;
      localStorage.setItem(
        DRAFT,
        JSON.stringify({
          version: 1,
          expires: Date.now() + 7 * 86400000,
          answers: data,
          step,
          furthest,
          requestId,
          files: {
            ...restoredFiles,
            ...Object.fromEntries(
              [...files].map(([key, f]) => [
                key,
                { name: f.name, size: f.size },
              ]),
            ),
          },
        }),
      );
      status.textContent = "Saved ✓ · answers only";
    } catch {
      status.textContent = "Not saved · browser storage blocked or full";
    }
  }
  function queueSave() {
    clearTimeout(timer);
    if (!optin.checked) {
      status.textContent = "Not saved on this device";
      return;
    }
    status.textContent = "Saving answers…";
    timer = setTimeout(save, 400);
  }
  function branches() {
    const a = answers();
    $("#ap-prdp-branch").hidden = a.prdp !== "Yes";
    form.elements.prdpExpiry.disabled = a.prdp !== "Yes";
    if (a.prdp !== "Yes") form.elements.prdpExpiry.value = "";
    $("#ap-prdp-note").hidden = !a.prdp || a.prdp === "Yes";
    const needsNotice =
      a.employment && a.employment !== "Available immediately";
    $("#ap-notice-branch").hidden = !needsNotice;
    form.elements.notice.disabled = !needsNotice;
    if (!needsNotice) form.elements.notice.value = "";
    $("#ap-work-note").hidden = a.rightToWork !== "No";
    const birth = idBirthDate(a.saId);
    $("#ap-dob").classList.toggle("ap-valid", !!birth);
    $("#ap-dob").textContent = birth
      ? `✓ Date of birth: ${new Date(`${birth}T12:00:00`).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}`
      : "Your date of birth will appear after a valid ID is entered.";
    $("#ap-expired-note").hidden =
      !a.licenceExpiry ||
      a.licenceExpiry >= new Date().toISOString().slice(0, 10);
  }
  function clearErrors() {
    summary.hidden = true;
    summary.replaceChildren();
    $$("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    $$(".ap-error:not([id^='ap-file-error-'])").forEach(
      (el) => (el.textContent = ""),
    );
  }
  function showErrors(errors, message = "Check the highlighted information.") {
    clearErrors();
    summary.hidden = false;
    const title = document.createElement("strong");
    title.textContent = message;
    summary.append(title);
    const list = document.createElement("ul");
    for (const [key, message] of Object.entries(errors)) {
      const field = $(`[data-field="${key}"]`);
      if (!field) continue;
      const error = $(`#ap-${key}-error`);
      if (error) error.textContent = message;
      const controls = field.querySelectorAll("input,select");
      controls.forEach((c) => c.setAttribute("aria-invalid", "true"));
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${controls[0]?.id || field.id}`;
      link.textContent = `${labels[key]}: ${message}`;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetStep = fieldsByStep.findIndex((s) => s.includes(key));
        if (targetStep >= 0 && targetStep !== step)
          showStep(targetStep, false, false);
        if (controls[0]) focusAt(controls[0]);
      });
      li.append(link);
      list.append(li);
    }
    if (list.childNodes.length) summary.append(list);
    focusAt(summary);
  }
  function review() {
    const a = answers();
    $("#ap-review").innerHTML = steps
      .slice(0, 4)
      .map((title, i) => {
        const rows =
          i === 2
            ? documents.map(([key, title]) => [
                title,
                files.has(key)
                  ? `${files.get(key).name} · ${(files.get(key).size / 1024).toFixed(0)} KB · attached for submission`
                  : restoredFiles[key]
                    ? `${restoredFiles[key].name} · NOT attached. Reselect file or supply later.`
                    : "Not attached · supply later if needed",
              ])
            : fieldsByStep[i]
                .filter(
                  (key) =>
                    !(key === "prdpExpiry" && a.prdp !== "Yes") &&
                    !(
                      key === "notice" &&
                      a.employment === "Available immediately"
                    ),
                )
                .map((key) => [
                  labels[key],
                  Array.isArray(a[key])
                    ? a[key].join(", ") || "Not specified"
                    : a[key] || "Not provided",
                ]);
        return `<section class="ap-review-section"><div class="ap-review-heading"><h3>${title}</h3><button type="button" class="ap-text-button" data-edit="${i}" aria-label="Edit ${escape(title)}">Edit ↗</button></div><dl>${rows.map(([label, value]) => `<div class="ap-review-row"><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join("")}</dl></section>`;
      })
      .join("");
    $$("[data-edit]").forEach((b) =>
      b.addEventListener("click", () => {
        editing = true;
        showStep(Number(b.dataset.edit));
      }),
    );
  }
  function showStep(next, focus = true, clear = true) {
    step = next;
    furthest = Math.max(furthest, step);
    if (clear) clearErrors();
    $$(".ap-panel").forEach((p, i) => (p.hidden = i !== step));
    $$("[data-progress]").forEach((b, i) => {
      b.disabled = i > furthest;
      b.parentElement.classList.toggle("ap-complete", i < step);
      b.querySelector(".ap-step-number").textContent =
        i < step ? "✓" : String(i + 1);
      if (i === step) b.setAttribute("aria-current", "step");
      else b.removeAttribute("aria-current");
    });
    $("#ap-progress-text").textContent =
      `Step ${step + 1} of 5 · ${(step + 1) * 20}% complete`;
    $$("[data-next]").forEach(
      (b) => (b.textContent = editing ? "Continue to review →" : "Continue →"),
    );
    if (step === 4) {
      editing = false;
      review();
    }
    branches();
    queueSave();
    if (focus) focusAt($(`#ap-heading-${step}`));
  }
  function nextStep() {
    const errors = validateAnswers(answers(), step);
    if (step === 2 && $$("[id^='ap-file-error-']").some((el) => el.textContent))
      return showErrors(
        {},
        "One or more files could not be attached. Choose another file, remove it, or select Skip uploads for now.",
      );
    if (Object.keys(errors).length) return showErrors(errors);
    showStep(editing ? 4 : step + 1);
  }
  $$("[data-next]").forEach((b) => b.addEventListener("click", nextStep));
  $$("[data-back]").forEach((b) =>
    b.addEventListener("click", () => {
      editing = false;
      showStep(Math.max(0, step - 1));
    }),
  );
  $$("[data-progress]").forEach((b) =>
    b.addEventListener("click", () => {
      editing = false;
      showStep(Number(b.dataset.progress));
    }),
  );
  function removeFile(key) {
    if (urls.has(key)) URL.revokeObjectURL(urls.get(key));
    urls.delete(key);
    files.delete(key);
    delete restoredFiles[key];
    const card = $(`[data-document="${key}"]`);
    card.querySelector("input").value = "";
    card.querySelector(".ap-file-info").replaceChildren();
    card.querySelector(".ap-file-preview").replaceChildren();
    card.querySelector(".ap-error").textContent = "";
  }
  function displayFile(key, file) {
    const card = $(`[data-document="${key}"]`);
    const info = card.querySelector(".ap-file-info");
    info.replaceChildren();
    const text = document.createElement("p");
    text.textContent = `${file.name} · ${(file.size / 1024).toFixed(0)} KB`;
    info.append(text);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "ap-text-button";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", `Remove ${file.name}`);
    remove.addEventListener("click", () => {
      removeFile(key);
      requestId = crypto.randomUUID();
      queueSave();
    });
    info.append(remove);
    const url = URL.createObjectURL(file);
    urls.set(key, url);
    const preview = document.createElement("button");
    preview.type = "button";
    preview.className = "ap-text-button";
    preview.textContent = "Preview file";
    preview.setAttribute("aria-label", `Preview ${file.name}`);
    info.append(preview);
    preview.addEventListener("click", () => {
      const box = card.querySelector(".ap-file-preview");
      if (box.childNodes.length) {
        box.replaceChildren();
        preview.textContent = "Preview file";
        return;
      }
      const ext = file.name.toLowerCase().split(".").pop();
      if (["jpg", "jpeg", "png"].includes(ext)) {
        const img = document.createElement("img");
        img.src = url;
        img.alt = `Preview of selected ${documents.find(([k]) => k === key)[1]}`;
        box.append(img);
      } else if (ext === "pdf") {
        const object = document.createElement("object");
        object.data = url;
        object.type = "application/pdf";
        object.setAttribute("aria-label", `PDF preview: ${file.name}`);
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = "Open selected PDF in a new tab";
        object.append(link);
        box.append(object);
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.textContent =
          "Download selected document to view in your document app";
        box.append(a);
      }
      preview.textContent = "Close preview";
    });
  }
  documents.forEach(([key]) => {
    $(`#ap-file-${key}`).addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) return;
      removeFile(key);
      const error = fileError(key, file);
      requestId = crypto.randomUUID();
      if (error) {
        const card = $(`[data-document="${key}"]`);
        card.querySelector(".ap-error").textContent = error;
        const dismiss = document.createElement("button");
        dismiss.type = "button";
        dismiss.className = "ap-text-button";
        dismiss.textContent = "Remove invalid selection";
        dismiss.addEventListener("click", () => {
          removeFile(key);
          queueSave();
        });
        card.querySelector(".ap-file-info").append(dismiss);
      } else {
        files.set(key, file);
        displayFile(key, file);
      }
      queueSave();
    });
  });
  $("[data-skip]").addEventListener("click", () => {
    if (
      files.size &&
      !confirm(
        "Skip uploads and remove all selected files from this application?",
      )
    )
      return;
    documents.forEach(([key]) => removeFile(key));
    requestId = crypto.randomUUID();
    showStep(editing ? 4 : 3);
  });
  optin.addEventListener("change", () => {
    if (!optin.checked) {
      clearTimeout(timer);
      removeStorage(DRAFT);
      status.textContent = "Not saved on this device";
    } else queueSave();
  });
  $("#ap-clear").addEventListener("click", () => {
    clearTimeout(timer);
    const cleared = removeStorage(DRAFT);
    optin.checked = false;
    if (cleared)
      status.textContent =
        "Saved draft cleared · current answers remain until you leave";
  });
  form.addEventListener("input", (event) => {
    if (event.target.name === "saId")
      event.target.value = event.target.value.replace(/\D/g, "").slice(0, 13);
    requestId = crypto.randomUUID();
    branches();
    queueSave();
  });
  form.addEventListener("change", (event) => {
    if (event.target.type !== "file") {
      branches();
      queueSave();
    }
  });
  window.addEventListener("pagehide", () => {
    if (!submitting && optin.checked) save();
  });
  function receiptView(receipt, existing = false) {
    form.hidden = true;
    progress.hidden = true;
    clearTimeout(timer);
    $("#ap-existing").hidden = !existing;
    $("#ap-success").hidden = existing;
    if (existing) {
      $("#ap-existing-reference").textContent =
        `${receipt.mode === "test" ? "TEST · " : ""}${receipt.reference}`;
      focusAt($("#ap-existing-title"));
    } else {
      $("#ap-reference").textContent = receipt.reference;
      $("#ap-receipt-mode").textContent =
        receipt.mode === "test"
          ? "TEST RECEIPT · NOT A LIVE APPLICATION"
          : "APPLICATION RECEIVED";
      $("#ap-success-title").textContent =
        receipt.mode === "test"
          ? "Test application stored."
          : "Application received.";
      $("#ap-success-description").textContent =
        receipt.mode === "test"
          ? "The test server accepted and stored this application and its attached files. This is not a live recruitment application. No placement process or team notification has been started."
          : "The application server accepted and stored your application and attached files. Keep your reference below. No placement is guaranteed.";
      focusAt($("#ap-success-title"));
    }
  }
  $("#ap-copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($("#ap-reference").textContent);
      $("#ap-copy-status").textContent = "Reference copied.";
    } catch {
      $("#ap-copy-status").textContent =
        "Copy unavailable. Select the reference above to copy it manually.";
    }
  });
  function reset() {
    if (
      !confirm(
        "Start a fresh application? Unsaved answers and selected files will be cleared. This does not delete anything already submitted to the server.",
      )
    )
      return;
    clearTimeout(timer);
    removeStorage(DRAFT);
    removeStorage(RECEIPT);
    form.reset();
    $$("[data-forget]").forEach((b) => {
      b.disabled = false;
      b.textContent = "Forget receipt on this device";
    });
    documents.forEach(([key]) => removeFile(key));
    restoredFiles = {};
    optin.checked = false;
    step = 0;
    furthest = 0;
    editing = false;
    requestId = crypto.randomUUID();
    $("#ap-existing").hidden = true;
    $("#ap-success").hidden = true;
    $("#ap-copy-status").textContent = "";
    form.hidden = false;
    progress.hidden = false;
    status.textContent = "Not saved on this device";
    showStep(0);
  }
  $$("[data-new]").forEach((b) => b.addEventListener("click", reset));
  $$("[data-forget]").forEach((b) =>
    b.addEventListener("click", () => {
      if (removeStorage(RECEIPT)) {
        b.textContent = "Receipt removed from this device";
        b.disabled = true;
      }
    }),
  );
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;
    if (step !== 4) return nextStep();
    const data = answers();
    const errors = validateAnswers(data);
    if (Object.keys(errors).length)
      return showErrors(
        errors,
        "Review the application before submitting. Select an error to edit that section.",
      );
    if (!config?.accepting)
      return showErrors(
        {},
        "The application service is unavailable. Nothing has been submitted. Try again later or call reception.",
      );
    const payload = new FormData();
    payload.set("answers", JSON.stringify(data));
    for (const [key, f] of files) payload.append(key, f, f.name);
    submitting = true;
    form.setAttribute("aria-busy", "true");
    const button = $("#ap-submit");
    button.disabled = true;
    button.textContent = "Sending… keep this page open";
    form.inert = true;
    // No automatic retry. Reusing this key makes an explicit retry safe if the response is lost.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Idempotency-Key": requestId },
        body: payload,
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok) {
        form.inert = false;
        showErrors(
          result.errors || {},
          result.error || "Receipt could not be confirmed. Please retry.",
        );
        return;
      }
      if (
        !/^CHC-[A-F0-9]{12}$/.test(result.reference || "") ||
        !["test", "live"].includes(result.mode)
      )
        throw new Error("Invalid receipt");
      removeStorage(DRAFT);
      optin.checked = false;
      try {
        localStorage.setItem(
          RECEIPT,
          JSON.stringify({
            reference: result.reference,
            mode: result.mode,
            receivedAt: result.receivedAt,
          }),
        );
        status.textContent = "Receipt saved on this device";
      } catch {
        status.textContent = "Receipt not saved · copy your reference";
      }
      receiptView(result);
      documents.forEach(([key]) => removeFile(key));
      form.reset();
      restoredFiles = {};
    } catch {
      form.inert = false;
      showErrors(
        {},
        "Receipt could not be confirmed. Keep this page open and retry with the same answers and files. A retry uses the same request identifier to avoid a second stored application.",
      );
    } finally {
      clearTimeout(timeout);
      submitting = false;
      form.inert = false;
      form.removeAttribute("aria-busy");
      button.disabled = !config?.accepting;
      button.textContent =
        config?.mode === "test"
          ? "Submit test application →"
          : "Submit application →";
    }
  });
  // Restore only schema-known fields; permissions must always be chosen again.
  const draft = readStorage(DRAFT);
  if (draft) {
    if (
      draft.version === 1 &&
      draft.expires > Date.now() &&
      draft.expires <= Date.now() + 8 * 86400000 &&
      draft.answers &&
      typeof draft.answers === "object"
    ) {
      const a = normalizeAnswers(draft.answers);
      for (const [name, value] of Object.entries(a)) {
        if (["processingConsent", "marketingConsent"].includes(name)) continue;
        const elements = [...form.querySelectorAll(`[name="${name}"]`)];
        elements.forEach((el) => {
          if (["checkbox", "radio"].includes(el.type))
            el.checked = Array.isArray(value)
              ? value.includes(el.value)
              : value === el.value;
          else el.value = value;
        });
      }
      step = Number.isInteger(draft.step)
        ? Math.max(0, Math.min(4, draft.step))
        : 0;
      furthest = Number.isInteger(draft.furthest)
        ? Math.max(step, Math.min(4, draft.furthest))
        : step;
      requestId = /^[a-f\d-]{36}$/i.test(draft.requestId || "")
        ? draft.requestId
        : requestId;
      if (draft.files && typeof draft.files === "object")
        for (const [key] of documents) {
          const f = draft.files[key];
          if (f && typeof f.name === "string" && typeof f.size === "number") {
            restoredFiles[key] = { name: f.name.slice(0, 255), size: f.size };
            const p = document.createElement("p");
            p.textContent = `${f.name.slice(0, 255)} · not attached. Choose it again or supply later.`;
            $(`[data-document="${key}"] .ap-file-info`).append(p);
          }
        }
      optin.checked = true;
      status.textContent = "Restored answers · files need reselecting";
    } else {
      removeStorage(DRAFT);
      status.textContent = "Old or invalid draft cleared";
    }
  }
  form.hidden = false;
  progress.hidden = false;
  showStep(step, false);
  const receipt = readStorage(RECEIPT);
  if (
    receipt &&
    /^CHC-[A-F0-9]{12}$/.test(receipt.reference || "") &&
    ["test", "live"].includes(receipt.mode)
  )
    receiptView(receipt, true);
  else if (receipt) removeStorage(RECEIPT);
  fetch("/api/applications/config", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) throw new Error("Unavailable");
      const result = await response.json();
      if (
        !["test", "live"].includes(result.mode) ||
        typeof result.accepting !== "boolean"
      )
        throw new Error("Invalid configuration");
      config = result;
      const service = $("#ap-service-status");
      service.replaceChildren();
      const strong = document.createElement("strong");
      strong.textContent =
        result.mode === "test"
          ? "Test mode · fictional details and sample files only"
          : "Live application service";
      service.append(
        strong,
        document.createTextNode(
          result.mode === "test"
            ? "The server stores real submissions for testing, but does not start recruitment or notify the team. Do not use real IDs, contact details or medical records. Privacy approval and live operations are still outstanding."
            : "Submit only if you understand the processing notice. Intake availability does not guarantee placement.",
        ),
      );
      $("#ap-submit").disabled = !result.accepting;
      $("#ap-submit").textContent =
        result.mode === "test"
          ? "Submit test application →"
          : "Submit application →";
    })
    .catch(() => {
      $("#ap-service-status").textContent =
        "Application service unavailable. Nothing can be submitted right now. Keep this page open and try again later, or call +27 11 451 9898 for assistance. Do not enter real personal data during pre-launch review.";
    });
}
