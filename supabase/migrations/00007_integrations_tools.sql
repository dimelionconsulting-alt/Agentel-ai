create type public.integration_provider as enum (
  'google_calendar',
  'outlook_calendar',
  'hubspot',
  'salesforce',
  'zapier',
  'webhook',
  'custom_rest'
);

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  provider public.integration_provider not null,
  name text not null,
  status text not null default 'disconnected',
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.integration_credentials (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  integration_id uuid not null unique references public.integrations (id) on delete cascade,
  encrypted_payload text not null,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.agent_tools (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  agent_id uuid not null references public.agents (id) on delete cascade,
  tool_name text not null,
  display_name text not null,
  description text,
  enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (agent_id, tool_name)
);

create table public.tool_registry (
  id uuid primary key default gen_random_uuid(),
  tool_name text not null unique,
  display_name text not null,
  description text not null,
  parameter_schema jsonb not null default '{}'::jsonb,
  is_system boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.tool_registry (tool_name, display_name, description) values
  ('check_calendar', 'Check calendar', 'Check availability in connected calendars'),
  ('book_appointment', 'Book appointment', 'Create a confirmed appointment'),
  ('create_lead', 'Create lead', 'Capture a qualified lead'),
  ('lookup_customer', 'Lookup customer', 'Find an existing customer record'),
  ('check_order_status', 'Check order status', 'Lookup order status by identifier'),
  ('transfer_call', 'Transfer call', 'Transfer the active call to a human'),
  ('send_sms', 'Send SMS', 'Send an SMS follow-up message'),
  ('trigger_webhook', 'Trigger webhook', 'Invoke a configured webhook endpoint');

create index integrations_organization_id_idx on public.integrations (organization_id);
create index agent_tools_agent_id_idx on public.agent_tools (agent_id);

create trigger integrations_set_updated_at
before update on public.integrations
for each row execute function public.set_updated_at();

create trigger integration_credentials_set_updated_at
before update on public.integration_credentials
for each row execute function public.set_updated_at();

create trigger agent_tools_set_updated_at
before update on public.agent_tools
for each row execute function public.set_updated_at();

create trigger tool_registry_set_updated_at
before update on public.tool_registry
for each row execute function public.set_updated_at();
