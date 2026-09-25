# Version history

Versioning restarts here at **v1.0**, matching the in-app version badge (top-right of the
header). The badge shows the version baked into the visitor's currently loaded bundle; bump
`lib/version.ts` by +0.1 with every push, and the badge flags a red dot to anyone with an older
version still open in their browser, prompting a refresh. Prior entries below used a different
(0.x) numbering and are kept for history only.

## v2.5 — 2026-09-25
Consultant type can now be set at invite time.
- The "Invite a team member" form has a new "Consultant type" field (Coupa Functional, Technical,
  Integration, QA, etc., pulled from Settings → Roles). Picking one applies it automatically as
  soon as that person signs up, the same way the permission role already does, instead of only
  being assignable after the fact from the Admin Console table.
- Needs one migration first, see the handoff message for the exact SQL.

## v2.4 — 2026-09-25
Closed out the two remaining small items from the last round.
- Removed "SCP" from `README.md` (dev-facing project description), matching the copy and generated-
  document fix from v2.1.
- Replaced the bare "—" placeholder for empty values (name, location, member since, last signed in,
  the consultant-type dropdown) with "Not set" across Settings, the profile menu, and Admin Console,
  for the same plain-language reason as the dash cleanup in v2.2.

## v2.3 — 2026-09-25
Guide page copy fix.
- Handoff tab: "a human's begins" replaced with "a Consultant takes over," naming the actual role
  instead of a generic word.

## v2.2 — 2026-09-25
Human-sounding copy across the app, generic example names, and no exposed AI vendor name.
- Removed the placeholder "Annie" example from the Guide page's filled-in-by badge demo, replaced
  with the generic "Customer (Customer Name)" so it reads as a template, not a real person.
- The Guide page no longer says a package is sent "to Claude" — now "to the Sourcing CoPilot AI
  Agent," keeping the underlying model out of user-facing copy.
- Removed em dashes and en dashes from every user-facing sentence across the app (Guide, Dashboard,
  Settings, Admin Console, Roles, the intake flow, the Coupa connector's own messages, and the
  intake question copy itself), rewritten as plain sentences with periods and commas. The AI system
  prompt that writes each configuration package now explicitly instructs the model to do the same
  in the documents it generates, including spelling out number ranges ("20 to 30" instead of
  "20-30").
- Left the small "—" placeholder used for empty table/profile values (e.g. no location set) as is,
  since that is a standard UI convention, not the sentence-style issue this was about.

## v2.1 — 2026-09-25
Removed SCP branding from user-facing copy and generated documents.
- Guide page no longer references "SCP" — now reads "the Coupa implementation team" / "standard
  Coupa implementation practice."
- The AI system prompt that writes each configuration package no longer describes itself as
  working "at SCP" — this affects the tone of actually generated documents, not just in-app copy.

## v2.0 — 2026-09-25
Guide page rebuilt as a left-rail nav, Dashboard project charts, and a proper color palette.
- Guide page rebuilt again: replaced the anchor-link pill nav (which could scroll a section's
  title partly under the sticky header) with a carbon-navy left rail — same pattern as the intake
  flow's own step rail — so switching sections is instant with no scroll-jump possible. Sections
  renamed to be shorter and more precise: Overview, Process, Areas, Configuration, Handoff,
  Connection, FAQ. Content now sits in a light teal-tinted, rounded frame instead of a plain white
  box.
- Dashboard: removed the "Projects / View projects" card (redundant with the Projects tab) and
  replaced it with "Projects at a glance" — one mini bar chart per project showing two real KPIs,
  intake progress (steps completed out of 14) and whether a Coupa connection exists, with a
  Horizontal/Vertical toggle affecting every chart at once.
- Replaced the muted/desaturated area-accent palette from v1.9 (reported as looking dull and
  lifeless) with a proper jewel-tone palette — real vibrancy without tipping back into the
  earlier "kiddish" brightness. Used for the per-step message bubbles and the Areas grid alike.

