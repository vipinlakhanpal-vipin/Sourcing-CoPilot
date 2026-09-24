import Link from "next/link";
import { INTAKE_AREAS } from "@/lib/intake-schema";

const SECTIONS = [
  { id: "what-it-is", label: "What this tool is" },
  { id: "running-an-intake", label: "Running an intake" },
  { id: "generating-a-package", label: "Generating a package" },
  { id: "after-generation", label: "After you generate a package" },
  { id: "out-of-scope", label: "Coupa connection status" },
  { id: "faq", label: "FAQ" },
];

export default function GuidePage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-lg font-semibold text-ink-800">Guide</h1>
        <p className="mt-1 text-sm text-ink-400">
          How Sourcing CoPilot works, step by step — and where it hands off to a human.
        </p>
      </div>

      <nav className="flex flex-wrap gap-x-4 gap-y-1 rounded-lg border border-ink-100 bg-surface p-4 text-sm">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="text-ink-500 underline hover:text-ink-800">
            {s.label}
          </a>
        ))}
      </nav>

      <section id="what-it-is" className="space-y-3 scroll-mt-6">
        <h2 className="text-base font-semibold text-ink-800">What this tool is</h2>
        <p className="text-sm text-ink-500">
          Sourcing CoPilot takes a customer from &ldquo;we want Coupa Sourcing&rdquo; to a fully
          specified, ready-to-configure setup. It interviews the customer through{" "}
          {INTAKE_AREAS.length} guided areas, then generates a structured{" "}
          <strong>configuration package</strong> — a readable document plus the underlying
          structured data — for SCP&apos;s implementation team.
        </p>
        <div className="rounded-md border border-ink-100 bg-ink-50 p-3 text-sm text-ink-500">
          It produces a specification of what to build in Coupa, and can now connect to a real
          Coupa tenant to confirm access — but does not yet create or change anything inside
          Coupa. See{" "}
          <a href="#out-of-scope" className="underline">
            Coupa connection status
          </a>{" "}
          below.
        </div>
      </section>

      <section id="running-an-intake" className="space-y-3 scroll-mt-6">
        <h2 className="text-base font-semibold text-ink-800">Running an intake</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-500">
          <li>
            From <Link href="/projects" className="underline">Projects</Link>, click{" "}
            <strong>New customer / opportunity</strong> and name it. You land on that
            customer&apos;s page with two ways to run the intake:
            <strong> Continue intake</strong> to walk the customer through it yourself, or{" "}
            <strong>Copy customer link</strong> to send them a self-service link so they fill it
            in on their own time — no login required on their end. Either way, the answers land in
            the same place.
          </li>
          <li>
            A self-service link opens by asking the customer&apos;s name (and optionally email),
            then walks them through the same {INTAKE_AREAS.length} areas. Required fields are
            marked with <span className="text-red-500">*</span>. Progress is saved after every
            &ldquo;Continue,&rdquo; so they can close the tab and resume later from the same link.
          </li>
          <li>
            Once the customer submits their side, the intake still shows as
            &ldquo;in progress&rdquo; on your dashboard — generating the package is a deliberate,
            rep-only step (see below).
          </li>
          <li>
            One area, marked <span className="rounded bg-ink-100 px-1.5 py-0.5 text-xs font-medium text-ink-500">context only</span>,
            is optional and is never turned into Coupa Sourcing configuration — it&apos;s captured
            purely for account planning around other Coupa modules.
          </li>
          <li>
            &ldquo;Named approvers &amp; graders&rdquo; captures real people — name, email, and role
            (launch approver, award approver, technical grader, commercial grader) — so the
            generated package routes approval and scoring to actual individuals, not just a policy
            description.
          </li>
          <li>
            &ldquo;Master data &amp; ERP integration&rdquo; accepts CSV/XLSX uploads for item,
            supplier, and currency master data. Uploaded files are listed with a download link on
            the results page for the implementation team.
          </li>
        </ol>
        <ol className="grid gap-2 pl-0 text-sm sm:grid-cols-2">
          {INTAKE_AREAS.map((area, i) => (
            <li key={area.id} className="rounded-md border border-ink-100 bg-surface p-3">
              <span className="font-medium text-ink-800">
                {i + 1}. {area.title}
              </span>
              {area.scope === "context" && (
                <span className="ml-2 rounded bg-ink-100 px-1.5 py-0.5 text-xs font-medium text-ink-500">
                  context only
                </span>
              )}
              <p className="mt-1 text-ink-400">{area.agentIntro}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="generating-a-package" className="space-y-3 scroll-mt-6">
        <h2 className="text-base font-semibold text-ink-800">Generating a package</h2>
        <p className="text-sm text-ink-500">
          Once all 7 areas are complete, a review screen lists everything you&apos;ve entered.
          Clicking <strong>Generate configuration package</strong> sends those answers to Claude,
          which:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-500">
          <li>
            Rewrites the raw answers into implementation-ready guidance per sourcing area —
            reasoning about each category&apos;s spend, supplier count, industry, and risk profile
            together, so a high-risk Direct-materials category gets different guidance than a
            low-risk Services category, instead of one generic answer for everything.
          </li>
          <li>
            Flags gaps or inconsistencies for the implementation team to confirm with the
            customer — e.g. a supplier count that doesn&apos;t reconcile with the master list, or
            scoring criteria with no assigned weights.
          </li>
          <li>
            Closes with a separate &ldquo;Beyond Sourcing (context only)&rdquo; section built from
            the context-only area — never mixed into the Sourcing configuration guidance above it.
          </li>
        </ul>
        <p className="text-sm text-ink-500">
          This takes roughly 20–30 seconds. The result is saved permanently against that intake
          session, so you can revisit it later from the customer&apos;s page.
        </p>
      </section>

      <section id="after-generation" className="space-y-3 scroll-mt-6">
        <h2 className="text-base font-semibold text-ink-800">After you generate a package</h2>
        <p className="text-sm text-ink-500">This is where the app&apos;s job ends and a human&apos;s begins:</p>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-500">
          <li>
            On the results page, download the structured data (JSON) and share the rendered
            document with SCP&apos;s implementation team, or with the separate integration agent
            if ERP/SFTP work is also in scope for this customer.
          </li>
          <li>
            An implementation consultant manually builds the categories, event templates, scoring
            rubrics, approval chains, and supplier tiers inside the customer&apos;s{" "}
            <strong>Coupa Test/Sandbox</strong> tenant, using the package as the spec.
          </li>
          <li>
            The customer validates the Test configuration against real scenarios.
          </li>
          <li>
            Once approved, the configuration is carried to the customer&apos;s{" "}
            <strong>Coupa Production</strong> tenant — via Coupa&apos;s own environment-promotion
            tooling or a manual rebuild, following SCP&apos;s standard implementation practice.
          </li>
        </ol>
      </section>

      <section id="out-of-scope" className="space-y-3 scroll-mt-6">
        <h2 className="text-base font-semibold text-ink-800">Coupa connection — what&apos;s real today</h2>
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <p className="font-medium">Built and working: a real, testable connection to a Coupa tenant.</p>
          <p className="mt-1">
            On a customer&apos;s page, &ldquo;Coupa Test connection&rdquo; stores an OAuth2
            client-credentials connection (instance URL, client ID/secret, scope) — the current,
            documented Coupa authentication method. &ldquo;Test connection&rdquo; actually
            exchanges those credentials for a real access token and makes one safe, read-only
            call to confirm API access. Nothing is created, changed, or deleted by this.
          </p>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <p className="font-medium">Not yet built: anything that writes to Coupa.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>No categories, suppliers, events, or approval rules are created or modified.</li>
            <li>No configuration is copied or promoted between Coupa environments.</li>
          </ul>
          <p className="mt-2">
            Per Coupa&apos;s own published Sourcing API, creating an event requires a{" "}
            <code>source_id</code> — an existing event/template already built in Coupa&apos;s UI —
            so full template creation from nothing does not appear to be API-reachable. Approval-
            rule logic looks UI-only too. This is based on public documentation, not a live test
            against a real tenant, so treat it as informed, not certain.
          </p>
        </div>
      </section>

      <section id="faq" className="space-y-4 scroll-mt-6">
        <h2 className="text-base font-semibold text-ink-800">FAQ</h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-ink-800">Can I run more than one intake for the same customer?</p>
            <p className="text-ink-500">
              Yes — from the customer&apos;s page, click &ldquo;Start new intake session.&rdquo;
              Useful for a re-scope, or when the original was incomplete.
            </p>
          </div>
          <div>
            <p className="font-medium text-ink-800">Can I edit answers after generating a package?</p>
            <p className="text-ink-500">
              Yes, via &ldquo;Edit answers&rdquo; on the results page — but editing doesn&apos;t
              automatically regenerate the package. Generate again to produce an updated one.
            </p>
          </div>
          <div>
            <p className="font-medium text-ink-800">Who can see a customer&apos;s intake data?</p>
            <p className="text-ink-500">
              Only the account that created it. Customers, intake sessions, and packages are
              scoped to the logged-in user who created them.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
