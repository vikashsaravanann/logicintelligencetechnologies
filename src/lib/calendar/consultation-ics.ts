import { COMPANY } from "@/config/company";

export const DEFAULT_CONSULTATION_MEETING_URL =
  process.env.CONSULTATION_MEETING_URL ||
  "https://meet.google.com/lit-arch-briefing";

export interface IcsConsultationParams {
  bookingId: string;
  title: string;
  description: string;
  startTime: string | Date;
  durationMinutes?: number;
  meetingUrl?: string;
  attendeeEmail: string;
  attendeeName: string;
}

/**
 * Returns duration in minutes based on consultation type title
 */
export function getConsultationDurationMinutes(consultationType: string): number {
  const lower = (consultationType || "").toLowerCase();
  if (lower.includes("30") || lower.includes("discovery")) return 30;
  if (lower.includes("60") || lower.includes("full-stack") || lower.includes("scoping")) return 60;
  return 45; // default 45 mins for Architecture Session and others
}

export function formatConsultationDateTime(
  isoDateStr: string | Date,
  timeZone = "Asia/Kolkata"
): string {
  try {
    const d = new Date(isoDateStr);
    if (isNaN(d.getTime())) return String(isoDateStr);

    const dateFormatted = d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone,
    });

    const timeFormatted = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone,
    });

    const zoneLabel = timeZone === "Asia/Kolkata" ? "IST" : timeZone;
    return `${dateFormatted} at ${timeFormatted} (${zoneLabel})`;
  } catch {
    return String(isoDateStr);
  }
}

/**
 * Generates an RFC 5545 compliant iCalendar string (.ics) for calendar invites.
 */
export function generateConsultationIcs(params: IcsConsultationParams): string {
  const start = new Date(params.startTime);
  const duration = params.durationMinutes || getConsultationDurationMinutes(params.title);
  const end = new Date(start.getTime() + duration * 60 * 1000);
  const meetingUrl = params.meetingUrl || DEFAULT_CONSULTATION_MEETING_URL;

  const toUtcIcs = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const stamp = toUtcIcs(new Date());
  const dtStart = toUtcIcs(start);
  const dtEnd = toUtcIcs(end);

  const cleanDescription = (
    `${params.description}\n\n` +
    `Join Video Teleconference: ${meetingUrl}\n` +
    `Organizer: Logic Intelligence Technologies\n` +
    `Contact: ${COMPANY.emails.hello} | ${COMPANY.phone}`
  )
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, "\\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Logic Intelligence Technologies//Consultation Briefing//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:booking-${params.bookingId}@logicintelligencetechnologies.in`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${params.title}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${meetingUrl}`,
    `URL:${meetingUrl}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    `ORGANIZER;CN="${COMPANY.displayName}":mailto:${COMPANY.emails.hello}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN="${params.attendeeName}":mailto:${params.attendeeEmail}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: ${params.title} with Logic Intelligence Technologies`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // RFC 5545 line folding at 75 octets
  const folded: string[] = [];
  for (const line of lines) {
    if (line.length <= 75) {
      folded.push(line);
    } else {
      folded.push(line.slice(0, 75));
      for (let offset = 75; offset < line.length; offset += 74) {
        folded.push(" " + line.slice(offset, offset + 74));
      }
    }
  }

  return folded.join("\r\n") + "\r\n";
}

/**
 * Builds direct "Add to Google Calendar" web link
 */
export function getGoogleCalendarUrl(params: {
  title: string;
  description: string;
  startTime: string | Date;
  durationMinutes?: number;
  meetingUrl?: string;
}): string {
  const start = new Date(params.startTime);
  const duration = params.durationMinutes || 45;
  const end = new Date(start.getTime() + duration * 60 * 1000);
  const meetingUrl = params.meetingUrl || DEFAULT_CONSULTATION_MEETING_URL;

  const toGCalDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z/, "Z");

  const dates = `${toGCalDate(start)}/${toGCalDate(end)}`;
  const details = `${params.description}\n\nJoin Video Briefing: ${meetingUrl}`;

  const query = new URLSearchParams({
    action: "TEMPLATE",
    text: params.title,
    dates,
    details,
    location: meetingUrl,
  });

  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}
