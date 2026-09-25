import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireUserId, isErrorResponse } from "@/lib/api-helpers";
import { anthropic, MODEL } from "@/lib/anthropic";
import { INTAKE_AREAS } from "@/lib/intake-schema";

const chatSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(20)
    .default([]),
  pathname: z.string().max(500).default(""),
});

// Pulls whatever project context is available from the current page's URL, so
// Aria can answer about a specific customer's intake or generated package
// without every page having to pass that context down separately.
async function loadContext(pathname: string, userId: string) {
  const customerMatch = pathname.match(/^\/customers\/([0-9a-f-]{36})/);
  const intakeMatch = pathname.match(/^\/intake\/([0-9a-f-]{36})/);

  let customerId = customerMatch?.[1] ?? null;

  if (!customerId && intakeMatch) {
    const { data: session } = await supabaseAdmin
      .from("intake_sessions")
      .select("customer_id")
      .eq("id", intakeMatch[1])
      .maybeSingle();
    customerId = session?.customer_id ?? null;
  }

  if (!customerId) return null;

  const { data: customer } = await supabaseAdmin
    .from("customers")
    .select("id, name")
    .eq("id", customerId)
    .eq("owner_id", userId)
    .maybeSingle();
  if (!customer) return null;

  const { data: sessions } = await supabaseAdmin
    .from("intake_sessions")
    .select("id, status, answers, current_step")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(1);
  const session = sessions?.[0] ?? null;

  const { data: packages } = await supabaseAdmin
    .from("config_packages")
    .select("summary_markdown")
    .eq("customer_id", customerId)
    .order("generated_at", { ascending: false })
    .limit(1);
  const pkg = packages?.[0] ?? null;

  return { customer, session, pkg };
}

function buildSystemPrompt(context: Awaited<ReturnType<typeof loadContext>>): string {
  const base =
    "You are Aria, the AI assistant built into Sourcing CoPilot, a tool that interviews a customer " +
    "through a guided intake and generates a Coupa Sourcing configuration package. You help the " +
    "person using this app in three ways: answering questions about a specific project's intake " +
    "answers, helping draft or suggest wording for an intake question when asked, and explaining " +
    "the reasoning behind guidance in an already generated configuration package. Keep answers " +
    "concise and practical, a few sentences unless more detail is clearly needed. Write in plain, " +
    "natural sentences, never use em dashes or en dashes. If someone asks something with no " +
    "relevant project context available, say so plainly and suggest they open a specific project first.";

  if (!context) {
    return base + " No project is currently open, so you have no intake or package data to reference.";
  }

  const parts = [base, `\nThe person is currently looking at the project "${context.customer.name}".`];

  if (context.session) {
    const areaSummaries = INTAKE_AREAS.map((area) => {
      const answers = (context.session!.answers as Record<string, unknown>)?.[area.id];
      if (!answers || Object.keys(answers as object).length === 0) return null;
      return `${area.title}: ${JSON.stringify(answers)}`;
    }).filter(Boolean);
    parts.push(
      `\nIntake session status: ${context.session.status}, currently on step ${context.session.current_step} of ${INTAKE_AREAS.length}.`
    );
    if (areaSummaries.length > 0) {
      parts.push(`\nAnswers captured so far:\n${areaSummaries.join("\n")}`);
    } else {
      parts.push("\nNo answers have been entered yet.");
    }
  } else {
    parts.push("\nNo intake session has been started for this project yet.");
  }

  if (context.pkg) {
    parts.push(`\nA configuration package has been generated. Its content:\n${context.pkg.summary_markdown}`);
  } else {
    parts.push("\nNo configuration package has been generated for this project yet.");
  }

  return parts.join("\n");
}

export async function POST(request: NextRequest) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const body = await request.json().catch(() => null);
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A message is required" }, { status: 400 });
  }
  const { message, history, pathname } = parsed.data;

  const context = await loadContext(pathname, userId);
  const system = buildSystemPrompt(context);

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages: [
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: "user" as const, content: message },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const reply = textBlock && "text" in textBlock ? textBlock.text : "I couldn't come up with a reply. Try asking again.";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Aria could not respond. Try again in a moment." }, { status: 500 });
  }
}
