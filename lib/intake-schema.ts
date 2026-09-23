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

export interface IntakeArea {
  id: string;
  title: string;
  agentIntro: string;
  fields: IntakeField[];
}

export const INTAKE_AREAS: IntakeArea[] = [
  {
    id: "spend_categories",
    title: "Sourcing categories & spend",
    agentIntro:
      "Let's start with scope. Which categories of spend will run through Coupa Sourcing?",
    fields: [
      {
        id: "categories",
        label: "Which spend categories will run through Coupa Sourcing?",
        type: "multiselect",
        options: ["Indirect", "Direct", "Services", "Capex"],
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
    id: "approval_workflow",
    title: "Approval workflow",
    agentIntro: "Let's map the approval chain for launching and awarding events.",
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
    id: "supplier_base",
    title: "Supplier base",
    agentIntro: "Now, the supplier side.",
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
    id: "contract_handoff",
    title: "Contract handoff",
    agentIntro: "One more area before pain points: what happens after an award.",
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
    agentIntro: "Last section — help us understand why this project exists.",
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
