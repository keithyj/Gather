-- Gather private-housewarming baseline. Apply only to local or non-production Supabase projects.
-- Exact address plaintext is intentionally absent from this schema: the application stores AES-GCM ciphertext only.

create extension if not exists pgcrypto;

create type public.event_status as enum ('draft', 'active', 'cancelled', 'completed');
create type public.plus_one_policy as enum ('none', 'selected', 'all');
create type public.invitation_status as enum ('pending', 'accepted', 'rejected', 'revoked', 'expired');
create type public.membership_role as enum ('host', 'guest', 'plus_one');
create type public.membership_approval_status as enum ('requested', 'approved', 'declined', 'removed');
create type public.rsvp_status as enum ('unknown', 'going', 'maybe', 'not_going');
create type public.connection_status as enum ('pending', 'accepted', 'blocked');
create type public.plus_one_request_status as enum ('pending', 'approved', 'declined', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 80),
  pronouns text check (pronouns is null or char_length(pronouns) <= 80),
  avatar_path text check (avatar_path is null or char_length(avatar_path) <= 500),
  age_over_18 boolean not null default false,
  verification_level smallint not null default 0 check (verification_level between 0 and 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trusted_connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status public.connection_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  host_user_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 3 and 80),
  description text not null check (char_length(trim(description)) between 12 and 500),
  event_type text not null default 'housewarming' check (event_type = 'housewarming'),
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text not null check (char_length(timezone) between 1 and 80),
  broad_area text not null check (char_length(trim(broad_area)) between 2 and 80),
  capacity integer not null check (capacity between 2 and 100),
  status public.event_status not null default 'active',
  plus_one_policy public.plus_one_policy not null default 'selected',
  dietary_collection boolean not null default true,
  alcohol_present boolean not null default false,
  accessibility_note text check (accessibility_note is null or char_length(accessibility_note) <= 240),
  attendee_list_visibility boolean not null default false,
  is_private boolean not null default true check (is_private),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

-- This table is intentionally narrow. It never stores an address or entry instructions as plaintext.
create table public.event_sensitive_details (
  event_id uuid primary key references public.events(id) on delete cascade,
  exact_address_ciphertext text not null check (char_length(exact_address_ciphertext) > 40),
  entry_instructions_ciphertext text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  inviter_user_id uuid not null references public.profiles(id) on delete restrict,
  invitee_user_id uuid not null references public.profiles(id) on delete cascade,
  status public.invitation_status not null default 'pending',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (event_id, invitee_user_id)
);

create table public.event_memberships (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.membership_role not null default 'guest',
  approval_status public.membership_approval_status not null default 'requested',
  rsvp_status public.rsvp_status not null default 'unknown',
  can_request_plus_one boolean not null default false,
  introduced_by_membership_id uuid references public.event_memberships(id) on delete set null,
  dietary_notes text,
  accessibility_notes text,
  approved_at timestamptz,
  removed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, user_id),
  check ((approval_status = 'approved') = (approved_at is not null))
);

create table public.plus_one_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  requester_membership_id uuid not null references public.event_memberships(id) on delete cascade,
  proposed_user_id uuid not null references public.profiles(id) on delete cascade,
  relationship_context text not null check (char_length(trim(relationship_context)) between 2 and 180),
  note text check (note is null or char_length(note) <= 500),
  status public.plus_one_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (event_id, proposed_user_id)
);

create table public.sensitive_action_audit (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  actor_user_id uuid not null references public.profiles(id) on delete restrict,
  action text not null check (action in ('invited_guest', 'approved_guest', 'declined_guest', 'revoked_invitation', 'removed_guest', 'approved_plus_one', 'declined_plus_one')),
  subject_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index event_memberships_event_status_idx on public.event_memberships (event_id, approval_status);
create index invitations_invitee_status_idx on public.invitations (invitee_user_id, status);
create index plus_one_requests_event_status_idx on public.plus_one_requests (event_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger events_set_updated_at before update on public.events for each row execute function public.set_updated_at();
create trigger event_sensitive_details_set_updated_at before update on public.event_sensitive_details for each row execute function public.set_updated_at();
create trigger event_memberships_set_updated_at before update on public.event_memberships for each row execute function public.set_updated_at();

create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.verification_level <> old.verification_level then
    raise exception 'Verification level is managed by the server';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_privilege_escalation
before update on public.profiles for each row execute function public.prevent_profile_privilege_escalation();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), nullif(split_part(new.email, '@', 1), ''), 'Gather guest')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Security-definer predicates keep RLS policies readable and avoid recursive policy evaluation.
create or replace function public.is_event_host(p_event_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.events where id = p_event_id and host_user_id = auth.uid());
$$;

