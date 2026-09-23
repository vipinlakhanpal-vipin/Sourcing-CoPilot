import Link from "next/link";
import { INTAKE_AREAS } from "@/lib/intake-schema";

const SECTIONS = [
  { id: "what-it-is", label: "What this tool is" },
  { id: "running-an-intake", label: "Running an intake" },
  { id: "generating-a-package", label: "Generating a package" },
  { id: "after-generation", label: "After you generate a package" },
  { id: "out-of-scope", label: "What this tool does not do" },
  { id: "faq", label: "FAQ" },
];

export default function GuidePage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Guide</h1>
        <p className="mt-1 text-sm text-slate-500">
          How Sourcing CoPilot works, step by step — and where it hands off to a human.
        </p>
      </div>

      <nav className="flex flex-wrap gap-x-4 gap-y-1 rounded-lg border border-slate-200 bg-white p-4 text-sm">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="text-slate-600 underline hover:text-slate-900">
            {s.label}
          </a>
        ))}
      </nav>

      <section id="what-it-is" className="space-y-3 scroll-mt-6">
        <h2 className="text-base font-semibold text-slate-900">What this tool is</h2>
        <p className="text-sm text-slate-600">
          Sourcing CoPilot takes a customer from &ldquo;we want Coupa Sourcing&rdquo; to a fully
          specified, ready-to-configure setup. It interviews the customer through 7 guided
          areas, then generates a structured <strong>configuration package</strong> — a readable
          document plus the underlying structured data — for SCP&apos;s implementation team.
        </p>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          It produces a specification of what to build in Coupa. It does not build anything in
          Coupa itself. See{" "}
          <a href="#out-of-scope" className="underline">
            What this tool does not do
          </a>{" "}
          below.
        </div>
      </section>

      <section id="running-an-intake" className="space-y-3 scroll-mt-6">
        <h2 className="text-base font-semibold text-slate-900">Running an intake</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
          <li>
            From the <Link href="/dashboard" className="underline">dashboard</Link>, click{" "}
            <strong>New customer / opportunity</strong> and name it. This immediately starts an
            intake session and takes you into it.
          </li>
          <li>
            Answer each of the 7 areas below, one at a time. Required fields are marked with{" "}
            <span className="text-red-500">*</span>. You can go back and edit any earlier area
            before generating — your answers are saved after every &ldquo;Continue.&rdquo;
          </li>
          <li>
            You can leave and come back any time — an in-progress intake is saved under that
            customer&apos;s page, and &ldquo;Continue intake&rdquo; picks up where you left off.
          </li>
        </ol>
        <ol className="grid gap-2 pl-0 text-sm sm:grid-cols-2">
          {INTAKE_AREAS.map((area, i) => (
            <li key={area.id} className="rounded-md border border-slate-200 bg-white p-3">
              <span className="font-medium text-slate-900">
                {i + 1}. {area.title}
              </span>
              <p className="mt-1 text-slate-500">{area.agentIntro}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="generating-a-package" className="space-y-3 scroll-mt-6">
        <h2 className="text-base font-semibold text-slate-900">Generating a package</h2>
        <p className="text-sm text-slate-600">
          Once all 7 areas are complete, a review screen lists everything you&apos;ve entered.
          Clicking <strong>Generate configuration package</strong> sends those answers to Claude,
          which:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>
            Rewrites the raw answers into implementation-ready guidance, organized by the same 7
            areas — e.g. turning &ldquo;RFI, RFP&rdquo; and an event volume into a concrete
            recommendation for which event templates to enable and how to size them.
          </li>
          <li>
            Flags gaps or inconsistencies for the implementation team to confirm with the
            customer — e.g. a supplier count that doesn&apos;t reconcile with the master list, or
            scoring criteria with no assigned weights.
          </li>
        </ul>
        <p className="text-sm text-slate-600">
          This takes roughly 20–30 seconds. The result is saved permanently against that intake
          session, so you can revisit it later from the customer&apos;s page.
        </p>
      </section>

      <section id="after-generation" className="space-y-3 scroll-mt-6">
        <h2 className="text-base font-semibold text-slate-900">After you generate a package</h2>
        <p className="text-sm text-slate-600">This is where the app&apos;s job ends and a human&apos;s begins:</p>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
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
        <h2 className="text-base font-semibold text-slate-900">What this tool does not do</h2>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Sourcing CoPilot has no connection to any Coupa instance.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>It does not authenticate to, read from, or write to Coupa Test or Coupa Production.</li>
            <li>
              It does not create or modify Coupa objects — categories, event templates, approval
              workflows, or supplier records.
            </li>
            <li>It does not copy or promote configuration between Coupa environments.</li>
            <li>
              It does not perform ERP or SFTP integration — that is explicitly a separate
              integration agent&apos;s job, taking this tool&apos;s JSON export as its input.
            </li>
          </ul>
        </div>
      </section>

      <section id="faq" className="space-y-4 scroll-mt-6">
        <h2 className="text-base font-semibold text-slate-900">FAQ</h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-slate-900">Can I run more than one intake for the same customer?</p>
            <p className="text-slate-600">
              Yes — from the customer&apos;s page, click &ldquo;Start new intake session.&rdquo;
              Useful for a re-scope, or when the original was incomplete.
            </p>
          </div>
          <div>
            <p className="font-medium text-slate-900">Can I edit answers after generating a package?</p>
            <p className="text-slate-600">
              Yes, via &ldquo;Edit answers&rdquo; on the results page — but editing doesn&apos;t
              automatically regenerate the package. Generate again to produce an updated one.
            </p>
          </div>
          <div>
            <p className="font-medium text-slate-900">Who can see a customer&apos;s intake data?</p>
            <p className="text-slate-600">
              Only the account that created it. Customers, intake sessions, and packages are
              scoped to the logged-in user who created them.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
