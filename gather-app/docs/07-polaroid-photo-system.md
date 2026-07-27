# HD Polaroid photo system

## Product rule

Each approved attendee may contribute up to three photos per event by default. The constraint encourages selection and keeps the capsule meaningful.

## Upload pipeline

1. Upload directly to private object storage using a short-lived signed upload token.
2. Validate MIME type and actual file signature.
3. Enforce file-size and pixel-dimension limits.
4. Strip EXIF and GPS metadata.
5. Correct orientation.
6. Preserve a private high-quality original.
7. Generate display derivatives in AVIF/WebP plus JPEG fallback.
8. Create a low-quality placeholder for loading.
9. Run moderation and quarantine uncertain content before broad availability.

## Polaroid treatment

The visual treatment is non-destructive and rendered in the UI:

- image area in a 4:5 or original-safe crop;
- off-white physical-paper frame;
- thicker bottom margin;
- subtle paper grain;
- restrained shadow and slight per-card rotation;
- optional handwritten-style caption font only for short captions;
- date and attendee attribution;
- high-DPI export for personal download in a later phase.

Do not permanently bake a low-resolution frame into the only stored image.

## Access rules

- Only approved attendees and the host can fetch signed display URLs.
- Access is revoked when membership is revoked.
- Album URLs expire quickly and must not be guessable.
- Deleted images disappear from derivatives and cache invalidation is triggered.
