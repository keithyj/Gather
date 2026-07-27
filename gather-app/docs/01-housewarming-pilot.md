# Housewarming pilot specification

## Event template

**Title:** Housewarming dinner

**Preview visible before approval:**

- host display name and verified status;
- date and approximate start/end time;
- neighbourhood or broad area, never the exact address;
- event type and short description;
- dress guidance;
- whether food and alcohol may be served;
- plus-one policy;
- accessibility note prompt;
- attendee count as a range, optionally hidden.

**Visible only after host approval:**

- exact address and map link;
- entry instructions;
- host phone contact, if the host opts in;
- full attendee list, depending on host privacy setting;
- private event updates;
- album access when the event begins.

## Host setup fields

- title;
- cover treatment or generated gradient, not a public stock photo requirement;
- date, start time, optional end time;
- broad area;
- exact address in a separately protected field;
- description;
- capacity;
- invite expiry;
- plus-one allowance: none, selected guests, or all approved guests;
- approval mode: every attendee manually approved;
- dietary collection toggle;
- alcohol-present toggle;
- attendee-list visibility;
- photo capsule toggle and photo limit, default three per attendee.

## Guest RSVP

- going, maybe, or cannot attend;
- dietary requirements;
- accessibility needs;
- optional note to host;
- plus-one request, when enabled;
- acknowledgement that exact address must not be redistributed.

## Pilot success criteria

- Host completes event creation in under five minutes.
- Invitees can respond from a mobile browser without installing an app.
- Host can understand pending, approved, declined, and plus-one states at a glance.
- The exact address never appears in unauthorised API responses or page source.
- At least 80% of approved attendees can reach the details screen without support.
- Photo uploads complete reliably on ordinary mobile connections.
