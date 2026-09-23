import Anthropic from "@anthropic-ai/sdk";
import { INTAKE_AREAS, IntakeAnswers } from "./intake-schema";

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
        const formatted = Array.isArray(value)
          ? value.length > 0
            ? value.join(", ")
            : "(not answered)"
          : value && value.trim().length > 0
            ? value
            : "(not answered)";
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
      "You are a Coupa Sourcing implementation consultant at SCP. You turn a completed customer " +
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

  const input = toolUseBlock.input as { summary_markdown: string; flags: ConfigFlag[] };

  return {
    summaryMarkdown: input.summary_markdown,
    flags: input.flags ?? [],
  };
}
