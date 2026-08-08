# Voxora AI — Architecture

## Overview

Voxora AI is a multi-tenant SaaS platform for AI voice agents and cloud telephony.
Businesses create AI agents that answer inbound calls, place outbound calls, book
appointments, capture leads, transfer to humans, and integrate with business systems.

## Phase 1 scope

- Project foundation (Next.js App Router, TypeScript, Tailwind CSS)
- Supabase authentication (sign up, sign in, forgot password, email verification, logout)
- Organizations + role-based membership (owner, admin, agent_manager, viewer)
- Complete relational database schema with RLS
- Dashboard shell and navigation for all primary modules
- Provider abstraction interfaces for telephony, voice AI, and payments

Later phases add live Twilio Media Streams, OpenAI Realtime, knowledge RAG,
integrations, billing, developer API, and the super-admin console.

## High-level system

```
┌─────────────┐     ┌──────────────────┐     ┌────────────────────┐
│  Browser UI │────▶│  Next.js (Vercel)│────▶│  Supabase (Auth +  │
│  Dashboard  │◀────│  App Router +    │◀────│  Postgres + RLS +  │
└─────────────┘     │  API Routes      │     │  pgvector)         │
                    └────────┬─────────┘     └────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
      TelephonyProvider  VoiceAIProvider  PaymentProvider
         (Twilio)         (OpenAI)         (Stripe)
```

## Multi-tenancy

- Every business entity belongs to an `organization`.
- Users join organizations through `organization_members` with a role.
- Row Level Security enforces `organization_id` isolation.
- API keys, webhooks, usage, billing, and audit logs are organization-scoped.
- Super-admin access is separate (`platform_admins`) and never mixes tenant data in the app UI.

## Provider abstractions

Provider-specific SDKs live behind interfaces so Twilio / OpenAI / Stripe can be
replaced or supplemented without rewriting product modules.

| Interface | First implementation | Future |
|---|---|---|
| `TelephonyProvider` | `TwilioTelephonyProvider` | European SIP providers |
| `VoiceAIProvider` | `OpenAIVoiceProvider` | Additional realtime models |
| `PaymentProvider` | `StripePaymentProvider` | Regional billing providers |

## Folder structure

```
src/
  app/                  # Next.js routes (marketing, auth, dashboard, admin, API)
  components/           # UI, layout, feature components
  config/               # App/nav/plans configuration
  lib/                  # Supabase clients, auth helpers, utils, validation
  providers/            # Telephony / Voice AI / Payments abstractions
  services/             # Domain services (orgs, agents, calls, …)
  types/                # Shared TypeScript domain types
  hooks/                # Client hooks
supabase/migrations/    # SQL migrations + RLS
docs/                   # Architecture and delivery notes
```

## Auth flow

1. User signs up with email/password via Supabase Auth.
2. Email verification link redirects to `/auth/callback`.
3. On first authenticated session, onboarding creates an organization and owner membership.
4. `proxy.ts` guards dashboard/admin routes and refreshes the auth session.
5. Role checks gate write actions in services and UI.

## Security principles

- Never expose OpenAI, Twilio, Stripe, or Supabase service-role keys to the browser.
- Encrypt provider credentials at rest.
- Prefer RLS for tenant isolation; service-role usage is server-only and audited.
- API keys are hashed; webhook deliveries are signed with HMAC secrets.
- GDPR controls: recording consent, retention, export, and deletion hooks.

## Deployment

- Frontend / API routes: Vercel
- Database / Auth: Supabase
- Long-running voice gateway (Phase 3+): Railway / Render / AWS-compatible Node service
  behind the same provider interfaces
