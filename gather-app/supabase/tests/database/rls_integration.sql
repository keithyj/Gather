-- Live RLS integration test. Supabase CLI executes files under supabase/tests/database with pgTAP.
-- It creates only deterministic, disposable local fixtures and rolls them back at the end.
begin;
select plan(7);

-- Fixture inserts bypass auth.users foreign keys only inside this disposable local transaction.
-- The RLS assertions below execute as anon/authenticated, never as the database owner.
set local session_replication_role = replica;

insert into public.profiles (id, display_name, age_over_18) values
  ('00000000-0000-0000-0000-000000000001', 'Host', true),
  ('00000000-0000-0000-0000-000000000002', 'Approved guest', true),
  ('00000000-0000-0000-0000-000000000003', 'Pending guest', true),
  ('00000000-0000-0000-0000-000000000004', 'Declined guest', true),
  ('00000000-0000-0000-0000-000000000005', 'Removed guest', true),
  ('00000000-0000-0000-0000-000000000006', 'Revoked guest', true),
  ('00000000-0000-0000-0000-000000000007', 'Unrelated user', true);

insert into public.events (id, host_user_id, title, description, starts_at, timezone, broad_area, capacity)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Private housewarming', 'A private event used only for local RLS verification.', now() + interval '1 day', 'Europe/London', 'Hackney', 12);

insert into public.event_sensitive_details (event_id, exact_address_ciphertext)
values ('10000000-0000-0000-0000-000000000001', repeat('x', 41));

insert into public.event_memberships (event_id, user_id, role, approval_status, approved_at, removed_at) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'host', 'approved', now(), null),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'guest', 'approved', now(), null),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'guest', 'requested', null, null),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'guest', 'declined', null, null),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'guest', 'removed', null, now()),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'guest', 'removed', null, now());

insert into public.invitations (event_id, inviter_user_id, invitee_user_id, status, expires_at)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'revoked', now() + interval '1 day');

set local session_replication_role = origin;

set local role anon;
select is((select count(*) from public.event_sensitive_details where event_id = '10000000-0000-0000-0000-000000000001'), 0::bigint, 'unauthenticated users cannot select sensitive details');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
select is((select count(*) from public.event_sensitive_details where event_id = '10000000-0000-0000-0000-000000000001'), 1::bigint, 'approved attendee can select ciphertext');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
select is((select count(*) from public.event_sensitive_details where event_id = '10000000-0000-0000-0000-000000000001'), 0::bigint, 'pending attendee cannot select sensitive details');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000004', true);
select is((select count(*) from public.event_sensitive_details where event_id = '10000000-0000-0000-0000-000000000001'), 0::bigint, 'declined attendee cannot select sensitive details');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000005', true);
select is((select count(*) from public.event_sensitive_details where event_id = '10000000-0000-0000-0000-000000000001'), 0::bigint, 'removed attendee cannot select sensitive details');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000006', true);
select is((select count(*) from public.event_sensitive_details where event_id = '10000000-0000-0000-0000-000000000001'), 0::bigint, 'revoked attendee cannot select sensitive details');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000007', true);
select is((select count(*) from public.event_sensitive_details where event_id = '10000000-0000-0000-0000-000000000001'), 0::bigint, 'unrelated attendee cannot select sensitive details');
reset role;

select * from finish();
rollback;
