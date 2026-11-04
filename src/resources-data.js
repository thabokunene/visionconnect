import { sitePageMeta } from "./site-pages-data.js";
import { findInsight, insightArticles } from "./insights-data.js";
export const serviceCards = [
  {
    slug: "driver-recruitment",
    number: "01",
    title: "Driver Recruitment",
    strap: "Put the right person in the seat.",
    description:
      "Permanent placement or labour broking / TES, with role-specific screening and verification status made clear.",
    for: "A driver vacancy, a new contract or a shift cycle that needs capacity.",
    outputs: [
      "A role and site brief",
      "A shortlist and verification summary",
      "Agreed placement or TES terms",
    ],
    tag: "RECRUIT",
    link: "Explore driver recruitment",
    topic: "Driver recruitment",
  },
  {
    slug: "external-hr-management",
    number: "02",
    title: "External HR Management",
    strap: "Run the function. Support the people.",
    description:
      "Foundations, employee relations, administration and advisory support through a retainer, project or scoped advice.",
    for: "A growing workforce, an HR gap or a defined employee-relations issue.",
    outputs: [
      "Prioritised HR scope",
      "An accountable contact and agreed service levels",
      "Documented actions and reporting",
    ],
    tag: "SUPPORT",
    link: "Explore external HR",
    topic: "HR management",
  },
  {
    slug: "rpl",
    number: "03",
    title: "Recognition of Prior Learning",
    strap: "Give experience a pathway.",
    description:
      "Screening, evidence guidance and assessment against the requirements of the applicable qualification pathway.",
    for: "Experienced people whose skills are not yet reflected in a formal qualification.",
    outputs: [
      "Screening and pathway guidance",
      "An evidence and assessment plan",
      "An assessment outcome; an award only where earned",
    ],
    tag: "RECOGNISE",
    link: "Explore RPL",
    topic: "Qualifications",
  },
  {
    slug: "cpd",
    number: "04",
    title: "Professional Development",
    strap: "Build capability you can put to work.",
    description:
      "Open courses, in-house learning and scoped development programmes with clear outcomes and useful evidence.",
    for: "A capability gap, a team development plan or specific learning requirements.",
    outputs: [
      "Defined learning outcomes",
      "Agreed delivery and assessment",
      "Attendance and learning records as scoped",
    ],
    tag: "DEVELOP",
    link: "Explore CPD programmes",
    topic: "Learning",
  },
];
export const resourceBaseMeta = {
  "/services": {
    title: "Our Services | Citizen Human Capital",
    description:
      "Explore driver recruitment, external HR management, Recognition of Prior Learning and professional development. Four services, scoped around the work you need done.",
    nav: "/services",
  },
  "/services/cpd": {
    title: "Professional Development & CPD | Citizen Human Capital",
    description:
      "Scope professional development around clear learning outcomes. Explore open courses, in-house learning and development pathways, with recognition confirmed per programme.",
    nav: "/services",
    parent: true,
  },
  "/insights": {
    title: "Insights | Citizen Human Capital",
    description:
      "Practical guides on driver recruitment, HR, RPL, professional development and responsible workforce information sharing. Original editorial drafts for review.",
    nav: "/insights",
  },
};
export function resourceMeta(path) {
  if (Object.hasOwn(sitePageMeta, path))
    return { ...sitePageMeta[path], ogType: "website" };
  if (Object.hasOwn(resourceBaseMeta, path))
    return { ...resourceBaseMeta[path], ogType: "website" };
  const article = findInsight(path);
  return article
    ? {
        title: `${article.title.replace(/\.$/, "")} | Citizen Insights`,
        description: article.summary,
        nav: "/insights",
        parent: true,
        ogType: "article",
      }
    : null;
}

export const resourcePaths = [
  ...Object.keys(resourceBaseMeta),
  ...insightArticles.map((a) => `/insights/${a.slug}`),
];
