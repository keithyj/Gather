# UX and visual design system

## Direction

Contemporary, warm, editorial, and intimate. Glassmorphism is an accent, not the entire interface. Legibility and performance take priority over decorative blur.

## Visual language

- Dark ink or warm off-white foundations.
- One luminous accent gradient used sparingly.
- Frosted surfaces only over simple backgrounds.
- Large editorial event titles paired with highly readable UI text.
- Rounded geometry, but avoid making every element a pill.
- Real depth from layering, borders, and shadow—not blur alone.
- Motion should communicate reveal, approval, and memory formation.

## Accessibility constraints

- Text contrast meets WCAG AA.
- Never place body copy directly on a busy photo without an opaque scrim.
- Respect reduced-motion preferences.
- Minimum touch target 44 by 44 CSS pixels.
- All state changes include text, not colour alone.
- Glass panels use a solid fallback and remain readable when backdrop-filter is unavailable.

## Core screens

1. Welcome and email sign-in.
2. Home: upcoming, hosting, memories.
3. Create event wizard.
4. Event preview before approval.
5. Host approval queue.
6. Approved event details.
7. Plus-one proposal sheet.
8. RSVP and dietary form.
9. Event updates.
10. Camera/upload flow.
11. Memory capsule.
12. Profile and trust settings.

## Interaction signature

The defining interaction is the **trust reveal**: after approval, the event card transitions from an atmospheric broad-area preview into a precise details card. This must feel satisfying but never expose sensitive content during animation, preload, accessibility labels, or client hydration.