## v1.9 — 2026-09-25
Guide page rebuilt for real, and a real "filled in by" differentiator.
- Guide page rebuilt to match the approved mockup: a carbon-navy hero, subtle standardized pill
  navigation (matching Settings' own tab style), colored section titles, every section in a
  consistent card frame, a muted-color grid for all 14 areas, and timeline-styled steps for
  "Generating a package" and "After you generate."
- New "Two ways the 14 areas get filled in" section — explains both paths (you fill it in live vs.
  a customer uses the self-service link) side by side, including what each looks like once filled.
- Real feature, not just documentation: the Intake Session panel now shows a filled badge — navy
  "Filled in by you (Consultant)" when a rep ran it, teal "Filled in by [name] (Customer)" when a
  customer used the share link — driven by whether a respondent name was captured.
- Unified the per-step message-bubble colors and the Guide page's area-grid colors onto one
  shared, muted 8-color palette (`AREA_HUES` in `lib/intake-schema.ts`) instead of two separate,
  brighter palettes.

## v1.8 — 2026-09-25
Project detail refinements, new logo.
- Project detail page: only two primary tabs now — Intake Session and Coupa Connection — with the
  Coupa Connection frame appearing only once that tab is clicked, not shown by default.
- "Start new intake session" moved up next to the project name; the tab-row toolbar now holds just
  Copy customer link and Continue intake.
- Coupa Connection's panel now uses the exact same carbon-fibre-strip header as Intake Session,
  instead of its own separate teal-pill/teal-border treatment — the two panels are visually
  consistent with each other.
- Projects list: "All projects" heading in brand teal; each project name is now a filled, clearly
  clickable navy cell instead of plain text with no hover affordance.
- New logo mark ("Spark to Spec" — an AI spark resolving into two document lines) replaces the
  previous compass/sparkle mark, built into `components/BrandMark.tsx`.

## v1.7 — 2026-09-24
Projects list redesign, Coupa-style project tabs, left-rail intake nav, and a Roles system.
- Projects list: colored status pills (Active/Pending/Inactive) and filled colored icon buttons
  (View/Edit/Delete) replace the plain link row; Edit opens a modal (name/notes/status), Delete
  removes the project and everything under it.
- Project detail page rebuilt around Coupa's own two-tier tab pattern: primary tabs (Overview /
  Intake Sessions / Coupa Connection) with a filled dark pill for the active one and a rule line
  underneath, sub-tabs per intake session with a colored underline when there's more than one.
  Overview shows the Intake Session (carbon-navy header) and Coupa Connection (teal header) as two
  clearly distinct panels, with every action — Copy customer link, Start new intake session,
  Continue intake — a filled colored cell instead of a plain link.
- Intake flow navigation rebuilt as a left-rail: all 14 steps are always visible down the left
  side, the active step's form fills the wider right pane — replacing the old horizontal
  scrolling strip.
- Each intake step's intro message now has its own solid color (cycling through 8 hues) instead
  of a flat gray bubble, so consecutive steps visibly stand apart.
- Three-tier permission system: Standard / Admin / Super Admin (only a Super Admin can grant
  Super Admin, from Admin Console).
- New "Roles" tab under Settings (Super Admin only): define consultant-type labels — Coupa
  Functional Consultant, Technical Consultant, Integration Consultant, QA Consultant, or any
  other title — which Admin Console can then assign to any user.
- Profile menu: shows join date, and location is now editable there directly (defaults to the
  city/country detected at your last login, or type your own).
- Needs two migrations before the status pills, Admin Console role changes, and Roles tab work —
  see the handoff message for the exact SQL.

## v1.6 — 2026-09-24
Filled-color data entry, filled section titles, and a dedicated Projects tab.
- Every text/textarea/select where an answer actually gets typed — the Coupa Test connection
  form and all 14 intake areas — now has a solid navy fill instead of a plain white box, so a
  field reads unmistakably as "type here." Section titles (e.g. "Industry & business context",
  "Coupa Test connection") are now solid teal pills, matching the same filled-title treatment
  already used on Admin Console's "Invite a team member" heading.
- Split the customer/opportunity list out of Dashboard into its own "Projects" primary tab (own
  page at /projects) — Dashboard now shows KPIs plus a link into it, matching the same pattern
  used earlier to give Dashboard its own tab instead of it being the implicit home.

## v1.5 — 2026-09-24
Visual identity rebuilt to match RFP CoPilot; real Admin Console under Settings.
- Pulled RFP CoPilot's actual source (not screenshots) and matched it directly: Nunito
  replaces the Fraunces/IBM Plex pairing app-wide; the brass/ledger-navy palette is replaced
  with RFP CoPilot's own navy (#1F3864) + teal (#2FB8A6); the nav bar and every page banner now
  use the same dark "carbon-navy" weave-and-glow treatment (glass pill tabs, gradient active
  state, breathing glow, hover sheen) as RFP CoPilot's header and hero cards.
