import { NextResponse } from "next/server";
import { getInvitationView } from "@/lib/event-repository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(_: Request, { params }: { params: Promise<{ invitationId: string }> }) {
  const invitation = await getInvitationView((await params).invitationId);
  if (!invitation) return new NextResponse("Not found", { status: 404 });
  const start = new Date(invitation.event.startsAt)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gather//Private invitation//EN",
    "BEGIN:VEVENT",
    `UID:${invitation.id}@gather.invalid`,
    `DTSTART:${start}`,
    `SUMMARY:${escapeIcs(invitation.event.title)}`,
    `DESCRIPTION:${escapeIcs(invitation.event.description)}`,
    `LOCATION:${escapeIcs(invitation.event.broadArea)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    ""
  ].join("\r\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="gather-invitation.ics"',
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      "X-Robots-Tag": "noindex, noarchive"
    }
  });
}
