import Anthropic from "@anthropic-ai/sdk";
import { INTAKE_AREAS, IntakeAnswers, isRosterEntryArray, isCategoryRuleArray } from "./intake-schema";

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error("Missing ANTHROPIC_API_KEY environment variable");
}

const anthropic = new Anthropic({ apiKey });

const MODEL = "claude-sonnet-5";

export interface ConfigFlag {
  area: string;
  message: string;
  severity: "info" | "warning";
}

export interface GeneratedConfigPackage {
  summaryMarkdown: string;
  flags: ConfigFlag[];
}

const EMIT_TOOL_NAME = "emit_config_package";

function buildAnswersBlock(areas: typeof INTAKE_AREAS, answers: IntakeAnswers): string {
  return areas
    .map((area) => {
      const areaAnswers = answers[area.id] ?? {};
      const fieldLines = area.fields.map((field) => {
        const value = areaAnswers[field.id];
        let formatted: string;
        if (isRosterEntryArray(value)) {
          formatted =
            value.length > 0
              ? value
                  .map((r) => `${r.name} <${r.email}> — ${r.role}${r.note ? ` (${r.note})` : ""}`)
                  .join("; ")
              : "(not answered)";
        } else if (isCategoryRuleArray(value)) {
          formatted =
            value.length > 0
              ? value
                  .map(
                    (r) =>
                      `${r.category}${r.threshold ? ` ${r.threshold}` : ""}: ${r.rfxTypes.join(" + ")}, ${r.rigor}`
                  )
                  .join("; ")
              : "(not answered)";
        } else if (Array.isArray(value)) {
          formatted = value.length > 0 ? (value as string[]).join(", ") : "(not answered)";
        } else {
          formatted = value && value.trim().length > 0 ? value : "(not answered)";
        }
        return `  - ${field.label}: ${formatted}`;
      });
      return `${area.title}:\n${fieldLines.join("\n")}`;
    })
    .join("\n\n");
}

