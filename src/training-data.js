// Course titles, durations, dates and locations supplied by the user.
// This is a curated catalogue, not a live availability or booking service.
export const trainingPath = "/what-we-do/training-courses";
export const trainingDescription =
  "Premium in-person training courses led by expert facilitators. Contract law, governance, leadership, finance, energy and AI — quality over quantity, tailored for South African professionals.";
export const courseCategories = [
  "Contracts & Law",
  "Governance",
  "Leadership",
  "Energy",
  "Finance",
  "Operations",
  "Education",
];
export const courseTitles = [
  {
    slug: "contract-law-for-non-lawyers",
    title: "Contract Law for Non-Lawyers",
    category: "Contracts & Law",
    days: 2,
  },
  {
    slug: "advanced-contract-law-for-non-lawyers",
    title: "Advanced Contract Law for Non-Lawyers",
    category: "Contracts & Law",
    days: 2,
  },
  {
    slug: "construction-contract-essentials",
    title: "Construction Contract Essentials & Dispute Procedures",
    category: "Contracts & Law",
    days: 2,
  },
  {
    slug: "modern-ea-fundamentals",
    title: "Fundamentals for the Modern EA",
    category: "Governance",
    days: 2,
  },
  {
    slug: "governance-board-management",
    title: "Governance & Board Management for EAs & PAs",
    sessionTitle: "Governance and Board Management Skills for EAs & PAs",
    category: "Governance",
    days: 1,
  },
  {
    slug: "management-skills-new-managers",
    title: "Management Skills for New Managers, Team Leaders & Supervisors",
    category: "Leadership",
    days: 2,
  },
  {
    slug: "leadership-development-women",
    title: "Leadership Development for Women",
    category: "Leadership",
    days: 2,
  },
  {
    slug: "electricity-industry-fundamentals",
    title: "Fundamentals of the South African Electricity Industry",
    category: "Energy",
    days: 2,
  },
  {
    slug: "advanced-inventory-management",
    title: "Advanced Inventory Management",
    category: "Operations",
    days: 2,
  },
  {
    slug: "optimising-warehouse-performance",
    title: "Optimising Warehouse Performance",
    category: "Operations",
    days: 2,
  },
  {
    slug: "financial-modelling",
    title: "Financial Modelling",
    category: "Finance",
    days: 3,
  },
  {
    slug: "renewable-energy-transition",
    title: "Fundamentals of Renewable Energy & Energy Transition",
    category: "Energy",
    days: 2,
  },
  {
    slug: "ai-in-the-classroom",
    title: "AI in the Classroom",
    category: "Education",
    days: 2,
    featured: false,
  },
];
const suppliedSessions = [
  [
    "advanced-contract-law-for-non-lawyers",
    "2026-11-03",
    "2026-11-04",
    "Johannesburg",
  ],
  ["contract-law-for-non-lawyers", "2026-11-05", "2026-11-06", "Cape Town"],
  ["financial-modelling", "2026-11-18", "2026-11-20", "Virtual"],
  ["ai-in-the-classroom", "2026-11-19", "2026-11-20", "Durban"],
  [
    "management-skills-new-managers",
    "2027-03-16",
    "2027-03-17",
    "Johannesburg",
  ],
  ["renewable-energy-transition", "2027-03-16", "2027-03-17", "Cape Town"],
  ["construction-contract-essentials", "2027-03-22", "2027-03-23", "Cape Town"],
  ["modern-ea-fundamentals", "2027-03-23", "2027-03-24", "Johannesburg"],
  ["contract-law-for-non-lawyers", "2027-03-29", "2027-03-31", "Virtual"],
  ["electricity-industry-fundamentals", "2027-03-31", "2027-04-01", "Durban"],
  ["financial-modelling", "2027-04-05", "2027-04-06", "Johannesburg"],
  ["leadership-development-women", "2027-04-06", "2027-04-07", "Johannesburg"],
  ["ai-in-the-classroom", "2027-04-07", "2027-04-08", "Johannesburg"],
  ["governance-board-management", "2027-04-29", "2027-04-29", "Cape Town"],
  ["contract-law-for-non-lawyers", "2027-05-03", "2027-05-04", "Cape Town"],
  [
    "construction-contract-essentials",
    "2027-05-03",
    "2027-05-04",
    "Johannesburg",
  ],
  ["contract-law-for-non-lawyers", "2027-05-05", "2027-05-06", "Johannesburg"],
  [
    "electricity-industry-fundamentals",
    "2027-06-01",
    "2027-06-02",
    "Johannesburg",
  ],
  ["management-skills-new-managers", "2027-06-01", "2027-06-02", "Cape Town"],
  ["ai-in-the-classroom", "2027-06-01", "2027-06-02", "Durban"],
  [
    "advanced-contract-law-for-non-lawyers",
    "2027-06-03",
    "2027-06-04",
    "Johannesburg",
  ],
  ["contract-law-for-non-lawyers", "2027-08-02", "2027-08-04", "Virtual"],
  ["financial-modelling", "2027-08-26", "2027-08-27", "Cape Town"],
  [
    "management-skills-new-managers",
    "2027-10-12",
    "2027-10-13",
    "Johannesburg",
  ],
  ["governance-board-management", "2027-10-14", "2027-10-14", "Johannesburg"],
  [
    "advanced-contract-law-for-non-lawyers",
    "2027-10-26",
    "2027-10-27",
    "Cape Town",
  ],
  [
    "construction-contract-essentials",
    "2027-10-27",
    "2027-10-28",
    "Johannesburg",
  ],
  [
    "electricity-industry-fundamentals",
    "2027-10-28",
    "2027-10-29",
    "Cape Town",
  ],
  ["modern-ea-fundamentals", "2027-11-02", "2027-11-03", "Cape Town"],
  ["renewable-energy-transition", "2027-11-02", "2027-11-03", "Johannesburg"],
];
export const sessions = suppliedSessions.map(
  ([slug, dateStart, dateEnd, location]) => {
    const course = courseTitles.find((item) => item.slug === slug);
    return {
      slug,
      title: course.sessionTitle || course.title,
      category: course.category,
      dateStart,
      dateEnd,
      location,
      id: `${slug}-${dateStart}-${location.toLowerCase().replace(/\s+/g, "-")}`,
    };
  },
);
export function southAfricaToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export function upcomingSessions(today = southAfricaToday()) {
  return sessions
    .filter((session) => session.dateEnd >= today)
    .sort((a, b) => a.dateStart.localeCompare(b.dateStart));
}
export function formatDateRange(start, end) {
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  const month = (value) =>
    new Intl.DateTimeFormat("en-ZA", { month: "long", timeZone: "UTC" }).format(
      new Date(Date.UTC(2000, value - 1, 1)),
    );
  if (start === end) return `${sd} ${month(sm)} ${sy}`;
  if (sy === ey && sm === em) return `${sd}–${ed} ${month(sm)} ${sy}`;
  if (sy === ey) return `${sd} ${month(sm)} – ${ed} ${month(em)} ${ey}`;
  return `${sd} ${month(sm)} ${sy} – ${ed} ${month(em)} ${ey}`;
}
export function shortDate(date) {
  const [year, month, day] = date.split("-").map(Number);
  return {
    day,
    month: new Intl.DateTimeFormat("en-ZA", {
      month: "short",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month - 1, day))),
    year,
  };
}
