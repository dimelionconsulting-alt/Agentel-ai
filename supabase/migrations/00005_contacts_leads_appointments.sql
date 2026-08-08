create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text,
  phone text,
  email text,
  company text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  call_id uuid references public.calls (id) on delete set null,
  agent_id uuid references public.agents (id) on delete set null,
  name text,
  phone text,
  email text,
  company text,
  interest text,
  notes text,
  qualification_score integer,
  status text not null default 'new',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,
  call_id uuid references public.calls (id) on delete set null,
  agent_id uuid references public.agents (id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'UTC',
  status text not null default 'scheduled',
  location text,
  notes text,
  external_calendar_event_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index contacts_organization_id_idx on public.contacts (organization_id);
create index leads_organization_id_idx on public.leads (organization_id);
create index appointments_organization_id_idx on public.appointments (organization_id);
create index appointments_starts_at_idx on public.appointments (starts_at);

create trigger contacts_set_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();
