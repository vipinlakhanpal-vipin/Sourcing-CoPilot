# Sourcing CoPilot

Customer-facing intake tool that interviews a customer through a guided,
chat-style flow to scope their Coupa Sourcing deployment, then generates a
structured configuration package for SCP's implementation team. Stops short
of actual Coupa configuration or system integration.

## Stack

Next.js 14 App Router + TypeScript + Tailwind, Supabase (Postgres), Anthropic
API. Self-service email+password auth via an own `users` table (not Supabase
Auth) — same pattern as RFP CoPilot.

## Setup

1. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `SESSION_SECRET` (any long random string; used to sign session cookies)
2. In the Supabase SQL editor, run [`supabase/schema.sql`](supabase/schema.sql) against your project.
3. `npm install`
4. `npm run dev`

## Data model

| Table | Purpose |
| --- | --- |
| `users` | Self-service email+password auth |
| `customers` | One row per customer/opportunity |
| `intake_sessions` | In-progress or completed answers to the 7-area intake set |
| `config_packages` | Generated output (markdown + structured JSON) per completed intake |

## Intake areas

1. Sourcing categories & spend
2. Event types & volume
3. Evaluation & scoring
4. Approval workflow
5. Supplier base
6. Contract handoff
7. Current-state pain points

Question definitions live in a single place: [`lib/intake-schema.ts`](lib/intake-schema.ts).

## Scope

MVP is industry-agnostic — no industry-specific question branching yet. Actual
Coupa configuration and ERP/SFTP integration are explicitly out of scope
(handled by a separate integration agent, using this app's JSON export as input).
