# Version history

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
