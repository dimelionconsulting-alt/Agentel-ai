create type public.call_direction as enum ('inbound', 'outbound');

create type public.call_status as enum (
  'queued',
  'ringing',
  'in_progress',
  'completed',
  'missed',
  'failed',
  'busy',
  'canceled',
  'transferred'
);

create type public.call_outcome as enum (
  'resolved',
  'transferred',
  'appointment_booked',
  'lead_captured',
  'voicemail',
  'no_answer',
  'failed',
  'other'
);

create table public.calls (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  agent_id uuid references public.agents (id) on delete set null,
  phone_number_id uuid references public.phone_numbers (id) on delete set null,
  direction public.call_direction not null,
  status public.call_status not null default 'queued',
  outcome public.call_outcome,
  from_number text,
  to_number text,
  caller_name text,
  started_at timestamptz,
  answered_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer not null default 0,
  recording_url text,
  sentiment text,
  detected_intent text,
  summary text,
  cost_estimate_cents integer not null default 0,
  provider public.telecom_provider not null default 'twilio',
  provider_call_sid text,
  transferred_to text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.call_transcripts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  call_id uuid not null unique references public.calls (id) on delete cascade,
  content text not null default '',
  segments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.call_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  call_id uuid not null references public.calls (id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.call_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  call_id uuid not null references public.calls (id) on delete cascade,
  action_type text not null,
  tool_name text,
  input jsonb,
  output jsonb,
  success boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index calls_organization_id_idx on public.calls (organization_id);
create index calls_started_at_idx on public.calls (started_at desc);
create index calls_provider_call_sid_idx on public.calls (provider_call_sid);
create index call_events_call_id_idx on public.call_events (call_id);
create index call_actions_call_id_idx on public.call_actions (call_id);

create trigger calls_set_updated_at
before update on public.calls
for each row execute function public.set_updated_at();

create trigger call_transcripts_set_updated_at
before update on public.call_transcripts
for each row execute function public.set_updated_at();

create trigger call_events_set_updated_at
before update on public.call_events
for each row execute function public.set_updated_at();

create trigger call_actions_set_updated_at
before update on public.call_actions
for each row execute function public.set_updated_at();
