# Codex prompt: Private Polaroid memory capsule

Implement Phase 3 only after Phases 1 and 2 are complete.

Build private photo uploads for approved attendees, enforcing a default maximum of three photos per attendee per event on the server. Strip EXIF/GPS metadata, validate file signatures, preserve a private high-quality original, and generate responsive derivatives. Use short-lived signed URLs and RLS-backed membership checks.

Render photos as non-destructive HD Polaroid cards with an off-white frame, thicker lower border, restrained shadow, optional slight rotation, date, attribution, caption, and private reactions. Include accessible list/grid behaviour, loading placeholders, deletion, host hide, and reporting. Add tests proving non-members and removed members cannot fetch photos.
