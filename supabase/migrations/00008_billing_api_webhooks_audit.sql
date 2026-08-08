create type public.subscription_plan as enum (
  'starter',
  'professional',
  'business',
  'enterprise'
);

create type public.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete'
);

create type public.webhook_event_type as enum (
  'call.started',
  'call.answered',
  'call.completed',
  'call.transferred',
  'lead.created',
  'appointment.created'
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  plan public.subscription_plan not null default 'starter',
  status public.subscription_status not null default 'trialing',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  included_minutes integer not null default 500,
  extra_minute_price_cents integer not null default 12,
  max_agents integer not null default 2,
  max_phone_numbers integer not null default 2,
  knowledge_storage_mb integer not null default 250,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.usage_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  metric text not null,
  quantity numeric not null,
  unit text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  scopes text[] not null default array['read'],
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.webhooks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  url text not null,
  secret text not null,
  events public.webhook_event_type[] not null default '{}',
  enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  actor_user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  ip_address inet,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index usage_records_org_period_idx on public.usage_records (organization_id, period_start, period_end);
create index api_keys_organization_id_idx on public.api_keys (organization_id);
create index webhooks_organization_id_idx on public.webhooks (organization_id);
create index audit_logs_organization_id_idx on public.audit_logs (organization_id);

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

create trigger usage_records_set_updated_at
before update on public.usage_records
for each row execute function public.set_updated_at();

create trigger api_keys_set_updated_at
before update on public.api_keys
for each row execute function public.set_updated_at();

create trigger webhooks_set_updated_at
before update on public.webhooks
for each row execute function public.set_updated_at();

create trigger audit_logs_set_updated_at
before update on public.audit_logs
for each row execute function public.set_updated_at();
