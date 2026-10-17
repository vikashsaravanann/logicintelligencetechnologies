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

/**
 * Converts a wall-clock date and time in an arbitrary IANA time zone into
 * an exact UTC ISO 8601 string. Avoids local server vs user offset skew.
 */
export function convertZonedDateTimeToUtcIso(
  dateStr: string,
  timeStr: string,
  timeZone = "Asia/Kolkata"
): string {
  const timeMatch = (timeStr || "").trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  let hours = 10;
  let mins = 0;
  let secs = 0;
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    mins = parseInt(timeMatch[2], 10);
    secs = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
    const modifier = timeMatch[4];
    if (modifier) {
      if (modifier.toUpperCase() === "PM" && hours < 12) hours += 12;
      if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;
    }
  }

  const dateMatch = (dateStr || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!dateMatch) {
    const fallback = new Date();
    return fallback.toISOString();
  }
  const year = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10);
  const day = parseInt(dateMatch[3], 10);

  const initialUtc = Date.UTC(year, month - 1, day, hours, mins, secs);

  function getTzParts(utcMs: number, tz: string): number {
    const d = new Date(utcMs);
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(d);
    const map: Record<string, string> = {};
    for (const p of parts) map[p.type] = p.value;
    const h = parseInt(map.hour, 10) === 24 ? 0 : parseInt(map.hour, 10);
    return Date.UTC(
      parseInt(map.year, 10),
      parseInt(map.month, 10) - 1,
      parseInt(map.day, 10),
      h,
      parseInt(map.minute, 10),
      parseInt(map.second, 10)
    );
  }

  let offsetMs = 0;
  try {
    const tzUtc = getTzParts(initialUtc, timeZone);
    offsetMs = tzUtc - initialUtc;
  } catch {
    offsetMs = 0;
  }

  const resultUtc = initialUtc - offsetMs;
  return new Date(resultUtc).toISOString();
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
