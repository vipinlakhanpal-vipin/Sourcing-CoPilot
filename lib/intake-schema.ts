export type FieldType = "text" | "textarea" | "select" | "multiselect";

export interface IntakeField {
  id: string;
  label: string;
  helpText?: string;
  type: FieldType;
  options?: string[];
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
      "First, a little about the business itself — this shapes how we tailor category and supplier guidance.",
    scope: "sourcing",
    fields: [
      {
        id: "industry",
        label: "What industry is the customer in?",
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
        label: "Which regions/countries does the business primarily operate in?",
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
        options: ["RFI", "RFP", "RFQ", "Reverse auction"],
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
          "How does the business currently mitigate supplier risk (financial stability, compliance, single-source dependency, ESG, etc.)?",
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
        label: "Would the customer like to explore any of these other Coupa modules?",
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

export type IntakeAnswers = Record<string, Record<string, string | string[]>>;

export function isFieldFilled(value: string | string[] | undefined): boolean {
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
