# Version history

Versioning restarts here at **v1.0**, matching the in-app version badge (top-right of the
header). The badge shows the version baked into the visitor's currently loaded bundle; bump
`lib/version.ts` by +0.1 with every push, and the badge flags a red dot to anyone with an older
version still open in their browser, prompting a refresh. Prior entries below used a different
(0.x) numbering and are kept for history only.

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