create or replace function public.has_event_membership(p_event_id uuid, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.event_memberships where event_id = p_event_id and user_id = p_user_id and approval_status in ('requested', 'approved') and removed_at is null);
$$;

create or replace function public.has_approved_membership(p_event_id uuid, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.event_memberships where event_id = p_event_id and user_id = p_user_id and approval_status = 'approved' and removed_at is null);
$$;

create or replace function public.can_view_profile(p_profile_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select p_profile_id = auth.uid()
    or exists (
      select 1 from public.trusted_connections
      where status = 'accepted'
        and ((requester_id = auth.uid() and addressee_id = p_profile_id) or (addressee_id = auth.uid() and requester_id = p_profile_id))
    )
    or exists (
      select 1
      from public.events host_event
      join public.event_memberships theirs on theirs.event_id = host_event.id
      where host_event.host_user_id = auth.uid() and theirs.user_id = p_profile_id
    )
    or exists (
      select 1
      from public.event_memberships mine
      join public.event_memberships theirs on theirs.event_id = mine.event_id
      where mine.user_id = auth.uid()
        and mine.approval_status in ('requested', 'approved') and mine.removed_at is null
        and theirs.user_id = p_profile_id
        and theirs.approval_status in ('requested', 'approved') and theirs.removed_at is null
    );
$$;

alter table public.profiles enable row level security;
alter table public.trusted_connections enable row level security;
alter table public.events enable row level security;
alter table public.event_sensitive_details enable row level security;
alter table public.invitations enable row level security;
alter table public.event_memberships enable row level security;
alter table public.plus_one_requests enable row level security;
alter table public.sensitive_action_audit enable row level security;

create policy "profiles are visible only in a private context" on public.profiles for select to authenticated using (public.can_view_profile(id));
create policy "users update their own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "connection participants can read" on public.trusted_connections for select to authenticated using (requester_id = auth.uid() or addressee_id = auth.uid());
create policy "users can request connections" on public.trusted_connections for insert to authenticated with check (requester_id = auth.uid() and status = 'pending');
create policy "connection recipient can accept or block" on public.trusted_connections for update to authenticated using (addressee_id = auth.uid()) with check (addressee_id = auth.uid());

create policy "private event participants can read general details" on public.events for select to authenticated using (
  host_user_id = auth.uid()
  or public.has_event_membership(id)
  or exists (select 1 from public.invitations where event_id = id and invitee_user_id = auth.uid() and status = 'pending' and expires_at > now())
);
create policy "hosts manage their general event" on public.events for update to authenticated using (host_user_id = auth.uid()) with check (host_user_id = auth.uid() and is_private);

-- Ciphertext is intentionally never available to pending or declined memberships, even though they can read the event preview.
create policy "only host and approved attendees select sensitive ciphertext" on public.event_sensitive_details for select to authenticated using (public.is_event_host(event_id) or public.has_approved_membership(event_id));

create policy "host and invitee read an invitation" on public.invitations for select to authenticated using (public.is_event_host(event_id) or invitee_user_id = auth.uid());
create policy "hosts read memberships and users read their own" on public.event_memberships for select to authenticated using (public.is_event_host(event_id) or user_id = auth.uid());
create policy "host can read relevant plus-one requests" on public.plus_one_requests for select to authenticated using (public.is_event_host(event_id) or requester_membership_id in (select id from public.event_memberships where user_id = auth.uid()) or proposed_user_id = auth.uid());

-- Audit data is deliberately unavailable to normal application roles.

create or replace function public.create_private_event(
  p_title text,
  p_description text,
  p_event_date date,
  p_start_time time,
  p_end_time time,
  p_timezone text,
  p_broad_area text,
  p_capacity integer,
  p_plus_one_policy public.plus_one_policy,
  p_dietary_collection boolean,
  p_alcohol_present boolean,
  p_accessibility_note text,
  p_exact_address_ciphertext text,
  p_entry_instructions_ciphertext text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.profiles where id = auth.uid() and age_over_18) then raise exception 'Adult account confirmation required'; end if;
  if p_capacity < 2 or p_capacity > 100 then raise exception 'Invalid capacity'; end if;
  if char_length(trim(p_title)) not between 3 and 80 or char_length(trim(p_description)) not between 12 and 500 then raise exception 'Invalid event details'; end if;
  if char_length(trim(p_broad_area)) not between 2 and 80 or char_length(p_exact_address_ciphertext) <= 40 then raise exception 'Invalid location details'; end if;
  v_starts_at := (p_event_date + p_start_time) at time zone p_timezone;
  v_ends_at := case when p_end_time is null then null else (p_event_date + p_end_time) at time zone p_timezone end;
  if v_ends_at is not null and v_ends_at <= v_starts_at then raise exception 'End must be after start'; end if;
  insert into public.events (host_user_id, title, description, starts_at, ends_at, timezone, broad_area, capacity, plus_one_policy, dietary_collection, alcohol_present, accessibility_note)
  values (auth.uid(), trim(p_title), trim(p_description), v_starts_at, v_ends_at, p_timezone, trim(p_broad_area), p_capacity, p_plus_one_policy, p_dietary_collection, p_alcohol_present, nullif(trim(p_accessibility_note), ''))
  returning id into v_event_id;
  insert into public.event_sensitive_details (event_id, exact_address_ciphertext, entry_instructions_ciphertext)
  values (v_event_id, p_exact_address_ciphertext, p_entry_instructions_ciphertext);
  insert into public.event_memberships (event_id, user_id, role, approval_status, rsvp_status, approved_at)
  values (v_event_id, auth.uid(), 'host', 'approved', 'going', now());
  return v_event_id;
end;
$$;

create or replace function public.create_private_invitation(p_event_id uuid, p_invitee_user_id uuid, p_expires_at timestamptz)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_invitation_id uuid;
begin
  if not public.is_event_host(p_event_id) then raise exception 'Only the host can invite'; end if;
  if p_invitee_user_id = auth.uid() then raise exception 'Host is already attending'; end if;
  if p_expires_at <= now() or p_expires_at > now() + interval '30 days' then raise exception 'Invalid invitation expiry'; end if;
  if exists (select 1 from public.event_memberships where event_id = p_event_id and user_id = p_invitee_user_id and approval_status <> 'removed') then raise exception 'Guest already has attendance state'; end if;
  insert into public.invitations (event_id, inviter_user_id, invitee_user_id, expires_at)
  values (p_event_id, auth.uid(), p_invitee_user_id, p_expires_at)
  on conflict (event_id, invitee_user_id) do update set inviter_user_id = excluded.inviter_user_id, status = 'pending', expires_at = excluded.expires_at, responded_at = null
  returning id into v_invitation_id;
  insert into public.sensitive_action_audit (event_id, actor_user_id, action, subject_user_id) values (p_event_id, auth.uid(), 'invited_guest', p_invitee_user_id);
  return v_invitation_id;
end;
$$;

create or replace function public.respond_to_invitation(p_invitation_id uuid, p_accept boolean)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_invitation public.invitations; v_membership_id uuid;
begin
  select * into v_invitation from public.invitations where id = p_invitation_id for update;
  if not found or v_invitation.invitee_user_id <> auth.uid() or v_invitation.status <> 'pending' or v_invitation.expires_at <= now() then raise exception 'Invitation is unavailable'; end if;
  if not p_accept then
    update public.invitations set status = 'rejected', responded_at = now() where id = p_invitation_id;
    return null;
  end if;
  if not exists (select 1 from public.profiles where id = auth.uid() and age_over_18) then raise exception 'Adult account confirmation required'; end if;
  insert into public.event_memberships (event_id, user_id, role, approval_status)
  values (v_invitation.event_id, auth.uid(), 'guest', 'requested')
  on conflict (event_id, user_id) do update set approval_status = 'requested', removed_at = null
  returning id into v_membership_id;
  update public.invitations set status = 'accepted', responded_at = now() where id = p_invitation_id;
  return v_membership_id;
end;
$$;

create or replace function public.approve_membership(p_membership_id uuid, p_approve boolean)
returns void
language plpgsql security definer set search_path = public as $$
declare v_membership public.event_memberships; v_event public.events; v_approved_count integer;
begin
  select * into v_membership from public.event_memberships where id = p_membership_id for update;
  if not found then raise exception 'Attendance request not found'; end if;
  select * into v_event from public.events where id = v_membership.event_id for update;
  if v_event.host_user_id <> auth.uid() then raise exception 'Only the host can decide'; end if;
  if v_membership.approval_status <> 'requested' then return; end if;
  if not p_approve then
    update public.event_memberships set approval_status = 'declined' where id = p_membership_id;
    insert into public.sensitive_action_audit (event_id, actor_user_id, action, subject_user_id) values (v_event.id, auth.uid(), 'declined_guest', v_membership.user_id);
    return;
  end if;
  select count(*) into v_approved_count from public.event_memberships where event_id = v_event.id and approval_status = 'approved' and removed_at is null;
  if v_approved_count >= v_event.capacity then raise exception 'Event capacity reached'; end if;
  update public.event_memberships set approval_status = 'approved', approved_at = now(), removed_at = null where id = p_membership_id;
  insert into public.sensitive_action_audit (event_id, actor_user_id, action, subject_user_id) values (v_event.id, auth.uid(), 'approved_guest', v_membership.user_id);
end;
$$;

create or replace function public.revoke_invitation(p_invitation_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare v_invitation public.invitations;
begin
  select * into v_invitation from public.invitations where id = p_invitation_id for update;
  if not found or not public.is_event_host(v_invitation.event_id) then raise exception 'Invitation unavailable'; end if;
  update public.invitations set status = 'revoked' where id = p_invitation_id;
  update public.event_memberships set approval_status = 'removed', removed_at = now() where event_id = v_invitation.event_id and user_id = v_invitation.invitee_user_id and approval_status <> 'removed';
  insert into public.sensitive_action_audit (event_id, actor_user_id, action, subject_user_id) values (v_invitation.event_id, auth.uid(), 'revoked_invitation', v_invitation.invitee_user_id);
end;
$$;

create or replace function public.propose_plus_one(p_event_id uuid, p_proposed_user_id uuid, p_relationship_context text, p_note text default null)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_requester public.event_memberships; v_policy public.plus_one_policy; v_request_id uuid;
begin
  select * into v_requester from public.event_memberships where event_id = p_event_id and user_id = auth.uid() for update;
  select plus_one_policy into v_policy from public.events where id = p_event_id;
  if not found or v_requester.approval_status <> 'approved' or (v_policy = 'none') or (v_policy = 'selected' and not v_requester.can_request_plus_one) then raise exception 'Plus-one proposal is not permitted'; end if;
  if p_proposed_user_id = auth.uid() then raise exception 'Cannot propose yourself'; end if;
  insert into public.plus_one_requests (event_id, requester_membership_id, proposed_user_id, relationship_context, note)
  values (p_event_id, v_requester.id, p_proposed_user_id, trim(p_relationship_context), nullif(trim(p_note), ''))
  returning id into v_request_id;
  return v_request_id;
end;
$$;

create or replace function public.decide_plus_one(p_request_id uuid, p_approve boolean)
returns void
language plpgsql security definer set search_path = public as $$
declare v_request public.plus_one_requests; v_event public.events; v_count integer;
begin
  select * into v_request from public.plus_one_requests where id = p_request_id for update;
  if not found then raise exception 'Plus-one request not found'; end if;
  select * into v_event from public.events where id = v_request.event_id for update;
  if v_event.host_user_id <> auth.uid() then raise exception 'Only the host can decide'; end if;
  if v_request.status <> 'pending' then return; end if;
  if not p_approve then
    update public.plus_one_requests set status = 'declined', decided_at = now() where id = p_request_id;
    insert into public.sensitive_action_audit (event_id, actor_user_id, action, subject_user_id) values (v_event.id, auth.uid(), 'declined_plus_one', v_request.proposed_user_id);
    return;
  end if;
  select count(*) into v_count from public.event_memberships where event_id = v_event.id and approval_status = 'approved' and removed_at is null;
  if v_count >= v_event.capacity then raise exception 'Event capacity reached'; end if;
  insert into public.event_memberships (event_id, user_id, role, approval_status, introduced_by_membership_id, approved_at)
  values (v_event.id, v_request.proposed_user_id, 'plus_one', 'approved', v_request.requester_membership_id, now())
  on conflict (event_id, user_id) do update set approval_status = 'approved', role = 'plus_one', introduced_by_membership_id = excluded.introduced_by_membership_id, approved_at = now(), removed_at = null;
  update public.plus_one_requests set status = 'approved', decided_at = now() where id = p_request_id;
  insert into public.sensitive_action_audit (event_id, actor_user_id, action, subject_user_id) values (v_event.id, auth.uid(), 'approved_plus_one', v_request.proposed_user_id);
end;
$$;

revoke all on function public.create_private_event from public;
revoke all on function public.create_private_invitation from public;
revoke all on function public.respond_to_invitation from public;
revoke all on function public.approve_membership from public;
revoke all on function public.revoke_invitation from public;
revoke all on function public.propose_plus_one from public;
revoke all on function public.decide_plus_one from public;
grant execute on function public.create_private_event to authenticated;
grant execute on function public.create_private_invitation to authenticated;
grant execute on function public.respond_to_invitation to authenticated;
grant execute on function public.approve_membership to authenticated;
grant execute on function public.revoke_invitation to authenticated;
grant execute on function public.propose_plus_one to authenticated;
grant execute on function public.decide_plus_one to authenticated;
