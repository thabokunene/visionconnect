export const rplPath = "/services/rpl";
export const rplTitle =
  "Recognition of Prior Learning (RPL) | Citizen Human Capital";
export const rplDescription =
  "Turn years of working experience into a registered, SAQA-aligned qualification. Free eligibility screening. Multi-sector pathways across engineering, accounting, transport, trades, health, education, HR, IT, safety, and management.";
export const rplOgDescription =
  "You've been doing the job for years. Let's make it official — across ten sectors.";

// Supplied illustrative pathways, not an independently verified accreditation register.
// Do not invent SAQA IDs, provider accreditations or professional registration rights.
export const rplSectors = [
  "Transport & Logistics",
  "Trades & Technical",
  "Finance & Accounting",
  "Engineering & Construction",
  "Health",
  "Education & Training",
  "HR & People",
  "IT & Cyber",
  "Safety & Governance",
  "Management",
];
const records = [
  [0, "National Certificate: Professional Driving", 3, "Code 14 / EC drivers"],
  [0, "National Certificate: Freight Handling", 3, "Warehouse and depot staff"],
  [0, "FETC: Road Transport Management", 4, "Supervisors, dispatchers"],
  [
    1,
    "National Certificate: Engineering Fabrication",
    3,
    "Welders, boilermakers, fabricators",
  ],
  [
    1,
    "National Certificate: Automotive Repair & Maintenance",
    4,
    "Mechanics, auto electricians",
  ],
  [
    1,
    "National Certificate: Electrical Engineering",
    4,
    "Electricians, wiremen",
  ],
  [2, "FETC: Bookkeeping", 4, "Bookkeepers, accounts clerks"],
  [
    2,
    "National Certificate: Financial Services",
    4,
    "Finance assistants, tellers",
  ],
  [
    2,
    "National Certificate: Financial Markets & Instruments",
    5,
    "Junior analysts, traders",
  ],
  [
    3,
    "National Certificate: Construction Supervision",
    4,
    "Foremen, site supervisors",
  ],
  [
    3,
    "National Certificate: Civil Engineering Construction",
    3,
    "Construction workers, plant operators",
  ],
  [
    3,
    "National Certificate: Project Management",
    4,
    "Project coordinators, site managers",
  ],
  [
    4,
    "National Certificate: Community Health Work",
    3,
    "Community health workers",
  ],
  [
    4,
    "National Certificate: Auxiliary Nursing",
    3,
    "Caregivers, nursing auxiliaries",
  ],
  [4, "FETC: Emergency Care", 4, "First responders, EMTs"],
  [
    5,
    "FETC: Early Childhood Development",
    4,
    "ECD practitioners, childcare workers",
  ],
  [
    5,
    "National Certificate: Occupationally Directed Education, Training & Development",
    5,
    "Trainers, facilitators, assessors",
  ],
  [
    6,
    "National Certificate: Human Resource Management",
    4,
    "HR officers, HR admin",
  ],
  [
    6,
    "National Certificate: Labour Relations",
    5,
    "IR officers, ER specialists",
  ],
  [7, "National Certificate: IT Systems Support", 4, "IT support, help desk"],
  [
    7,
    "National Certificate: Cyber Security",
    5,
    "Security analysts, SOC staff",
  ],
  [
    8,
    "National Certificate: Occupational Health, Safety & Environment",
    4,
    "SHE officers, safety reps",
  ],
  [
    8,
    "National Certificate: Governance",
    4,
    "Board secretaries, committee coordinators",
  ],
  [
    9,
    "National Certificate: Generic Management",
    5,
    "First-line managers, supervisors",
  ],
  [
    9,
    "National Certificate: Business Management",
    5,
    "SME managers, department heads",
  ],
];
export const qualifications = records.map(
  ([sector, title, nqf, candidate]) => ({
    sector: rplSectors[sector],
    title,
    nqf,
    candidate,
  }),
);
