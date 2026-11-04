import {
  employerServices,
  scopeChoice,
  employerTimelines,
  employerIndustries,
} from "./employer-data.js";
export const enquiryLabels = {
  yourName: "Your name",
  jobTitle: "Job title",
  company: "Company",
  industry: "Industry",
  email: "Work email",
  phone: "Phone",
  services: "Services",
  description: "Situation",
  timeline: "Timeline",
  consent: "Processing permission",
};
export function validateEnquiry(raw) {
  const errors = {};
  const data = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    return { data, errors: { yourName: "Enter your enquiry details." } };
  const lengths = {
    yourName: 100,
    jobTitle: 100,
    company: 150,
    industry: 80,
    email: 254,
    phone: 30,
    description: 800,
    timeline: 30,
  };
  for (const [key, max] of Object.entries(lengths)) {
    data[key] = typeof raw[key] === "string" ? raw[key].trim() : "";
    if (data[key].length > max)
      errors[key] = `Use no more than ${max} characters.`;
  }
  for (const key of [
    "yourName",
    "jobTitle",
    "company",
    "email",
    "phone",
    "description",
    "timeline",
  ])
    if (!data[key])
      errors[key] = `Enter or choose ${enquiryLabels[key].toLowerCase()}.`;
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Enter a valid work email address.";
  const phone = data.phone.replace(/[\s().-]/g, "");
  if (data.phone && !/^(?:0[1-8]\d{8}|\+\d{8,15})$/.test(phone))
    errors.phone = "Enter a valid phone number, for example +27 11 451 9898.";
  if (data.description.length && data.description.length < 20)
    errors.description = "Add a little more detail—at least 20 characters.";
  const allowed = [...employerServices.map((s) => s.key), scopeChoice];
  data.services = Array.isArray(raw.services) ? [...new Set(raw.services)] : [];
  if (!data.services.length || data.services.some((s) => !allowed.includes(s)))
    errors.services =
      "Choose at least one listed service, or help me scope it.";
  if (data.timeline && !employerTimelines.includes(data.timeline))
    errors.timeline = "Choose a listed timeline.";
  if (
    data.industry &&
    ![...employerIndustries, "Other"].includes(data.industry)
  )
    errors.industry = "Choose a listed industry or Other.";
  data.consent = raw.consent === true;
  if (!data.consent)
    errors.consent =
      "Give permission to process this enquiry before submitting.";
  if (raw.hp)
    errors.hp =
      "The enquiry could not be accepted. Leave the extra field blank, or contact reception.";
  data.pageSource = "For Employers Landing";
  data.pageUrl = "https://www.citizenhc.co.za/employers";
  return { data, errors };
}
