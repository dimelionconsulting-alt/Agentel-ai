alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_settings enable row level security;
alter table public.agents enable row level security;
alter table public.phone_numbers enable row level security;
alter table public.agent_phone_numbers enable row level security;
alter table public.calls enable row level security;
alter table public.call_transcripts enable row level security;
alter table public.call_events enable row level security;
alter table public.call_actions enable row level security;
alter table public.contacts enable row level security;
alter table public.leads enable row level security;
alter table public.appointments enable row level security;
alter table public.knowledge_bases enable row level security;
alter table public.knowledge_documents enable row level security;
alter table public.knowledge_chunks enable row level security;
alter table public.integrations enable row level security;
alter table public.integration_credentials enable row level security;
alter table public.agent_tools enable row level security;
alter table public.tool_registry enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_records enable row level security;
alter table public.api_keys enable row level security;
alter table public.webhooks enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_platform_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Organizations
create policy "Members can view their organizations"
  on public.organizations for select
  using (public.is_org_member(id) or public.is_platform_admin());

create policy "Authenticated users can create organizations"
  on public.organizations for insert
  with check (auth.uid() is not null);

create policy "Admins can update organizations"
  on public.organizations for update
  using (public.has_org_role(id, array['owner', 'admin']) or public.is_platform_admin());

-- Memberships
create policy "Members can view memberships in their orgs"
  on public.organization_members for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Users can create owner membership for themselves"
  on public.organization_members for insert
  with check (
    auth.uid() = user_id
    or public.has_org_role(organization_id, array['owner', 'admin'])
    or public.is_platform_admin()
  );

create policy "Admins can update memberships"
  on public.organization_members for update
  using (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin());

create policy "Admins can delete memberships"
  on public.organization_members for delete
  using (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin());

-- Generic org-scoped helper policies
create policy "Org members can view organization_settings"
  on public.organization_settings for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Org admins can insert organization_settings"
  on public.organization_settings for insert
  with check (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin());

create policy "Org admins can update organization_settings"
  on public.organization_settings for update
  using (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin());

-- Agents
create policy "Org members can view agents"
  on public.agents for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Managers can write agents"
  on public.agents for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin());

-- Phone numbers
create policy "Org members can view phone_numbers"
  on public.phone_numbers for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Managers can write phone_numbers"
  on public.phone_numbers for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin());

create policy "Org members can view agent_phone_numbers"
  on public.agent_phone_numbers for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Managers can write agent_phone_numbers"
  on public.agent_phone_numbers for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin());

-- Calls and related
create policy "Org members can view calls"
  on public.calls for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Managers can write calls"
  on public.calls for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin());

create policy "Org members can view call_transcripts"
  on public.call_transcripts for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Managers can write call_transcripts"
  on public.call_transcripts for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin());

create policy "Org members can view call_events"
  on public.call_events for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Managers can write call_events"
  on public.call_events for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin());

create policy "Org members can view call_actions"
  on public.call_actions for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Managers can write call_actions"
  on public.call_actions for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin());

-- CRM
create policy "Org members can view contacts"
  on public.contacts for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Managers can write contacts"
  on public.contacts for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin());

create policy "Org members can view leads"
  on public.leads for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Managers can write leads"
  on public.leads for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin());

create policy "Org members can view appointments"
  on public.appointments for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Managers can write appointments"
  on public.appointments for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin());

-- Knowledge
create policy "Org members can view knowledge_bases"
  on public.knowledge_bases for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Managers can write knowledge_bases"
  on public.knowledge_bases for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin());

create policy "Org members can view knowledge_documents"
  on public.knowledge_documents for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Managers can write knowledge_documents"
  on public.knowledge_documents for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin());

create policy "Org members can view knowledge_chunks"
  on public.knowledge_chunks for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Managers can write knowledge_chunks"
  on public.knowledge_chunks for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin());

-- Integrations / tools
create policy "Org members can view integrations"
  on public.integrations for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Admins can write integrations"
  on public.integrations for all
  using (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin());

create policy "Admins can manage integration_credentials"
  on public.integration_credentials for all
  using (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin());

create policy "Org members can view agent_tools"
  on public.agent_tools for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Managers can write agent_tools"
  on public.agent_tools for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'agent_manager']) or public.is_platform_admin());

create policy "Authenticated users can read tool_registry"
  on public.tool_registry for select
  using (auth.uid() is not null or public.is_platform_admin());

-- Billing / API / webhooks / audit
create policy "Org members can view subscriptions"
  on public.subscriptions for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Admins can write subscriptions"
  on public.subscriptions for all
  using (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin());

create policy "Org members can view usage_records"
  on public.usage_records for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());

create policy "Admins can write usage_records"
  on public.usage_records for all
  using (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin());

create policy "Admins can manage api_keys"
  on public.api_keys for all
  using (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin());

create policy "Admins can manage webhooks"
  on public.webhooks for all
  using (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin())
  with check (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin());

create policy "Admins can view audit_logs"
  on public.audit_logs for select
  using (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin());

create policy "Admins can insert audit_logs"
  on public.audit_logs for insert
  with check (public.has_org_role(organization_id, array['owner', 'admin']) or public.is_platform_admin());
