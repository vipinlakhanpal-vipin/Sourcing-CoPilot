"use client";

import { useState } from "react";
import Link from "next/link";
import { AREA_HUES, INTAKE_AREAS } from "@/lib/intake-schema";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "process", label: "Process" },
  { key: "areas", label: "Areas" },
  { key: "config", label: "Configuration" },
  { key: "handoff", label: "Handoff" },
  { key: "connection", label: "Connection" },
  { key: "faq", label: "FAQ" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 rounded-2xl border border-brand-200 bg-brand-50 p-5">{children}</div>;
}

function InnerCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl bg-surface p-5 text-sm text-ink-700">{children}</div>;
}

export default function GuidePage() {
  const [tab, setTab] = useState<TabKey>("overview");

  return (
    <div>
      <div className="hero-carbon mb-5 rounded-xl p-6">
        <h1 className="font-display text-2xl text-white">How Sourcing CoPilot works</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-white/70">
          One place to learn the flow before you connect with a customer or send a link.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-[200px_1fr]">
        <nav className="side-rail strip-carbon md:sticky md:top-20 md:self-start">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`side-item ${tab === t.key ? "side-item--active" : ""}`}
            >
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {tab === "overview" && (
            <Frame>
              <h2 className="text-lg font-extrabold text-brand-700">Overview</h2>
              <InnerCard>
                <p>
                  Sourcing CoPilot takes a customer from &ldquo;we want Coupa Sourcing&rdquo; to a
                  fully specified, ready-to-configure setup. It interviews the customer through{" "}
                  {INTAKE_AREAS.length} guided areas, then generates a structured{" "}
                  <strong>configuration package</strong> — a readable document plus the underlying
                  structured data — for SCP&apos;s implementation team.
                </p>
                <div className="mt-3 rounded-md border border-ink-100 bg-ink-50 p-3 text-ink-500">
                  It produces a specification of what to build in Coupa, and can now connect to a
                  real Coupa tenant to confirm access — but does not yet create or change anything
                  inside Coupa. See{" "}
                  <button onClick={() => setTab("connection")} className="underline">
                    Connection
                  </button>
                  .
                </div>
              </InnerCard>
            </Frame>
          )}

          {tab === "process" && (
            <Frame>
              <h2 className="text-lg font-extrabold text-brand-700">Process</h2>
              <InnerCard>
                <p className="mb-3">
                  Two ways the {INTAKE_AREAS.length} areas get filled in — same areas, same
                  generated package either way. The only difference is who&apos;s typing and how
                  they get there.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="overflow-hidden rounded-lg border border-ink-100">
                    <div className="flex items-center gap-2 bg-ink-800 px-4 py-3 text-white">
                      <span>🧑‍💼</span>
                      <span className="text-sm font-bold">You fill it in with the customer</span>
                    </div>
                    <div className="space-y-2 bg-surface p-4 text-sm">
                      <ol className="list-decimal space-y-1.5 pl-5">
                        <li>
                          Open the project, click <strong>Continue intake</strong>
                        </li>
                        <li>Walk through the areas live — call, workshop, however you run discovery</li>
                        <li>Answers save after every &ldquo;Continue,&rdquo; under your own account</li>
                      </ol>
                      <div className="mt-3 border-t border-dashed border-ink-100 pt-3">
                        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-400">
                          Shows on the project page as
                        </p>
                        <span className="fill-badge fill-badge--consultant">👤 Filled in by you (Consultant)</span>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-brand-200">
                    <div className="flex items-center gap-2 bg-brand-600 px-4 py-3 text-white">
                      <span>🔗</span>
                      <span className="text-sm font-bold">Customer fills it in themselves</span>
                    </div>
                    <div className="space-y-2 bg-surface p-4 text-sm">
                      <ol className="list-decimal space-y-1.5 pl-5">
                        <li>
                          Click <strong>Copy customer link</strong> and send it
                        </li>
                        <li>They type their name (no login needed) and work through it on their own time</li>
                        <li>Progress saves automatically — they can resume later from the same link</li>
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
                <div className="mt-3 rounded-md border border-ink-100 bg-ink-50 p-3 text-ink-600">
                  <strong className="text-ink-800">Either way:</strong> the intake still shows
                  &ldquo;in progress&rdquo; until you generate the package yourself — that step is
                  always rep-only, even after a customer finishes their side.
                </div>
              </InnerCard>
            </Frame>
          )}

          {tab === "areas" && (
            <Frame>
              <h2 className="text-lg font-extrabold text-brand-700">Areas</h2>
              <InnerCard>
                <p className="mb-3">
                  {INTAKE_AREAS.length} areas, one per screen. Each gets its own accent as you move
                  through the left-hand rail — the dashed outline marks the one area that&apos;s
                  context-only and never becomes Sourcing configuration.
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {INTAKE_AREAS.map((area, i) => (
                    <div
                      key={area.id}
                      className={`rounded-lg p-3 text-white ${
                        area.scope === "context" ? "outline outline-2 -outline-offset-2 outline-white/45" : ""
                      }`}
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
              </InnerCard>
            </Frame>
          )}

          {tab === "config" && (
            <Frame>
              <h2 className="text-lg font-extrabold text-brand-700">Configuration</h2>
              <InnerCard>
                <p className="mb-3">
                  Once all {INTAKE_AREAS.length} areas are complete, a review screen lists
                  everything entered. Clicking <strong>Generate configuration package</strong>{" "}
                  sends those answers to Claude, which takes roughly 20–30 seconds to:
                </p>
                <div className="timeline">
                  <div className="tstep">
                    <b>Write implementation-ready guidance per area</b>
                    reasoning about each category&apos;s spend, supplier count, industry, and risk
                    together, so a high-risk Direct-materials category gets different guidance than
                    a low-risk Services category.
                  </div>
                  <div className="tstep">
                    <b>Flag gaps for the team to confirm</b>
                    e.g. a supplier count that doesn&apos;t reconcile with the master list, or
                    scoring criteria with no assigned weights.
                  </div>
                  <div className="tstep">
                    <b>Keep context-only separate</b>
                    closes with a &ldquo;Beyond Sourcing (context only)&rdquo; section — never
                    mixed into the Sourcing configuration guidance above it.
                  </div>
                </div>
                <p className="mt-3 text-ink-500">
                  The result is saved permanently against that intake session, so you can revisit
                  it later from the project&apos;s page.
                </p>
              </InnerCard>
            </Frame>
          )}

          {tab === "handoff" && (
            <Frame>
              <h2 className="text-lg font-extrabold text-brand-700">Handoff</h2>
              <InnerCard>
                <p className="mb-3">This is where the app&apos;s job ends and a human&apos;s begins:</p>
                <div className="timeline">
                  <div className="tstep">
                    <b>Download &amp; share</b>
                    the structured data (JSON) and the rendered document, to SCP&apos;s
                    implementation team or the integration agent if ERP/SFTP work is in scope.
                  </div>
                  <div className="tstep">
                    <b>Build it in Coupa Test</b>
                    an implementation consultant manually builds categories, event templates,
                    scoring rubrics, approval chains, and supplier tiers, using the package as the
                    spec.
                  </div>
                  <div className="tstep">
                    <b>Customer validates</b>
                    the Test configuration against real scenarios.
                  </div>
                  <div className="tstep">
                    <b>Promote to Production</b>
                    via Coupa&apos;s own environment-promotion tooling or a manual rebuild,
                    following SCP&apos;s standard implementation practice.
                  </div>
                </div>
              </InnerCard>
            </Frame>
          )}

          {tab === "connection" && (
            <Frame>
              <h2 className="text-lg font-extrabold text-brand-700">Connection</h2>
              <InnerCard>
                <div className="space-y-3">
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <p className="font-medium">Built and working: a real, testable connection to a Coupa tenant.</p>
                    <p className="mt-1">
                      &ldquo;Coupa Test connection&rdquo; stores an OAuth2 client-credentials
                      connection (instance URL, client ID/secret, scope) — the current, documented
                      Coupa authentication method. &ldquo;Test connection&rdquo; exchanges those
                      credentials for a real access token and makes one safe, read-only call to
                      confirm API access. Nothing is created, changed, or deleted by this.
                    </p>
                  </div>
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    <p className="font-medium">Not yet built: anything that writes to Coupa.</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      <li>No categories, suppliers, events, or approval rules are created or modified.</li>
                      <li>No configuration is copied or promoted between Coupa environments.</li>
                    </ul>
                    <p className="mt-2">
                      Per Coupa&apos;s own published Sourcing API, creating an event requires a{" "}
                      <code>source_id</code> — an existing event/template already built in
                      Coupa&apos;s UI — so full template creation from nothing does not appear to
                      be API-reachable. This is based on public documentation, not a live test
                      against a real tenant, so treat it as informed, not certain.
                    </p>
                  </div>
                </div>
              </InnerCard>
            </Frame>
          )}

          {tab === "faq" && (
            <Frame>
              <h2 className="text-lg font-extrabold text-brand-700">FAQ</h2>
              <InnerCard>
                <div className="divide-y divide-ink-100">
                  <div className="pb-4">
                    <p className="font-medium text-ink-800">Can I run more than one intake for the same project?</p>
                    <p className="mt-1 text-ink-500">
                      Yes — from the project&apos;s page, click &ldquo;Start new intake
                      session.&rdquo; Useful for a re-scope, or when the original was incomplete.
                    </p>
                  </div>
                  <div className="py-4">
                    <p className="font-medium text-ink-800">Can I edit answers after generating a package?</p>
                    <p className="mt-1 text-ink-500">
                      Yes, via &ldquo;Edit answers&rdquo; on the results page — but editing
                      doesn&apos;t automatically regenerate the package. Generate again for an
                      updated one.
                    </p>
                  </div>
                  <div className="py-4">
                    <p className="font-medium text-ink-800">Who can see a project&apos;s intake data?</p>
                    <p className="mt-1 text-ink-500">
                      Only the account that created it — everything is scoped to the logged-in
                      user.
                    </p>
                  </div>
                  <div className="pt-4">
                    <p className="font-medium text-ink-800">How do I know if the customer or I filled something in?</p>
                    <p className="mt-1 text-ink-500">
                      The Intake Session tab on the project&apos;s page shows a filled badge — navy
                      &ldquo;Filled in by you&rdquo; when you ran it live, or teal &ldquo;Filled in
                      by [name]&rdquo; when a customer used the share link. See{" "}
                      <button onClick={() => setTab("process")} className="underline">
                        Process
                      </button>
                      .
                    </p>
                  </div>
                </div>
              </InnerCard>
            </Frame>
          )}

          <p className="mt-4 text-xs text-ink-400">
            Start a new project from{" "}
            <Link href="/projects" className="underline">
              Projects
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