export async function generateConfigPackage(
  customerName: string,
  answers: IntakeAnswers
): Promise<GeneratedConfigPackage> {
  const sourcingAreas = INTAKE_AREAS.filter((a) => a.scope === "sourcing");
  const contextAreas = INTAKE_AREAS.filter((a) => a.scope === "context");
  const sourcingAnswersBlock = buildAnswersBlock(sourcingAreas, answers);
  const contextAnswersBlock = buildAnswersBlock(contextAreas, answers);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system:
      "You are a Coupa Sourcing implementation consultant. You turn a completed customer " +
      "intake into a structured configuration package for the internal implementation team. " +
      "Write in clear, professional, implementation-ready language — no filler, no restating the " +
      "question text verbatim, just what the implementation team needs to configure Coupa Sourcing. " +
      "Use the industry, company size, and supplier risk/geography answers to tailor your " +
      "recommendations — e.g. a healthcare customer's Direct-materials category needs different " +
      "pre-qualification and compliance framing than a services-only business; a category with a " +
      "concentrated or high-risk supplier base needs tighter pre-qualification and tiering guidance " +
      "than a low-risk, diversified one. Reason explicitly about each named spend category (Indirect, " +
      "Direct, Services, MRO, Capex, or whatever mix was given) combined with its spend value and " +
      "supplier count to recommend which event types and approval rigor fit that specific category — " +
      "do not give identical generic guidance to every category. " +
      "When named approvers and graders are provided (with email and role), wire them into the " +
      "Approval workflow and Evaluation & scoring sections by name and email against the specific " +
      "threshold or scope they were given — e.g. 'Award approval for >$250k routes to Jane Doe " +
      "(jane.doe@customer.com)' — rather than leaving the sections as an abstract policy description. " +
      "If a role (launch approver, award approver, technical grader, commercial grader) has no named " +
      "person assigned, flag that as a gap. When master-data file uploads are mentioned (item, " +
      "supplier, or currency master), note in the Supplier base section whether each is ready for " +
      "import or still outstanding, and reflect the customer's stated ERP integration preference " +
      "(one-time import vs. live integration). Reflect the PO/award handoff preference explicitly in " +
      "the Contract handoff section — whether award should create a PO directly or hand off to a " +
      "separate P2P/ERP system. " +
      "Also review the sourcing answers for gaps or internal inconsistencies (e.g. approval thresholds " +
      "that don't nest logically, a scoring model marked price-only but cross-functional scorers " +
      "listed, an event volume that seems implausible for the stated supplier count) and flag them — " +
      "do not block on them, just surface them for the implementation team to confirm with the " +
      "customer. Separately, you will also be given context-only answers about the customer's " +
      "interest in other Coupa modules and broader procurement challenges — these must NEVER be " +
      "turned into Sourcing configuration instructions. Summarize them only in a final, clearly " +
      "separate section titled exactly '## Beyond Sourcing (context only)', written for the account " +
      "team's future planning, with no configuration directives in it.",
    tools: [
      {
        name: EMIT_TOOL_NAME,
        description: "Emit the finished configuration package.",
        input_schema: {
          type: "object",
          properties: {
            summary_markdown: {
              type: "string",
              description:
                "The full configuration package as markdown. One '## ' section per sourcing intake " +
                "area, each written as implementation-ready guidance rather than a transcript of the " +
                "raw answers, followed by exactly one final section titled " +
                "'## Beyond Sourcing (context only)' summarizing the context-only answers with no " +
                "configuration instructions in it.",
            },
            flags: {
              type: "array",
              description:
                "Gaps or inconsistencies in the SOURCING answers worth flagging for the " +
                "implementation team. Do not generate flags about the context-only answers.",
              items: {
                type: "object",
                properties: {
                  area: { type: "string", description: "Which intake area this relates to" },
                  message: { type: "string", description: "The gap or inconsistency, in one sentence" },
                  severity: { type: "string", enum: ["info", "warning"] },
                },
                required: ["area", "message", "severity"],
              },
            },
          },
          required: ["summary_markdown", "flags"],
        },
      },
    ],
    tool_choice: { type: "tool", name: EMIT_TOOL_NAME },
    messages: [
      {
        role: "user",
        content:
          `Customer/opportunity: ${customerName}\n\n` +
          `Sourcing intake answers, organized by area — this drives the configuration package:\n\n${sourcingAnswersBlock}\n\n` +
          `Context-only answers — for the closing "Beyond Sourcing" section only, never for configuration:\n\n${contextAnswersBlock || "(none provided)"}\n\n` +
          "Generate the configuration package.",
      },
    ],
  });

  const toolUseBlock = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUseBlock) {
    throw new Error("Anthropic response did not include the expected tool call");
  }

  const input = toolUseBlock.input as { summary_markdown?: unknown; flags?: unknown };

  if (typeof input.summary_markdown !== "string" || !input.summary_markdown.trim()) {
    throw new Error("Anthropic response did not include a usable summary_markdown");
  }

  return {
    summaryMarkdown: input.summary_markdown,
    flags: normalizeFlags(input.flags),
  };
}

/**
 * The model is expected to return `flags` as a structured array, but on rare
 * occasions has been observed to return a string containing stray tool-call
 * markup around an embedded JSON array. Recover what we can; never let a
 * malformed flags value crash generation or get stored and later crash the
 * results page.
 */
function normalizeFlags(value: unknown): ConfigFlag[] {
  if (Array.isArray(value)) {
    return value.filter(
      (f): f is ConfigFlag =>
        f && typeof f === "object" && typeof f.area === "string" && typeof f.message === "string"
    );
  }
  if (typeof value === "string") {
    const match = value.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) return normalizeFlags(parsed);
      } catch {
        // fall through to empty array below
      }
    }
  }
  return [];
}