- Added a real light/dark mode toggle (sun/moon button in the nav) instead of only following
  the OS preference — same mechanism as RFP CoPilot's Settings -> Appearance, applied instantly
  and persisted per-browser.
- Settings is now pill sub-tabs — Account, Appearance, and (admin only) Admin Console — matching
  RFP CoPilot's exact pattern instead of a single static page.
- Admin Console is real, working functionality: two roles (Standard/Admin), a users table with
  role/join-date/last-signed-in/location and per-row role changes and delete, and an invite flow
  that records a pending invitation and hands back a copy-paste message (applied automatically
  as soon as that email signs up) — no email service is wired up yet, matching how RFP CoPilot's
  own invite flow works today.
- Needs one migration before Admin Console is usable — see the handoff message for the exact SQL,
  including the one-line update to make your own account an Admin.

## v1.4 — 2026-09-24
Primary nav, profile menu, account settings, and full dark-mode support.
- "Dashboard" was only reachable via the brand-name link, making it read as the app's implicit home rather than one section among several. Added an explicit tab strip (Guide, Dashboard, Settings) with active-state highlighting so Dashboard sits alongside the others as an equal, not the default the whole app centers on.
- Replaced the raw email address in the header with a profile menu: an avatar showing initials, opening on click to show name, email, and the city/country the account last signed in from (captured server-side from Vercel's geo headers at login/signup), plus sign-out.
- Added a real Settings page (name, email, member-since, last-signed-in-from) as the foundation for Team/roles once that scope is settled.
- Added full light/dark mode: every color in the app now resolves through theme tokens that redefine themselves under `prefers-color-scheme: dark` (or an explicit override), so text and surfaces stay correctly legible switching either direction — no separate dark build, no washed-out or invisible text.
- Gave the top nav and the intake "Process" tab strip a dark, graphite ("carbon fibre") filled treatment with the active tab/step picked out in solid brass — a fixed, premium accent bar that reads the same in both themes, rather than a plain strip that recolors with the page.

## v1.3 — 2026-09-23
Visual identity, tabbed navigation, structured pick-lists, personalization.
- New ledger-navy/brass visual identity applied across the whole app: Fraunces display type + IBM Plex Sans/Mono, a brand color scale replacing the plain black/slate palette, a logo mark, and a diagonal-textured page banner
- Dashboard now shows real KPI tiles (total customers, intakes in progress, packages generated) instead of just a bare list
- Intake navigation reworked into a Coupa-style tab strip: clicking a step shows only that step's content — no more accumulating chat-bubble history down the page. The final step shows a compact checklist of all areas before generating
- "RFx & event templates by category" converted from a freeform paragraph into a structured repeatable rule builder (category + spend threshold + multi-select event types + rigor), matching the same list-and-add-row pattern as the named roster
- Reverse/forward auction usage split into structured multi-selects (which categories, which auction type, trigger condition) instead of one free-text paragraph; "Forward auction" added as a first-class event type throughout
- ERP name and PO-issuing system are now dropdowns of named systems (SAP S/4HANA, Oracle NetSuite, Microsoft Dynamics 365, Workday, etc.) instead of free text
- Every question addressing "the customer" now uses the actual customer name (e.g. "What industry is Acme Distribution in?") via a `{{customer}}` template token resolved at render time
- Fixed a real bug surfaced during testing: the AI's `flags` output occasionally came back as a malformed string instead of an array, which crashed the results page — generation now validates and recovers the array defensively instead of trusting the model's output shape blindly
- Verified end-to-end: personalization, dynamic category dropdowns sourced from an earlier answer, the category-rules builder, ERP/PO dropdowns, tab-only navigation, and generation all confirmed working together on a fresh customer

## v1.2 — 2026-09-23
Deep-dive intake: templates, named roster, master data uploads.
- Intake expanded from 10 to 14 areas: RFx & event templates by category/spend, named approval &amp; grading roster, master data &amp; ERP integration, award/PO handoff
- New "roster" field type: repeatable list of named people (name, email, role, scope) for launch/award approvers and technical/commercial graders — wired by name and email into the generated Approval Workflow and Evaluation &amp; Scoring sections, not just described as policy
- New "file" field type: CSV/XLSX upload for item/supplier/currency master data, stored in a private Supabase Storage bucket (`intake-uploads`) with a new `intake_uploads` tracking table; uploaded files are listed with a signed download link on the results page
- Generation prompt now cross-references named roles against thresholds (flagging missing approvers), master-data completeness, and the stated ERP/PO handoff preference
- Intake area navigation replaced with a Coupa-style two-tier tab pattern (a "Process" strip of sub-tabs with a separator, checkmarks for completed areas) to scale past the old flat progress-dots bar
- Verified end-to-end: 14 areas including a 3-person roster and a real file upload, generation correctly named Jane Doe/Sam Tech/Finn Ance into approval and scoring sections and caught a real gap (supplier master referenced but never uploaded)
- Researched Coupa's own 2026 Inspire announcements (Coupa Compose, Navi Agent Studio, Autonomous Sourcing Event Creation) — Coupa now ships native agentic sourcing automation inside the platform; this tool's distinct niche is the pre-implementation, partner-led discovery/scoping phase before Coupa is configured, not competing with Coupa's own in-platform agents

## v1.1 — 2026-09-23
Coupa connector — connection layer (no write actions yet).
- New `coupa_connections` table: one OAuth2 client-credentials connection per customer per environment, client secret encrypted at rest (`lib/crypto.ts`, AES-256-GCM, `COUPA_CREDENTIAL_ENCRYPTION_KEY`)
- `lib/coupa/auth.ts` implements Coupa's documented OAuth2 client-credentials token exchange (`POST /oauth2/token`) — the current auth method; legacy API keys are deprecated per Coupa's own docs
- `lib/coupa/client.ts` — `testConnection()` fetches a real token and makes one safe, read-only API call to confirm access; creates/changes nothing
- "Coupa Test connection" card on the customer page: save instance URL/client ID/secret/scope, then "Test connection" — verified against a real (deliberately invalid) URL end-to-end: encrypt → store → decrypt → real network attempt → clear diagnosable error surfaced in the UI, not a fake success
- Guide tab rewritten to state precisely what's real (a working, testable connection) vs. not yet built (no create/update actions against Coupa) — and the real constraint found in Coupa's own Sourcing API docs: creating an event requires an existing `source_id` (template), so full template creation isn't API-reachable per public documentation

## v1.0 — 2026-09-23
Self-service customer link + version indicator.
- Customer-facing self-service link (`/share/<token>`): a rep can copy a link from the customer's page instead of running the intake themselves — no login required for the customer, same 10-area flow, asks for the respondent's name (and optional email) first
- Generation stays rep-only: the share link ends in a plain "thanks, submitted" screen, never exposes the AI-generated package or its flags to the customer
- New customer creation now lands on the customer's page (showing both "Continue intake" and "Copy customer link") instead of assuming the rep will do the intake themselves
- In-app version badge next to the app name — polls for the currently deployed version and shows a red dot + refresh button when a visitor's open tab is behind the latest push

## 0.2.0 — 2026-09-23
Deeper intake + in-app Guide.
- In-app "Guide" tab explaining the intake → generation → human handoff flow, and explicitly what the app does not do (no Coupa connection today)
- Intake expanded from 7 to 10 areas: added Industry & business context, Supplier risk & geography, and an optional Broader Coupa landscape area
- Areas now tagged `sourcing` or `context` — context-only answers (interest in other Coupa modules, cross-module pain points) are captured but never turned into Sourcing configuration instructions
- Generation prompt now reasons per-category (spend value × supplier count × industry × risk profile) instead of giving identical guidance to every category, and closes with a separate "Beyond Sourcing (context only)" section
- Researched Coupa's public API/import surface: no live API for Sourcing setup objects (event templates, approval rules), but an SFTP flat-file import path exists for Commodity/Content Group/Supplier/Approval Group data — documented in the Guide as an unconfirmed but plausible automation path for a future phase

## 0.1.0 — 2026-09-22
Initial MVP build.
- Self-service email+password auth (own `users` table, bcrypt + signed session cookie, not Supabase Auth)
- Customer/opportunity list (`customers` table)
- Guided, chat-style 7-area intake flow (`intake_sessions`), one area at a time, progress bar, edit-any-step
- Deterministic required-field validation before generation is allowed
- Claude-generated configuration package (readable markdown doc + structured JSON), with AI-flagged gaps/inconsistencies (`config_packages`)
- Results page: rendered markdown doc, flagged items, JSON download for the integration agent / implementation team
- Industry-agnostic only — no industry-specific question branching yet (per MVP scope)
