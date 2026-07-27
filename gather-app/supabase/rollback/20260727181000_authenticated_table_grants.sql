revoke select, update on public.profiles from authenticated;
revoke select, insert, update on public.trusted_connections from authenticated;
revoke select, update on public.events from authenticated;
revoke select on public.event_sensitive_details from anon, authenticated;
revoke select on public.invitations from authenticated;
revoke select on public.event_memberships from authenticated;
revoke select on public.plus_one_requests from authenticated;
