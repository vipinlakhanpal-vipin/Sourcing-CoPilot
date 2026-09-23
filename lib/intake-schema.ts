import { z } from "zod";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "roster"
  | "file"
  | "category_rules";

export const ROSTER_ROLE_OPTIONS = [
  "Launch approver",
  "Award approver",
  "Technical grader",
  "Commercial grader",
  "Other",
] as const;

export const RFX_TYPE_OPTIONS = ["RFI", "RFP", "RFQ", "Reverse auction", "Forward auction"] as const;
export const EVENT_RIGOR_OPTIONS = ["Single-round", "Multi-round"] as const;

export interface RosterEntry {
  name: string;
  email: string;
  role: string;
  note?: string;
}

export interface CategoryRuleEntry {
  category: string;
  threshold: string;
  rfxTypes: string[];
  rigor: string;
}

export interface IntakeField {
  id: string;
  label: string;
  helpText?: string;
  type: FieldType;
  options?: string[];
  /** For "multiselect"/"select": populate options at runtime from another
   * field's current (string[]) answer instead of a fixed list — e.g. reuse
   * whichever categories were chosen earlier in the intake. */
  optionsFromField?: { areaId: string; fieldId: string };
  required: boolean;
  placeholder?: string;
}

export type IntakeAreaScope = "sourcing" | "context";

export interface IntakeArea {
  id: string;
  title: string;
  agentIntro: string;
  fields: IntakeField[];
  /**
   * "sourcing" areas directly drive the Coupa Sourcing configuration package.
   * "context" areas are captured for account planning / future modules and
   * must never be turned into Sourcing configuration instructions.
   */
  scope: IntakeAreaScope;
}

