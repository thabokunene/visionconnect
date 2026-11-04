export const hrPath = "/services/external-hr-management";
export const hrTitle = "External HR Management | Citizen Human Capital";
export const hrDescription =
  "A full HR department without the headcount. Contracts, policies, discipline, CCMA, payroll admin, EE reporting and BBBEE — delivered by a named consultant on a monthly retainer.";
export const hrOgDescription =
  "A full HR function — without adding a headcount.";

export const hrRoles = [
  ["person", "HR Director", "Strategy & governance"],
  ["clipboard", "HR Manager", "Day-to-day function"],
  ["growth", "Employee Relations Officer", "Discipline & grievances"],
  ["pay", "Payroll Administrator", "Processing & statutory"],
  ["people", "Recruiter", "Selection & offers"],
  ["education", "Training Coordinator", "WSP, ATR & CPD"],
  ["shield", "Compliance & EE Officer", "Reporting & POPIA"],
  ["case", "CCMA Representative", "Conciliation & arbitration"],
  ["document", "Policy Writer", "Handbooks & contracts"],
];
export const hrDomains = [
  {
    label: "Foundations",
    title: "Foundations",
    intro:
      "The paperwork that should have been in place from day one. We get it written, signed and filed.",
    items: [
      "Employment contracts and offer letters",
      "Job descriptions and grading",
      "Employee handbook",
      "Policies: leave, disciplinary, substance abuse, health and safety, remote work",
      "Organisational structure and reporting lines",
      "Onboarding and induction templates",
    ],
  },
  {
    label: "Employee relations",
    title: "Employee relations",
    intro:
      "The difficult conversations. Procedurally fair, documented processes and support with CCMA matters.",
    items: [
      "Disciplinary and grievance processes",
      "Chairing hearings (independent chair)",
      "Warnings and outcomes",
      "Retrenchment and restructuring support (s189)",
      "CCMA conciliation and arbitration representation, subject to applicable rules",
      "Bargaining council matters (Road Freight, MEIBC, etc.)",
    ],
  },
  {
    label: "Administration",
    title: "Administration and compliance",
    intro:
      "The monthly rhythm. Payroll, statutory administration and the reporting that supports your compliance records.",
    items: [
      "Payroll processing and payslips",
      "UIF, COIDA, SDL and PAYE liaison",
      "Leave administration",
      "Employment Equity reporting (EEA2, EEA4)",
      "WSP and ATR submission",
      "BBBEE skills development evidence",
    ],
  },
  {
    label: "Advisory",
    title: "Advisory",
    intro:
      "The ongoing access. Someone to call before you act, not just after.",
    items: [
      "On-call HR advice line for line managers",
      "Quarterly HR health check",
      "Manager coaching and one-on-one support",
      "Performance management frameworks",
      "Contract and policy review as legislation changes",
      "Restructuring and workforce planning advice",
    ],
  },
];
export const hrQuestions = [
  {
    question:
      "Do all your employees have written, signed employment contracts?",
    gap: "Review written, signed employment contracts.",
    choices: [
      ["yes", "Yes"],
      ["no", "No"],
    ],
  },
  {
    question: "Is your disciplinary code current and signed by every employee?",
    gap: "Review your disciplinary code and employee acknowledgements.",
    choices: [
      ["yes", "Yes"],
      ["no", "No"],
    ],
  },
  {
    question:
      "Have you submitted your Employment Equity report this year (if required)?",
    gap: "Check Employment Equity reporting requirements and submission status.",
    choices: [
      ["yes", "Yes"],
      ["no", "No"],
      ["na", "Not required"],
    ],
  },
  {
    question:
      "Do you have a named person who can chair a disciplinary hearing independently?",
    gap: "Confirm access to an independent disciplinary hearing chair.",
    choices: [
      ["yes", "Yes"],
      ["no", "No"],
    ],
  },
  {
    question: "Was your WSP/ATR submitted on time last year?",
    gap: "Check your WSP/ATR submission status and applicable requirements.",
    choices: [
      ["yes", "Yes"],
      ["no", "No"],
      ["unsure", "Not sure"],
    ],
  },
  {
    question:
      "Do you have a current, POPIA-compliant register of personal information?",
    gap: "Review personal-information records and data-protection practices.",
    choices: [
      ["yes", "Yes"],
      ["no", "No"],
    ],
  },
];

// This is a local self-check, not a compliance audit or legal determination.
// Only EE's explicit "Not required" is excluded; WSP "Not sure" remains a gap.
export function scoreHrHealth(answers) {
  const answered = hrQuestions.filter((q, index) =>
    q.choices.some(([value]) => value === answers[index]),
  ).length;
  if (answered !== hrQuestions.length) return { answered, complete: false };
  const applicable = hrQuestions.length - (answers[2] === "na" ? 1 : 0);
  const score = answers.filter(
    (answer, index) => index < hrQuestions.length && answer === "yes",
  ).length;
  const gaps = hrQuestions
    .filter(
      (q, index) =>
        answers[index] !== "yes" && !(index === 2 && answers[index] === "na"),
    )
    .map((q) => q.gap);
  const headline =
    gaps.length === 0
      ? "A strong starting point."
      : gaps.length <= 2
        ? "A few gaps to close."
        : "Your HR foundations need attention.";
  const body =
    gaps.length === 0
      ? "Your answers suggest these foundations are in place. Keep the records current and review them with a qualified adviser; this result does not certify compliance."
      : "Your answers highlight areas worth reviewing. A consultant can help you prioritise the next steps and confirm which requirements apply to your business.";
  return { answered, complete: true, applicable, score, gaps, headline, body };
}
