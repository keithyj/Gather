-- PostgREST roles need table privileges before RLS can evaluate a request.
-- These grants are intentionally narrow; RLS policies remain the authorisation decision layer.

grant select, update on public.profiles to authenticated;
grant select, insert, update on public.trusted_connections to authenticated;
grant select, update on public.events to authenticated;
grant select on public.event_sensitive_details to anon, authenticated;
grant select on public.invitations to authenticated;
grant select on public.event_memberships to authenticated;
grant select on public.plus_one_requests to authenticated;
