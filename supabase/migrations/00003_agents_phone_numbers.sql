create type public.agent_status as enum ('draft', 'active', 'paused');
create type public.phone_number_status as enum ('available', 'assigned', 'released');
create type public.telecom_provider as enum ('twilio', 'sip', 'other');

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  avatar_url text,
  status public.agent_status not null default 'draft',
  voice text not null default 'alloy',
  language text not null default 'en',
  additional_languages text[] not null default '{}',
  greeting_message text,
  system_prompt text,
  business_description text,
  objective text,
  conversation_style text,
  speaking_speed numeric(4,2) not null default 1.0,
  interruption_handling text not null default 'balanced',
  max_call_duration_seconds integer not null default 1800,
  silence_timeout_seconds integer not null default 10,
  transfer_phone_number text,
  transfer_conditions text[] not null default '{}',
  business_hours jsonb,
  emergency_transfer_enabled boolean not null default false,
  sms_follow_up_enabled boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.phone_numbers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  provider public.telecom_provider not null default 'twilio',
  e164 text not null,
  friendly_name text,
  country_code text not null default 'US',
  capabilities text[] not null default array['voice'],
  status public.phone_number_status not null default 'available',
  provider_sid text,
  inbound_enabled boolean not null default true,
  outbound_caller_id_enabled boolean not null default true,
  forwarding_number text,
  human_fallback_number text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, e164)
);

create table public.agent_phone_numbers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  agent_id uuid not null references public.agents (id) on delete cascade,
  phone_number_id uuid not null references public.phone_numbers (id) on delete cascade,
  is_primary boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (phone_number_id)
);

create index agents_organization_id_idx on public.agents (organization_id);
create index phone_numbers_organization_id_idx on public.phone_numbers (organization_id);
create index phone_numbers_e164_idx on public.phone_numbers (e164);
create index agent_phone_numbers_agent_id_idx on public.agent_phone_numbers (agent_id);

create trigger agents_set_updated_at
before update on public.agents
for each row execute function public.set_updated_at();

create trigger phone_numbers_set_updated_at
before update on public.phone_numbers
for each row execute function public.set_updated_at();

create trigger agent_phone_numbers_set_updated_at
before update on public.agent_phone_numbers
for each row execute function public.set_updated_at();