export const INTAKE_AREAS: IntakeArea[] = [
  {
    id: "industry_context",
    title: "Industry & business context",
    agentIntro:
      "First, a little about {{customer}} itself — this shapes how we tailor category and supplier guidance.",
    scope: "sourcing",
    fields: [
      {
        id: "industry",
        label: "What industry is {{customer}} in?",
        type: "text",
        placeholder: "e.g. Pharmaceutical manufacturing",
        required: true,
      },
      {
        id: "company_size",
        label: "Approximate company size (employees or revenue)",
        type: "text",
        placeholder: "e.g. ~4,000 employees, ~$1.2B revenue",
        required: false,
      },
      {
        id: "regions_of_operation",
        label: "Which regions/countries does {{customer}} primarily operate in?",
        type: "text",
        placeholder: "e.g. North America and Western Europe",
        required: false,
      },
    ],
  },
  {
    id: "spend_categories",
    title: "Sourcing categories & spend",
    agentIntro: "Now scope: which categories of spend will run through Coupa Sourcing?",
    scope: "sourcing",
    fields: [
      {
        id: "categories",
        label: "Which spend categories will run through Coupa Sourcing?",
        type: "multiselect",
        options: ["Indirect", "Direct", "Services", "MRO", "Capex"],
        required: true,
      },
      {
        id: "annual_spend_per_category",
        label: "Approximate annual sourced spend per category",
        type: "textarea",
        placeholder: "e.g. Indirect: $40M, Services: $12M",
        required: true,
      },
      {
        id: "active_suppliers_per_category",
        label: "Number of active suppliers per category today",
        type: "textarea",
        placeholder: "e.g. Indirect: ~120 suppliers, Services: ~35 suppliers",
        required: true,
      },
    ],
  },
  {
    id: "event_types",
    title: "Event types & volume",
    agentIntro: "Now let's talk about the sourcing events themselves.",
    scope: "sourcing",
    fields: [
      {
        id: "rfx_types",
        label: "Which RFx types are needed?",
        type: "multiselect",
        options: ["RFI", "RFP", "RFQ", "Reverse auction", "Forward auction"],
        required: true,
      },
      {
        id: "event_volume",
        label: "Expected event volume per month/quarter",
        type: "text",
        placeholder: "e.g. ~8 events per month",
        required: true,
      },
      {
        id: "event_complexity",
        label: "Typical event complexity",
        type: "select",
        options: [
          "Single-round, single-currency",
          "Multi-round, single-currency",
          "Single-round, multi-currency",
          "Multi-round, multi-currency",
        ],
        required: true,
      },
    ],
  },
  {
    id: "rfx_templates",
    title: "RFx & event templates by category",
    agentIntro:
      "Different categories usually need different event templates — let's map which template and rigor applies where.",
    scope: "sourcing",
    fields: [
      {
        id: "template_policy_by_category_and_spend",
        label:
          "For each category, add the event type(s) and rigor that apply at a given spend threshold — this is the starting point for which templates get built",
        helpText: "e.g. Direct, >$500k, RFP + Reverse auction, Multi-round",
        type: "category_rules",
        optionsFromField: { areaId: "spend_categories", fieldId: "categories" },
        required: true,
      },
      {
        id: "auction_categories",
        label: "Which categories, if any, use reverse or forward auctions?",
        type: "multiselect",
        optionsFromField: { areaId: "spend_categories", fieldId: "categories" },
        required: false,
      },
      {
        id: "auction_types",
        label: "Which auction type(s) are used for those categories?",
        type: "multiselect",
        options: ["Reverse auction", "Forward auction"],
        required: false,
      },
      {
        id: "auction_conditions",
        label: "Under what conditions should an auction be used (e.g. minimum qualified bidders)?",
        type: "text",
        placeholder: "e.g. 3+ qualified bidders",
        required: false,
      },
      {
        id: "templates_exist_today",
        label: "Do RFx/auction templates already exist somewhere (even outside Coupa), or do these need to be built from scratch?",
        type: "select",
        options: [
          "Templates exist and can be reused/adapted",
          "Partial templates exist",
          "Nothing exists yet — build from scratch",
        ],
        required: true,
      },
    ],
  },
  {
    id: "evaluation_scoring",
    title: "Evaluation & scoring",
    agentIntro: "How should responses get evaluated once they come in?",
    scope: "sourcing",
    fields: [
      {
        id: "scoring_model",
        label: "Weighted scoring or price-only?",
        type: "select",
        options: [
          "Weighted scoring (price + quality + delivery + compliance)",
          "Price-only",
        ],
        required: true,
      },
      {
        id: "scorers",
        label: "Who scores?",
        type: "multiselect",
        options: ["Procurement only", "Technical", "Finance", "Legal", "Other cross-functional"],
        required: true,
      },
      {
        id: "grading_split",
        label:
          "If scoring is split by discipline (e.g. Technical specs graded by IT/Tech, Commercial terms graded by Finance), describe the split",
        type: "textarea",
        placeholder: "e.g. IT/Tech grades technical fit and architecture; Finance grades pricing and payment terms",
        required: false,
      },
      {
        id: "scorecards_defined",
        label: "Are supplier scorecards or pre-qualification criteria already defined?",
        type: "select",
        options: ["Yes, defined", "Partially defined", "Not yet defined"],
        required: true,
      },
      {
        id: "scorecards_notes",
        label: "Notes on existing scorecards or pre-qualification criteria",
        type: "textarea",
        required: false,
      },
    ],
  },
  {
    id: "supplier_base",
    title: "Supplier base",
    agentIntro: "Now, the supplier side.",
    scope: "sourcing",
    fields: [
      {
        id: "master_list_format",
        label: "Existing supplier master list — format and source system",
        type: "text",
        placeholder: "e.g. Excel export from SAP, ~800 suppliers",
        required: true,
      },
      {
        id: "onboarding_process",
        label: "New supplier onboarding process today",
        type: "select",
        options: ["Manual", "Supplier portal", "None / ad hoc"],
        required: true,
      },
      {
        id: "tiering_in_use",
        label: "Is supplier categorization/tiering in use?",
        type: "select",
        options: ["Yes", "No"],
        required: true,
      },
      {
        id: "tiering_notes",
        label: "Notes on categorization/tiering",
        type: "textarea",
        required: false,
      },
    ],
  },
  {
    id: "supplier_risk_geography",
    title: "Supplier risk & geography",
    agentIntro: "Let's understand the supplier landscape and how risk is managed today.",
    scope: "sourcing",
    fields: [
      {
        id: "supplier_geography",
        label: "Where are suppliers geographically located / which regions do they source from?",
        type: "textarea",
        placeholder: "e.g. Mostly domestic for Services; APAC-heavy for Direct materials",
        required: true,
      },
      {
        id: "risk_mitigation_approach",
        label:
          "How does {{customer}} currently mitigate supplier risk (financial stability, compliance, single-source dependency, ESG, etc.)?",
        type: "textarea",
        required: true,
      },
      {
        id: "supplier_diversity_program",
        label: "Is there a supplier diversity or ESG sourcing program in place?",
        type: "select",
        options: ["Yes, formal program", "Informal / ad hoc", "No", "Not sure"],
        required: false,
      },
    ],
  },
  {
    id: "approval_workflow",
    title: "Approval workflow",
    agentIntro: "Let's map the approval chain for launching and awarding events.",
    scope: "sourcing",
    fields: [
      {
        id: "launch_approval_thresholds",
        label: "Approval hierarchy for launching a sourcing event (thresholds by value)",
        type: "textarea",
        placeholder: "e.g. <$50k: category manager; $50k-$250k: director; >$250k: VP",
        required: true,
      },
      {
        id: "award_approval_thresholds",
        label: "Approval hierarchy for awarding (thresholds by value)",
        type: "textarea",
        placeholder: "e.g. <$50k: category manager; $50k-$250k: director; >$250k: VP + Finance",
        required: true,
      },
      {
        id: "segregation_of_duties",
        label: "Any segregation-of-duties rules to enforce?",
        type: "textarea",
        placeholder: "e.g. event owner cannot also approve award",
        required: false,
      },
    ],
  },
  {
    id: "approval_grading_roster",
    title: "Named approvers & graders",
    agentIntro:
      "Now the actual people — Coupa approval chains and scorecards get built around real named users, not just a policy description.",
    scope: "sourcing",
    fields: [
      {
        id: "roster",
        label:
          "Add each launch approver, award approver, technical grader, and commercial grader by name and email",
        helpText:
          "e.g. Jane Doe, jane.doe@customer.com, Award approver, \">$250k awards\"",
        type: "roster",
        required: true,
      },
    ],
  },
  {
    id: "master_data_erp",
    title: "Master data & ERP integration",
    agentIntro:
      "Coupa Sourcing needs item, supplier, and currency master data loaded before go-live — let's see what's ready and how it should get there.",
    scope: "sourcing",
    fields: [
      {
        id: "item_master_file",
        label: "Item master export (CSV/XLSX from the ERP), if ready",
        type: "file",
        required: false,
      },
      {
        id: "supplier_master_file",
        label: "Supplier master export (CSV/XLSX), if ready",
        type: "file",
        required: false,
      },
      {
        id: "currency_master_file",
        label: "Currency master export, if ready (or just list the currencies used)",
        type: "file",
        required: false,
      },
      {
        id: "currency_list_text",
        label: "If not uploading a file, list the currencies {{customer}} transacts in",
        type: "text",
        placeholder: "e.g. USD, EUR, GBP",
        required: false,
      },
      {
        id: "erp_integration_preference",
        label:
          "Is a one-time master-data import enough, or does {{customer}} want live ERP integration for suppliers/items/currency?",
        type: "select",
        options: [
          "One-time file import is enough",
          "Wants live ERP integration eventually",
          "Wants live ERP integration at go-live",
          "Not decided yet",
        ],
        required: true,
      },
      {
        id: "erp_name",
        label: "If ERP integration is wanted, which ERP does the business use?",
        type: "select",
        options: [
          "SAP S/4HANA",
          "SAP ECC",
          "Oracle Fusion Cloud ERP",
          "Oracle NetSuite",
          "Oracle E-Business Suite",
          "Microsoft Dynamics 365",
          "Workday Financials",
          "Infor",
          "Epicor",
          "Sage Intacct",
          "JD Edwards",
          "PeopleSoft",
          "Other",
        ],
        required: false,
      },
      {
        id: "erp_integration_method",
        label: "Preferred integration method",
        type: "select",
        options: ["API", "SFTP flat files", "Manual export/import", "Not decided yet"],
        required: false,
      },
    ],
  },
  {
    id: "contract_handoff",
    title: "Contract handoff",
    agentIntro: "One more area before pain points: what happens after an award.",
    scope: "sourcing",
    fields: [
      {
        id: "auto_trigger",
        label: "Does an award trigger a contract automatically, or is that a separate manual step?",
        type: "select",
        options: ["Award automatically triggers contract", "Separate manual step"],
        required: true,
      },
      {
        id: "target_repository",
        label: "Contract repository/system the award should hand off to",
        type: "text",
        placeholder: "e.g. Coupa Contracts, DocuSign CLM, SharePoint",
        required: true,
      },
    ],
  },
  {
    id: "award_po_handoff",
    title: "Award & purchase order handoff",
    agentIntro: "One more handoff question: what happens to the PO once an award is made.",
    scope: "sourcing",
    fields: [
      {
        id: "po_creation_preference",
        label: "Should awarding a sourcing event create the purchase order directly from Coupa Sourcing?",
        type: "select",
        options: [
          "Yes — award should create the PO directly",
          "No — PO creation is a separate step in a P2P/ERP system",
          "Not decided yet",
        ],
        required: true,
      },
      {
        id: "po_target_system",
        label: "If PO creation is separate, which system issues the PO?",
        type: "select",
        options: [
          "Coupa Procurement",
          "SAP Ariba",
          "SAP S/4HANA",
          "SAP ECC",
          "Oracle Fusion Cloud ERP",
          "Oracle NetSuite",
          "Oracle E-Business Suite",
          "Microsoft Dynamics 365",
          "Workday Financials",
          "Infor",
          "Epicor",
          "Sage Intacct",
          "JD Edwards",
          "PeopleSoft",
          "Other",
        ],
        required: false,
      },
    ],
  },
  {
    id: "pain_points",
    title: "Current-state pain points",
    agentIntro: "Help us understand why this project exists.",
    scope: "sourcing",
    fields: [
      {
        id: "drivers",
        label: "What's driving the move to Coupa Sourcing?",
        type: "multiselect",
        options: ["Speed", "Compliance", "Visibility", "Cost savings", "Other"],
        required: true,
      },
      {
        id: "deadline",
        label: "Any hard deadline (fiscal year, board mandate, expiring contracts)?",
        type: "text",
        placeholder: "e.g. Must be live before FY27 budget cycle",
        required: false,
      },
      {
        id: "notes",
        label: "Anything else about current-state pain points?",
        type: "textarea",
        required: false,
      },
    ],
  },
  {
    id: "broader_coupa_landscape",
    title: "Broader Coupa landscape (context only)",
    agentIntro:
      "Last one, and it's optional — this section is for our team's planning only. Nothing here is used to configure Coupa Sourcing.",
    scope: "context",
    fields: [
      {
        id: "modules_of_interest",
        label: "Would {{customer}} like to explore any of these other Coupa modules?",
        type: "multiselect",
        options: [
          "Supplier Information Management (SIM)",
          "Supplier Risk & Performance",
          "Contracts",
          "Procurement / P2P",
          "Invoicing",
          "None of these right now",
        ],
        required: false,
      },
      {
        id: "procurement_challenges",
        label:
          "What are the biggest procurement challenges today, across any part of the process — not just sourcing?",
        type: "textarea",
        required: false,
      },
    ],
  },
];

