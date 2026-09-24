# Version history

Versioning restarts here at **v1.0**, matching the in-app version badge (top-right of the
header). The badge shows the version baked into the visitor's currently loaded bundle; bump
`lib/version.ts` by +0.1 with every push, and the badge flags a red dot to anyone with an older
version still open in their browser, prompting a refresh. Prior entries below used a different
(0.x) numbering and are kept for history only.

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
