# Agentel AI — Phases 2–4 Architecture

## Phase 2 — Agent builder + configuration

- Domain service: `src/services/agents.ts` (CRUD, status transitions, tool assignment)
- Zod schemas: `src/lib/validations/agents.ts`
- Multi-step client builder: `src/components/agents/agent-builder.tsx`
- Routes: `/agents`, `/agents/new`, `/agents/[agentId]`
- Browser Test Agent uses ephemeral OpenAI Realtime credentials from `/api/voice/realtime-session`

## Phase 3 — Twilio Media Streams + OpenAI Realtime

Inbound path:

```
Caller → Twilio number → /api/telephony/voice/inbound
  → TwiML <Stream> → Voice Gateway (WebSocket)
  → OpenAI Realtime ↔ caller audio
```

- Twilio webhooks: `src/app/api/telephony/**`
- Provider implementations fleshed out in `src/providers/**`
- Standalone gateway: `src/server/voice-gateway` (`npm run voice-gateway`)
- Agent resolved by dialed `To` number via `agent_phone_numbers`

## Phase 4+ — Calls, knowledge, integrations, billing, API

- Call history + detail with transcript/summary/sentiment
- Knowledge documents → chunks → embeddings (pgvector-ready)
- Integrations marketplace + tool registry wiring
- Stripe checkout/portal scaffolding
- Versioned REST API under `/api/v1/*` with API keys + rate limits
