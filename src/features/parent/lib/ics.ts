import type { CalendarEvent } from '../types';

function icsDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Build a downloadable .ics blob URL for a school event. */
export function eventToIcsHref(event: CalendarEvent): string {
  const start = icsDate(event.startsAt);
  const end = event.endsAt ? icsDate(event.endsAt) : start;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SMS Parent Portal//EN',
    'BEGIN:VEVENT',
    `UID:event-${event.id}@sms`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    start ? `DTSTART:${start}` : '',
    end ? `DTEND:${end}` : '',
    `SUMMARY:${escapeIcs(event.title)}`,
    event.description ? `DESCRIPTION:${escapeIcs(event.description)}` : '',
    event.location ? `LOCATION:${escapeIcs(event.location)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}

function escapeIcs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}
