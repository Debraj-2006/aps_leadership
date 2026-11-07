import { addDays, format, parseISO } from "date-fns";

// A Google Calendar "add event" link. Chapter events have a date but no time, so they're
// added as all-day events.
export function googleCalendarUrl(event: {
  title: string;
  event_date: string;
  description?: string | null;
  venue?: string | null;
}) {
  const start = parseISO(event.event_date);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${format(start, "yyyyMMdd")}/${format(addDays(start, 1), "yyyyMMdd")}`,
    details: [event.description, "IEEE AP-S IEM Student Branch Chapter"].filter(Boolean).join("\n\n"),
  });
  if (event.venue) params.set("location", event.venue);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
