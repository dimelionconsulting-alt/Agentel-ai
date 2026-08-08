create type public.knowledge_document_type as enum (
  'text',
  'faq',
  'website',
  'pdf',
  'docx',
  'txt'
);

create type public.knowledge_document_status as enum (
  'pending',
  'processing',
  'ready',
  'failed'
);

create table public.knowledge_bases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  agent_id uuid references public.agents (id) on delete set null,
  name text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  knowledge_base_id uuid not null references public.knowledge_bases (id) on delete cascade,
  title text not null,
  document_type public.knowledge_document_type not null,
  source_url text,
  storage_path text,
  status public.knowledge_document_status not null default 'pending',
  raw_content text,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  document_id uuid not null references public.knowledge_documents (id) on delete cascade,
  knowledge_base_id uuid not null references public.knowledge_bases (id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  token_count integer,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index knowledge_bases_organization_id_idx on public.knowledge_bases (organization_id);
create index knowledge_documents_kb_id_idx on public.knowledge_documents (knowledge_base_id);
create index knowledge_chunks_kb_id_idx on public.knowledge_chunks (knowledge_base_id);
-- Vector ANN index is created in Phase 5 once embeddings are populated:
-- create index knowledge_chunks_embedding_ivfflat_idx
--   on public.knowledge_chunks
--   using ivfflat (embedding vector_cosine_ops)
--   with (lists = 100);

create trigger knowledge_bases_set_updated_at
before update on public.knowledge_bases
for each row execute function public.set_updated_at();

create trigger knowledge_documents_set_updated_at
before update on public.knowledge_documents
for each row execute function public.set_updated_at();

create trigger knowledge_chunks_set_updated_at
before update on public.knowledge_chunks
for each row execute function public.set_updated_at();
