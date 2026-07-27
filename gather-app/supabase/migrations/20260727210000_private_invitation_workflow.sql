-- Private invitation workflow extension. Apply only to local or non-production projects first.
-- Email identifiers are isolated from normal profile reads; exact address and private contact stay ciphertext.

create schema if not exists private;

alter table public.profiles add column username text;
update public.profiles
set username = 'member_' || left(replace(id::text, '-', ''), 12)
where username is null;
alter table public.profiles alter column username set not null;
alter table public.profiles add constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,24}$');
create unique index profiles_username_lower_unique on public.profiles (lower(username));

create table private.profile_contact_identifiers (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  email_normalized text not null unique check (email_normalized = lower(email_normalized)),
  created_at timestamptz not null default now()
);
alter table private.profile_contact_identifiers enable row level security;
revoke all on private.profile_contact_identifiers from public, anon, authenticated;

insert into private.profile_contact_identifiers (profile_id, email_normalized)
select id, lower(email)
from auth.users
where email is not null
on conflict (profile_id) do update set email_normalized = excluded.email_normalized;

alter table public.events add column dress_code text check (dress_code is null or char_length(dress_code) <= 120);
alter table public.events add column food_and_drink_notes text check (food_and_drink_notes is null or char_length(food_and_drink_notes) <= 500);
alter table public.event_sensitive_details add column host_contact_ciphertext text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare v_username text;
begin
  v_username := lower(trim(coalesce(new.raw_user_meta_data ->> 'username', '')));
  if v_username !~ '^[a-z0-9_]{3,24}$' then
    v_username := 'member_' || left(replace(new.id::text, '-', ''), 12);
  end if;
  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), nullif(split_part(new.email, '@', 1), ''), 'Gather guest'),
    v_username
  );
  insert into private.profile_contact_identifiers (profile_id, email_normalized)
  values (new.id, lower(new.email));
  return new;
end;
$$;

create or replace function private.resolve_profile_identifier(p_identifier text)
returns uuid
language plpgsql stable security definer set search_path = public, private as $$
declare v_identifier text := lower(trim(p_identifier)); v_user_id uuid;
begin
  if left(v_identifier, 1) = '@' then v_identifier := substr(v_identifier, 2); end if;
  if position('@' in v_identifier) > 0 then
    select profile_id into v_user_id from private.profile_contact_identifiers where email_normalized = v_identifier;
  else
    select id into v_user_id from public.profiles where lower(username) = v_identifier;
  end if;
  return v_user_id;
end;
$$;

create or replace function public.create_private_invitation_by_identifier(p_event_id uuid, p_identifier text, p_expires_at timestamptz)
returns uuid
language plpgsql security definer set search_path = public, private as $$
declare v_invitee_id uuid;
begin
  if not public.is_event_host(p_event_id) then raise exception 'Only the host can invite'; end if;
  v_invitee_id := private.resolve_profile_identifier(p_identifier);
  if v_invitee_id is null then raise exception 'No Gather account matches that email or username'; end if;
  if v_invitee_id = auth.uid() then raise exception 'Host is already attending'; end if;
  if p_expires_at <= now() or p_expires_at > now() + interval '30 days' then raise exception 'Invalid invitation expiry'; end if;
  if exists (select 1 from public.event_memberships where event_id = p_event_id and user_id = v_invitee_id and approval_status <> 'removed') then raise exception 'Guest already has attendance state'; end if;
  insert into public.invitations (event_id, inviter_user_id, invitee_user_id, expires_at)
  values (p_event_id, auth.uid(), v_invitee_id, p_expires_at)
  on conflict (event_id, invitee_user_id) do update set inviter_user_id = excluded.inviter_user_id, status = 'pending', expires_at = excluded.expires_at, responded_at = null
  returning id into v_invitee_id;
  return v_invitee_id;
end;
$$;

create or replace function public.propose_plus_one_by_identifier(p_event_id uuid, p_identifier text, p_relationship_context text, p_note text default null)
returns uuid
language plpgsql security definer set search_path = public, private as $$
declare v_proposed_id uuid;
begin
  v_proposed_id := private.resolve_profile_identifier(p_identifier);
  if v_proposed_id is null then raise exception 'Ask your plus-one to create a Gather account first'; end if;
  return public.propose_plus_one(p_event_id, v_proposed_id, p_relationship_context, p_note);
end;
$$;

create or replace function public.cancel_private_event(p_event_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_event_host(p_event_id) then raise exception 'Only the host can cancel'; end if;
  update public.events set status = 'cancelled' where id = p_event_id and status = 'active';
end;
$$;

create or replace function public.set_private_event_details(p_event_id uuid, p_entry_instructions_ciphertext text default null, p_host_contact_ciphertext text default null)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_event_host(p_event_id) then raise exception 'Only the host can edit private details'; end if;
  update public.event_sensitive_details
  set entry_instructions_ciphertext = p_entry_instructions_ciphertext,
      host_contact_ciphertext = p_host_contact_ciphertext
  where event_id = p_event_id;
end;
$$;

revoke all on function private.resolve_profile_identifier(text) from public, anon, authenticated;
revoke all on function public.create_private_invitation_by_identifier(uuid, text, timestamptz) from public;
revoke all on function public.propose_plus_one_by_identifier(uuid, text, text, text) from public;
revoke all on function public.cancel_private_event(uuid) from public;
revoke all on function public.set_private_event_details(uuid, text, text) from public;
grant execute on function public.create_private_invitation_by_identifier(uuid, text, timestamptz) to authenticated;
grant execute on function public.propose_plus_one_by_identifier(uuid, text, text, text) to authenticated;
grant execute on function public.cancel_private_event(uuid) to authenticated;
grant execute on function public.set_private_event_details(uuid, text, text) to authenticated;
