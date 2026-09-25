import Link from "next/link";
import { AREA_HUES, INTAKE_AREAS } from "@/lib/intake-schema";

const SECTIONS = [
  { id: "what-it-is", label: "What this tool is" },
  { id: "paths", label: "Two ways in" },
  { id: "areas", label: "14 areas" },
  { id: "generating-a-package", label: "Generating" },
  { id: "after-generation", label: "After you generate" },
  { id: "out-of-scope", label: "Coupa connection" },
  { id: "faq", label: "FAQ" },
];

export default function GuidePage() {
  return (
    <div className="space-y-8">
      <div className="hero-carbon rounded-xl p-6">
        <h1 className="font-display text-2xl text-white">How Sourcing CoPilot works</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-white/70">
          From &ldquo;we want Coupa Sourcing&rdquo; to a ready-to-configure package — {INTAKE_AREAS.length}{" "}
          guided areas, two ways to fill them in, one structured handoff to SCP&apos;s
          implementation team.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <section id="what-it-is" className="space-y-3 scroll-mt-6">
        <h2 className="text-lg font-extrabold text-brand-700">What this tool is</h2>
        <div className="rounded-xl border border-ink-100 bg-surface p-6">
          <p className="text-sm text-ink-600">
            Sourcing CoPilot takes a customer from &ldquo;we want Coupa Sourcing&rdquo; to a fully
            specified, ready-to-configure setup. It interviews the customer through{" "}
            {INTAKE_AREAS.length} guided areas, then generates a structured{" "}
            <strong>configuration package</strong> — a readable document plus the underlying
            structured data — for SCP&apos;s implementation team.
          </p>
          <div className="mt-3 rounded-md border border-ink-100 bg-ink-50 p-3 text-sm text-ink-500">
            It produces a specification of what to build in Coupa, and can now connect to a real
            Coupa tenant to confirm access — but does not yet create or change anything inside
            Coupa. See{" "}
            <a href="#out-of-scope" className="underline">
              Coupa connection status
            </a>{" "}
            below.
          </div>
        </div>
      </section>

      <section id="paths" className="space-y-3 scroll-mt-6">
        <h2 className="text-lg font-extrabold text-brand-700">Two ways the {INTAKE_AREAS.length} areas get filled in</h2>
        <p className="text-sm text-ink-500">
          Same areas, same generated package either way — the only difference is who&apos;s
          typing and how they get there.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-ink-100">
            <div className="flex items-center gap-2 bg-ink-800 px-4 py-3 text-white">
              <span className="text-base">🧑‍💼</span>
              <span className="text-sm font-bold">You fill it in with the customer</span>
            </div>
            <div className="space-y-2 bg-surface p-4 text-sm text-ink-700">
              <ol className="list-decimal space-y-1.5 pl-5">
                <li>
                  Open the project, click <strong>Continue intake</strong>
                </li>
                <li>Walk through the areas live — on a call, in a workshop, however you normally run discovery</li>
                <li>
                  Answers save after every &ldquo;Continue,&rdquo; under your own account
                </li>
              </ol>
              <div className="mt-3 border-t border-dashed border-ink-100 pt-3">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-400">
                  Shows on the project page as
                </p>
                <span className="fill-badge fill-badge--consultant">👤 Filled in by you (Consultant)</span>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-brand-200">
            <div className="flex items-center gap-2 bg-brand-600 px-4 py-3 text-white">
              <span className="text-base">🔗</span>
              <span className="text-sm font-bold">Customer fills it in themselves</span>
            </div>
            <div className="space-y-2 bg-surface p-4 text-sm text-ink-700">
              <ol className="list-decimal space-y-1.5 pl-5">
                <li>
                  Click <strong>Copy customer link</strong> and send it — email, Slack, whatever you use
                </li>
                <li>They open it, type their name (no login needed), and work through it on their own time</li>
                <li>Progress saves automatically — they can close the tab and pick up later from the same link</li>
              </ol>
              <div className="mt-3 border-t border-dashed border-ink-100 pt-3">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-400">
                  Shows on the project page as
                </p>
                <span className="fill-badge fill-badge--customer">🏢 Filled in by Annie (Customer)</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-md border border-ink-100 bg-ink-50 p-3 text-sm text-ink-600">
          <strong className="text-ink-800">Either way:</strong> the intake still shows &ldquo;in
          progress&rdquo; until you generate the package yourself — that step is always rep-only,
          even after a customer finishes their side.
        </div>
      </section>

      <section id="areas" className="space-y-3 scroll-mt-6">
        <h2 className="text-lg font-extrabold text-brand-700">{INTAKE_AREAS.length} areas, one per screen</h2>
        <p className="text-sm text-ink-500">
          Each area gets its own accent as you move through the left-hand rail — the dashed
          outline marks the one area that&apos;s context-only and never becomes Sourcing
          configuration.
        </p>
        <div className="rounded-xl border border-ink-100 bg-surface p-5">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {INTAKE_AREAS.map((area, i) => (
              <div
                key={area.id}
                className={`rounded-lg p-3 text-white ${area.scope === "context" ? "outline outline-2 -outline-offset-2 outline-white/45" : ""}`}
                style={{ backgroundColor: AREA_HUES[i % AREA_HUES.length] }}
              >
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-white/70">
                  {i + 1}
                  {area.scope === "context" ? " · context only" : ""}
                </p>
                <p className="text-sm font-bold">{area.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="generating-a-package" className="space-y-3 scroll-mt-6">
        <h2 className="text-lg font-extrabold text-brand-700">Generating a package</h2>
        <p className="text-sm text-ink-500">
          Once all {INTAKE_AREAS.length} areas are complete, a review screen lists everything
          you&apos;ve entered. Clicking <strong>Generate configuration package</strong> sends
          those answers to Claude, which takes roughly 20–30 seconds to:
        </p>
        <div className="rounded-xl border border-ink-100 bg-surface p-6">
          <div className="timeline">
            <div className="tstep">
              <b>Write implementation-ready guidance per area</b>
              reasoning about each category&apos;s spend, supplier count, industry, and risk
              profile together, so a high-risk Direct-materials category gets different guidance
              than a low-risk Services category, instead of one generic answer for everything.
            </div>
            <div className="tstep">
              <b>Flag gaps for the team to confirm</b>
              e.g. a supplier count that doesn&apos;t reconcile with the master list, or scoring
              criteria with no assigned weights.
            </div>
            <div className="tstep">
              <b>Keep context-only separate</b>
              closes with a &ldquo;Beyond Sourcing (context only)&rdquo; section built from the
              context-only area — never mixed into the Sourcing configuration guidance above it.
            </div>
          </div>
        </div>
        <p className="text-sm text-ink-500">
          The result is saved permanently against that intake session, so you can revisit it later
          from the project&apos;s page.
        </p>
      </section>

      <section id="after-generation" className="space-y-3 scroll-mt-6">
        <h2 className="text-lg font-extrabold text-brand-700">After you generate a package</h2>
        <p className="text-sm text-ink-500">This is where the app&apos;s job ends and a human&apos;s begins:</p>
        <div className="rounded-xl border border-ink-100 bg-surface p-6">
          <div className="timeline">
            <div className="tstep">
              <b>Download &amp; share</b>
              the structured data (JSON) and share the rendered document with SCP&apos;s
              implementation team, or with the separate integration agent if ERP/SFTP work is
              also in scope for this customer.
            </div>
            <div className="tstep">
              <b>Build it in Coupa Test</b>
              an implementation consultant manually builds the categories, event templates,
              scoring rubrics, approval chains, and supplier tiers inside the customer&apos;s
              Coupa Test/Sandbox tenant, using the package as the spec.
            </div>
            <div className="tstep">
              <b>Customer validates</b>
              the Test configuration against real scenarios.
            </div>
            <div className="tstep">
              <b>Promote to Production</b>
              once approved, via Coupa&apos;s own environment-promotion tooling or a manual
              rebuild, following SCP&apos;s standard implementation practice.
            </div>
          </div>
        </div>
      </section>

      <section id="out-of-scope" className="space-y-3 scroll-mt-6">
        <h2 className="text-lg font-extrabold text-brand-700">Coupa connection — what&apos;s real today</h2>
        <div className="space-y-3 rounded-xl border border-ink-100 bg-surface p-6">
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <p className="font-medium">Built and working: a real, testable connection to a Coupa tenant.</p>
            <p className="mt-1">
              On a project&apos;s page, &ldquo;Coupa Test connection&rdquo; stores an OAuth2
              client-credentials connection (instance URL, client ID/secret, scope) — the
              current, documented Coupa authentication method. &ldquo;Test connection&rdquo;
              actually exchanges those credentials for a real access token and makes one safe,
              read-only call to confirm API access. Nothing is created, changed, or deleted by
              this.
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
              <code>source_id</code> — an existing event/template already built in Coupa&apos;s
              UI — so full template creation from nothing does not appear to be API-reachable.
              Approval-rule logic looks UI-only too. This is based on public documentation, not a
              live test against a real tenant, so treat it as informed, not certain.
            </p>
          </div>
        </div>
      </section>

      <section id="faq" className="space-y-3 scroll-mt-6">
        <h2 className="text-lg font-extrabold text-brand-700">FAQ</h2>
        <div className="divide-y divide-ink-100 rounded-xl border border-ink-100 bg-surface px-6">
          <div className="py-4">
            <p className="font-medium text-ink-800">Can I run more than one intake for the same project?</p>
            <p className="mt-1 text-sm text-ink-500">
              Yes — from the project&apos;s page, click &ldquo;Start new intake session.&rdquo;
              Useful for a re-scope, or when the original was incomplete.
            </p>
          </div>
          <div className="py-4">
            <p className="font-medium text-ink-800">Can I edit answers after generating a package?</p>
            <p className="mt-1 text-sm text-ink-500">
              Yes, via &ldquo;Edit answers&rdquo; on the results page — but editing doesn&apos;t
              automatically regenerate the package. Generate again to produce an updated one.
            </p>
          </div>
          <div className="py-4">
            <p className="font-medium text-ink-800">Who can see a project&apos;s intake data?</p>
            <p className="mt-1 text-sm text-ink-500">
              Only the account that created it. Projects, intake sessions, and packages are
              scoped to the logged-in user who created them.
            </p>
          </div>
          <div className="py-4">
            <p className="font-medium text-ink-800">How do I know if the customer or I filled something in?</p>
            <p className="mt-1 text-sm text-ink-500">
              The Intake Session tab on the project&apos;s page shows a filled badge — navy
              &ldquo;Filled in by you&rdquo; when you ran it live, or teal &ldquo;Filled in by
              [name]&rdquo; when a customer used the share link. See{" "}
              <a href="#paths" className="underline">
                Two ways in
              </a>{" "}
              above.
            </p>
          </div>
        </div>
      </section>

      <p className="text-xs text-ink-400">
        Start a new project from{" "}
        <Link href="/projects" className="underline">
          Projects
        </Link>
        .
      </p>
    </div>
  );
}
