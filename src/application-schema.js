// Shared, dependency-free browser and server validation. Never trust client checks alone.
export const provinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];
export const choices = {
  province: provinces,
  rightToWork: ["Yes", "No"],
  licence: ["Code 8", "Code 10", "Code 14 / EC"],
  prdp: ["Yes", "No", "In progress"],
  vehicles: [
    "Rigid",
    "Articulated",
    "Tipper",
    "Tanker",
    "Refrigerated",
    "Flatbed",
    "Bus",
    "Other",
  ],
  routes: ["Local", "Regional", "Long haul", "Cross-border"],
  employment: ["Employed", "Available immediately", "Available with notice"],
  notice: ["1 week", "2 weeks", "1 month", "More than 1 month"],
  preferredProvinces: provinces,
  shift: ["Day", "Night", "Rotating", "No preference"],
  transport: ["Yes", "No"],
  longHaul: ["Yes", "No", "Sometimes"],
  overnight: ["Yes", "No"],
  rpl: ["Yes", "Maybe", "Not now"],
};
export const documents = [
  ["certifiedId", "Certified ID copy"],
  ["licenceFront", "Driving licence · front"],
  ["licenceBack", "Driving licence · back"],
  ["prdpDocument", "PrDP"],
  ["medical", "Medical certificate"],
  ["cv", "CV / work history"],
  ["certificates", "Other certificates"],
];
export const steps = [
  "About you",
  "Licence & experience",
  "Documents",
  "Preferences",
  "Review & submit",
];
export const fieldsByStep = [
  [
    "firstName",
    "surname",
    "saId",
    "mobile",
    "email",
    "city",
    "province",
    "rightToWork",
  ],
  [
    "licence",
    "licenceIssued",
    "licenceExpiry",
    "prdp",
    "prdpExpiry",
    "years",
    "vehicles",
    "routes",
    "employment",
    "notice",
  ],
  [],
  [
    "preferredProvinces",
    "shift",
    "earliestStart",
    "transport",
    "longHaul",
    "overnight",
    "rpl",
  ],
  ["processingConsent", "marketingConsent"],
];
export const labels = {
  firstName: "First name",
  surname: "Surname",
  saId: "South African ID number",
  mobile: "Mobile number",
  email: "Email address",
  city: "Town / city",
  province: "Province",
  rightToWork: "Right to work in South Africa",
  licence: "Highest licence code",
  licenceIssued: "Licence issue date",
  licenceExpiry: "Licence expiry date",
  prdp: "Do you have a PrDP?",
  prdpExpiry: "PrDP expiry date",
  years: "Years of driving experience",
  vehicles: "Vehicles driven",
  routes: "Routes driven",
  employment: "Current employment",
  notice: "Notice period",
  preferredProvinces: "Preferred provinces",
  shift: "Preferred shift",
  earliestStart: "Earliest start date",
  transport: "Reliable transport to work",
  longHaul: "Open to long haul",
  overnight: "Overnight stays",
  rpl: "Interested in RPL",
  processingConsent: "Application processing permission",
  marketingConsent: "Optional updates permission",
};
export const maxFileSize = 5 * 1024 * 1024;
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
export function idBirthDate(value, now = new Date()) {
  if (!/^\d{13}$/.test(value)) return null;
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let digit = Number(value[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  if (sum % 10) return null;
  const yy = Number(value.slice(0, 2));
  let year = Math.floor(now.getFullYear() / 100) * 100 + yy;
  let date = `${year}-${value.slice(2, 4)}-${value.slice(4, 6)}`;
  if (date > now.toISOString().slice(0, 10)) {
    year -= 100;
    date = `${year}-${value.slice(2, 4)}-${value.slice(4, 6)}`;
  }
  return validDate(date) ? date : null;
}
export function normalizeAnswers(raw = {}) {
  const data = {};
  for (const name of fieldsByStep.flat()) {
    if (["processingConsent", "marketingConsent"].includes(name))
      data[name] = raw[name] === true;
    else if (["vehicles", "routes", "preferredProvinces"].includes(name))
      data[name] = Array.isArray(raw[name])
        ? [
            ...new Set(
              raw[name]
                .filter((v) => typeof v === "string")
                .map((v) => v.trim()),
            ),
          ].slice(0, 12)
        : [];
    else
      data[name] =
        typeof raw[name] === "string" ? raw[name].trim().slice(0, 254) : "";
  }
  if (data.prdp !== "Yes") data.prdpExpiry = "";
  if (data.employment === "Available immediately") data.notice = "";
  return data;
}
export function validateAnswers(raw, step = null) {
  const data = normalizeAnswers(raw);
  const errors = {};
  const required = [
    "firstName",
    "surname",
    "saId",
    "mobile",
    "city",
    "province",
    "rightToWork",
    "licence",
    "licenceIssued",
    "licenceExpiry",
    "prdp",
    "years",
    "employment",
    "shift",
    "earliestStart",
    "transport",
  ];
  for (const name of required)
    if (!data[name])
      errors[name] = `Enter or choose ${labels[name].toLowerCase()}.`;
  for (const [name, options] of Object.entries(choices)) {
    if (Array.isArray(data[name])) {
      if (data[name].some((v) => !options.includes(v)))
        errors[name] = "Choose from the listed options.";
    } else if (data[name] && !options.includes(data[name]))
      errors[name] = "Choose from the listed options.";
  }
  if (!idBirthDate(data.saId))
    errors.saId =
      "Enter a valid 13-digit South African ID with a valid date of birth and checksum.";
  if (
    !/^(?:0[6-8]\d{8}|\+27[6-8]\d{8})$/.test(
      data.mobile.replace(/[\s()-]/g, ""),
    )
  )
    errors.mobile =
      "Enter a South African mobile number, for example 082 123 4567 or +27 82 123 4567.";
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Enter a valid email address or leave it blank.";
  for (const name of [
    "licenceIssued",
    "licenceExpiry",
    "prdpExpiry",
    "earliestStart",
  ])
    if (data[name] && !validDate(data[name]))
      errors[name] = "Enter a valid calendar date.";
  const today = new Date().toISOString().slice(0, 10);
  if (validDate(data.licenceIssued) && data.licenceIssued > today)
    errors.licenceIssued = "The issue date cannot be in the future.";
  if (
    validDate(data.licenceIssued) &&
    validDate(data.licenceExpiry) &&
    data.licenceExpiry < data.licenceIssued
  )
    errors.licenceExpiry = "Expiry must be on or after the issue date.";
  if (data.years && (!/^\d{1,2}$/.test(data.years) || Number(data.years) > 50))
    errors.years = "Enter a whole number from 0 to 50.";
  if (
    data.employment &&
    data.employment !== "Available immediately" &&
    !data.notice
  )
    errors.notice = "Choose your notice period.";
  if (!data.preferredProvinces.length)
    errors.preferredProvinces = "Choose at least one preferred province.";
  if (!data.processingConsent)
    errors.processingConsent =
      "Give permission to process this application before submitting.";
  if (step !== null)
    for (const name of Object.keys(errors))
      if (!fieldsByStep[step].includes(name)) delete errors[name];
  return errors;
}
export function fileError(slot, file) {
  if (!documents.some(([key]) => key === slot))
    return "Unknown document category.";
  const ext = file.name.toLowerCase().split(".").pop();
  const allowed = [
    "pdf",
    "jpg",
    "jpeg",
    "png",
    ...(["cv", "certificates"].includes(slot) ? ["doc", "docx"] : []),
  ];
  if (!allowed.includes(ext))
    return `Choose ${allowed.join(", ").toUpperCase()} files only.`;
  if (!file.size || file.size > maxFileSize)
    return "Choose a non-empty file no larger than 5 MB.";
  return "";
}
