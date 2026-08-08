# Agentel AI

Multi-tenant SaaS platform for AI voice agents and cloud telephony.

Businesses create AI agents that answer inbound calls, place outbound calls, understand speech, book appointments, capture leads, transfer to humans, and connect to external systems.

## Current delivery (Phases 1–4+)

- **Phase 1:** Auth, organizations/roles, schema + RLS, dashboard shell, provider abstractions
- **Phase 2:** Agent CRUD + 8-step visual builder + browser Test Agent
- **Phase 3:** Twilio inbound/outbound webhooks, Media Streams TwiML, OpenAI Realtime provider + standalone voice gateway (`npm run voice-gateway`)
- **Phase 4+:** Call history/detail (transcripts/summaries), knowledge ingestion + chunking, integrations marketplace, analytics, Stripe billing scaffold, public REST API (`/api/v1/*`)

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/PHASES_2_4.md](docs/PHASES_2_4.md).

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Next.js route handlers / server actions |
| Database + Auth | Supabase (PostgreSQL, Auth, RLS, pgvector-ready) |
| Voice AI | OpenAI Realtime (Phase 3+) |
| Telephony | Twilio Programmable Voice / Media Streams (Phase 3+), SIP-ready abstraction |
| Payments | Stripe subscriptions + usage (Phase 7) |
| Hosting | Vercel frontend; Railway/Render/AWS-compatible voice gateway later |

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

With `NEXT_PUBLIC_DEMO_MODE=true` (default in `.env.example`), the dashboard renders with sample metrics and a demo organization.

### Enable real authentication

1. Create a Supabase project.
2. Apply SQL files in `supabase/migrations/` in order.
3. Set:

```bash
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

4. Configure Supabase Auth email templates / redirect URLs to `{APP_URL}/auth/callback`.

## Scripts

```bash
npm run dev            # Next.js app
npm run voice-gateway  # Twilio ↔ OpenAI realtime bridge
npm run build          # production build
npm run lint           # ESLint
npm run typecheck      # TypeScript
```

Demo API key for `/api/v1/*` when demo mode is enabled: `demo_agentel_key`

## Project structure

```
src/
  app/           # marketing, auth, dashboard, admin, API routes
  components/    # UI, layout, auth, dashboard components
  config/        # env, navigation, plans, roles
  lib/           # supabase, auth, validation, security utils
  providers/     # telephony / voice-ai / payments abstractions
  services/      # domain services
  types/         # shared TypeScript models
supabase/
  migrations/    # schema + RLS
docs/
  ARCHITECTURE.md
```

## Security notes

- Never expose OpenAI, Twilio, Stripe, or Supabase service-role keys to the browser.
- Tenant isolation is enforced with `organization_id` + Postgres RLS.
- Provider credentials are encrypted with `CREDENTIALS_ENCRYPTION_KEY`.
- API keys are stored hashed; webhook payloads are HMAC-signed.

## Roadmap

1. **Phase 1** — foundation, auth, orgs, schema, dashboard shell *(current)*
2. **Phase 2** — agent management + visual builder
3. **Phase 3** — Twilio inbound/outbound + OpenAI Realtime voice gateway
4. **Phase 4** — call history, transcripts, summaries, analytics
5. **Phase 5** — knowledge base + RAG
6. **Phase 6** — calendar, appointments, leads, human transfer
7. **Phase 7** — billing, developer API, webhooks, super-admin
