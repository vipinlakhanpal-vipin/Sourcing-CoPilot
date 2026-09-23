# Version history

## 0.1.0 — 2026-09-22
Initial MVP build.
- Self-service email+password auth (own `users` table, bcrypt + signed session cookie, not Supabase Auth)
- Customer/opportunity list (`customers` table)
- Guided, chat-style 7-area intake flow (`intake_sessions`), one area at a time, progress bar, edit-any-step
- Deterministic required-field validation before generation is allowed
- Claude-generated configuration package (readable markdown doc + structured JSON), with AI-flagged gaps/inconsistencies (`config_packages`)
- Results page: rendered markdown doc, flagged items, JSON download for the integration agent / implementation team
- Industry-agnostic only — no industry-specific question branching yet (per MVP scope)