export type FieldValue = string | string[] | RosterEntry[] | CategoryRuleEntry[];
export type IntakeAnswers = Record<string, Record<string, FieldValue>>;

const rosterEntrySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().toLowerCase().email().max(320),
  role: z.string().trim().min(1).max(100),
  note: z.string().trim().max(300).optional(),
});

const categoryRuleEntrySchema = z.object({
  category: z.string().trim().min(1).max(100),
  threshold: z.string().trim().max(200),
  rfxTypes: z.array(z.string().max(50)).max(10),
  rigor: z.string().trim().max(50),
});

export const fieldValueSchema = z.union([
  z.string().max(10000),
  z.array(z.string().max(500)).max(50),
  z.array(rosterEntrySchema).max(50),
  z.array(categoryRuleEntrySchema).max(50),
]);

export function isRosterEntryArray(value: unknown): value is RosterEntry[] {
  return (
    Array.isArray(value) &&
    (value.length === 0 || (typeof value[0] === "object" && value[0] !== null && "email" in value[0]))
  );
}

export function isCategoryRuleArray(value: unknown): value is CategoryRuleEntry[] {
  return (
    Array.isArray(value) &&
    (value.length === 0 ||
      (typeof value[0] === "object" && value[0] !== null && "rfxTypes" in value[0]))
  );
}

export function isFieldFilled(value: FieldValue | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.length > 0;
  return value.trim().length > 0;
}

export function isAreaComplete(area: IntakeArea, answers: IntakeAnswers): boolean {
  const areaAnswers = answers[area.id] ?? {};
  return area.fields
    .filter((f) => f.required)
    .every((f) => isFieldFilled(areaAnswers[f.id]));
}

export function getIncompleteAreas(answers: IntakeAnswers): string[] {
  return INTAKE_AREAS.filter((area) => !isAreaComplete(area, answers)).map((a) => a.id);
}

export function isIntakeComplete(answers: IntakeAnswers): boolean {
  return getIncompleteAreas(answers).length === 0;
}

/** Substitutes the {{customer}} token in schema copy with the real customer name. */
export function personalize(text: string, customerName: string): string {
  return text.replaceAll("{{customer}}", customerName);
}
