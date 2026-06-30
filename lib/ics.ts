// lib/ics.ts
//
// Minimal iCalendar (.ics, RFC 5545) parser, scoped to what the interview-round
// importer needs: pull a single VEVENT's date/time, duration, title, location,
// description and (best-effort) interviewer out of a calendar invite so we can
// pre-fill the "Add round" form. The user always reviews the result before
// saving, so this favours a small, dependency-free implementation over
// exhaustive RFC coverage.
//
// Timezone handling is the one genuinely tricky part. A DTSTART can be:
//   - "…Z"              → already UTC.
//   - TZID=<IANA name>  → resolved with Intl (covers Google/Apple/Greenhouse/…).
//   - TZID=<other>      → resolved from the file's own VTIMEZONE offsets
//                         (covers Outlook/Exchange "W. Europe Standard Time" …).
//   - no Z, no TZID     → "floating" time, treated as the user's local time.

export interface ParsedIcsEvent {
  title: string | null;
  /** ISO-8601 instant, or null when the start could not be parsed. */
  scheduledAt: string | null;
  durationMinutes: number | null;
  location: string | null;
  interviewer: string | null;
  notes: string | null;
}

// Field length ceilings mirror the backend schema (schemas/interview.py) so an
// import never produces a body the API will 422 on.
const TITLE_MAX = 200;
const LOCATION_MAX = 500;
const INTERVIEWER_MAX = 500;
const NOTES_MAX = 2000;

// ---------------------------------------------------------------------------
// Low-level structure: unfold lines, parse into a block tree.
// ---------------------------------------------------------------------------

interface RawProp {
  name: string;
  params: Record<string, string>;
  value: string;
}

interface IcsBlock {
  name: string;
  props: RawProp[];
  blocks: IcsBlock[];
}

/** RFC 5545 line unfolding: a CRLF (or CR/LF) followed by a space/tab is a
 *  continuation of the previous line. */
function unfold(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n[ \t]/g, "")
    .split("\n");
}

function parseLine(line: string): RawProp | null {
  const colon = line.indexOf(":");
  if (colon === -1) return null;
  const left = line.slice(0, colon);
  const value = line.slice(colon + 1);
  const segs = left.split(";");
  const name = (segs[0] ?? "").toUpperCase();
  if (!name) return null;
  const params: Record<string, string> = {};
  for (let i = 1; i < segs.length; i++) {
    const seg = segs[i] ?? "";
    const eq = seg.indexOf("=");
    if (eq === -1) continue;
    const key = seg.slice(0, eq).toUpperCase();
    let v = seg.slice(eq + 1);
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    params[key] = v;
  }
  return { name, params, value };
}

function parseBlocks(lines: string[]): IcsBlock {
  const root: IcsBlock = { name: "ROOT", props: [], blocks: [] };
  const stack: IcsBlock[] = [root];
  for (const line of lines) {
    const p = parseLine(line);
    if (!p) continue;
    if (p.name === "BEGIN") {
      const child: IcsBlock = { name: p.value.toUpperCase(), props: [], blocks: [] };
      stack[stack.length - 1]!.blocks.push(child);
      stack.push(child);
    } else if (p.name === "END") {
      if (stack.length > 1) stack.pop();
    } else {
      stack[stack.length - 1]!.props.push(p);
    }
  }
  return root;
}

function findBlocks(root: IcsBlock, name: string): IcsBlock[] {
  const out: IcsBlock[] = [];
  const walk = (b: IcsBlock) => {
    for (const child of b.blocks) {
      if (child.name === name) out.push(child);
      walk(child);
    }
  };
  walk(root);
  return out;
}

const prop = (block: IcsBlock, name: string): RawProp | undefined =>
  block.props.find((p) => p.name === name);

// ---------------------------------------------------------------------------
// Value parsing: text unescaping, dates, durations, offsets.
// ---------------------------------------------------------------------------

function unescapeText(v: string): string {
  return v
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function cap(s: string, max: number): string {
  const trimmed = s.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

interface DateParts {
  y: number;
  mo: number;
  d: number;
  h: number;
  mi: number;
  s: number;
  dateOnly: boolean;
  utc: boolean;
}

function parseDateParts(value: string): DateParts | null {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?(Z)?$/.exec(value.trim());
  if (!m) return null;
  return {
    y: Number(m[1]),
    mo: Number(m[2]),
    d: Number(m[3]),
    h: m[4] ? Number(m[4]) : 0,
    mi: m[5] ? Number(m[5]) : 0,
    s: m[6] ? Number(m[6]) : 0,
    dateOnly: !m[4],
    utc: !!m[7],
  };
}

/** Parse an ISO-8601 duration like "PT1H30M" / "P1DT2H" / "PT45M" to minutes. */
function parseDuration(value: string): number | null {
  const m = /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(
    value.trim(),
  );
  if (!m) return null;
  const sign = m[1] === "-" ? -1 : 1;
  const weeks = Number(m[2] ?? 0);
  const days = Number(m[3] ?? 0);
  const hours = Number(m[4] ?? 0);
  const mins = Number(m[5] ?? 0);
  const secs = Number(m[6] ?? 0);
  return sign * ((weeks * 7 + days) * 1440 + hours * 60 + mins + Math.round(secs / 60));
}

/** "+0200" → 120, "-0530" → -330 (minutes east of UTC). */
function parseUtcOffsetMinutes(value: string): number | null {
  const m = /^([+-])(\d{2})(\d{2})(\d{2})?$/.exec(value.trim());
  if (!m) return null;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (Number(m[2]) * 60 + Number(m[3]) + Math.round(Number(m[4] ?? 0) / 60));
}

// ---------------------------------------------------------------------------
// Timezone resolution.
// ---------------------------------------------------------------------------

function isIanaZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Offset (minutes east of UTC) that an IANA zone was at on a given instant. */
function ianaOffsetMinutes(timeZone: string, instant: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  let y = 0;
  let mo = 1;
  let d = 1;
  let h = 0;
  let mi = 0;
  let s = 0;
  for (const part of dtf.formatToParts(instant)) {
    const n = Number(part.value);
    if (part.type === "year") y = n;
    else if (part.type === "month") mo = n;
    else if (part.type === "day") d = n;
    else if (part.type === "hour") h = n;
    else if (part.type === "minute") mi = n;
    else if (part.type === "second") s = n;
  }
  const asUTC = Date.UTC(y, mo - 1, d, h, mi, s);
  return Math.round((asUTC - instant.getTime()) / 60000);
}

/** Convert a wall-clock time in an IANA zone to an absolute instant. */
function ianaWallClockToUtc(dt: DateParts, timeZone: string): Date {
  const wallAsUTC = Date.UTC(dt.y, dt.mo - 1, dt.d, dt.h, dt.mi, dt.s);
  const off1 = ianaOffsetMinutes(timeZone, new Date(wallAsUTC));
  let utc = wallAsUTC - off1 * 60000;
  // One correction pass settles DST-boundary cases.
  const off2 = ianaOffsetMinutes(timeZone, new Date(utc));
  if (off2 !== off1) utc = wallAsUTC - off2 * 60000;
  return new Date(utc);
}

// --- Fallback for non-IANA TZIDs: resolve from the file's own VTIMEZONE. ----

interface TzTransition {
  offsetTo: number; // minutes east of UTC
  month: number; // 1-12
  weekday: number; // 0=Sun … 6=Sat
  ordinal: number; // 1..5, or -1 for "last"
  hour: number;
  minute: number;
}

interface TzInfo {
  standard?: TzTransition;
  daylight?: TzTransition;
}

const WEEKDAYS: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

function parseTzTransition(block: IcsBlock): TzTransition | null {
  const offsetTo = prop(block, "TZOFFSETTO");
  if (!offsetTo) return null;
  const minutes = parseUtcOffsetMinutes(offsetTo.value);
  if (minutes == null) return null;

  const start = prop(block, "DTSTART");
  const time = start ? parseDateParts(start.value) : null;

  // Default to the rule's own start day; refine from RRULE BYMONTH/BYDAY.
  let month = time?.mo ?? 1;
  let weekday = 0;
  let ordinal = 1;
  const rrule = prop(block, "RRULE")?.value ?? "";
  for (const part of rrule.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).toUpperCase();
    const val = part.slice(eq + 1);
    if (key === "BYMONTH") month = Number(val) || month;
    else if (key === "BYDAY") {
      const md = /^(-?\d)?(SU|MO|TU|WE|TH|FR|SA)$/.exec(val.trim().toUpperCase());
      if (md) {
        ordinal = md[1] ? Number(md[1]) : 1;
        weekday = WEEKDAYS[md[2] ?? "SU"] ?? 0;
      }
    }
  }
  return { offsetTo: minutes, month, weekday, ordinal, hour: time?.h ?? 0, minute: time?.mi ?? 0 };
}

function collectTimezones(root: IcsBlock): Map<string, TzInfo> {
  const map = new Map<string, TzInfo>();
  for (const vtz of findBlocks(root, "VTIMEZONE")) {
    const tzid = prop(vtz, "TZID")?.value;
    if (!tzid) continue;
    const info: TzInfo = {};
    for (const sub of vtz.blocks) {
      const rule = parseTzTransition(sub);
      if (!rule) continue;
      if (sub.name === "DAYLIGHT") info.daylight = rule;
      else if (sub.name === "STANDARD") info.standard = rule;
    }
    map.set(tzid, info);
  }
  return map;
}

/** Day-of-month for the ordinal-th `weekday` of a month (ordinal -1 = last). */
function nthWeekday(year: number, month: number, weekday: number, ordinal: number): number {
  if (ordinal > 0) {
    const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    return 1 + ((weekday - firstDow + 7) % 7) + (ordinal - 1) * 7;
  }
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lastDow = new Date(Date.UTC(year, month - 1, lastDay)).getUTCDay();
  return lastDay - ((lastDow - weekday + 7) % 7) - (-ordinal - 1) * 7;
}

/** A comparable wall-clock key (treated as if UTC) for a transition in `year`. */
function transitionKey(t: TzTransition, year: number): number {
  const day = nthWeekday(year, t.month, t.weekday, t.ordinal);
  return Date.UTC(year, t.month - 1, day, t.hour, t.minute);
}

/** Offset (minutes) in effect for a wall-clock time, from VTIMEZONE rules. */
function vtimezoneOffset(info: TzInfo, dt: DateParts): number | null {
  const { standard, daylight } = info;
  if (standard && daylight) {
    const target = Date.UTC(dt.y, dt.mo - 1, dt.d, dt.h, dt.mi);
    const dstStart = transitionKey(daylight, dt.y);
    const stdStart = transitionKey(standard, dt.y);
    const inDst =
      dstStart < stdStart
        ? target >= dstStart && target < stdStart // northern hemisphere
        : target >= dstStart || target < stdStart; // southern hemisphere
    return inDst ? daylight.offsetTo : standard.offsetTo;
  }
  return (standard ?? daylight)?.offsetTo ?? null;
}

/** Resolve a DTSTART/DTEND value + TZID param to an ISO instant string. */
function resolveInstant(
  dt: DateParts,
  tzid: string | null,
  timezones: Map<string, TzInfo>,
): string | null {
  if (dt.utc) {
    return new Date(Date.UTC(dt.y, dt.mo - 1, dt.d, dt.h, dt.mi, dt.s)).toISOString();
  }
  if (tzid && !dt.dateOnly) {
    if (isIanaZone(tzid)) return ianaWallClockToUtc(dt, tzid).toISOString();
    const info = timezones.get(tzid);
    const off = info ? vtimezoneOffset(info, dt) : null;
    if (off != null) {
      const ms = Date.UTC(dt.y, dt.mo - 1, dt.d, dt.h, dt.mi, dt.s) - off * 60000;
      return new Date(ms).toISOString();
    }
  }
  // Floating / date-only / unresolved zone: interpret in the user's local time.
  const local = new Date(dt.y, dt.mo - 1, dt.d, dt.h, dt.mi, dt.s);
  return Number.isNaN(local.getTime()) ? null : local.toISOString();
}

// ---------------------------------------------------------------------------
// Field extraction.
// ---------------------------------------------------------------------------

// Known video-conferencing hosts, checked before falling back to any URL.
const MEETING_HOST =
  /(https?:\/\/[^\s<>"']*(?:meet\.google\.com|zoom\.us|teams\.microsoft\.com|teams\.live\.com|whereby\.com|webex\.com|meet\.jit\.si|chime\.aws|bluejeans\.com|gotomeeting\.com|around\.co)[^\s<>"']*)/i;
const ANY_URL = /(https?:\/\/[^\s<>"']+)/;

function findMeetingUrl(text: string): string {
  const known = MEETING_HOST.exec(text);
  if (known?.[1]) return known[1].replace(/[).,;]+$/, "");
  const any = ANY_URL.exec(text);
  return any?.[1] ? any[1].replace(/[).,;]+$/, "") : "";
}

function extractInterviewer(event: IcsBlock, description: string): string | null {
  // 1) An explicit "Interviewer(s): …" line is the cleanest signal when present.
  for (const line of description.split("\n")) {
    const m = /^\s*interviewers?\s*[:\-]\s*(.+)$/i.exec(line);
    if (m?.[1]) return m[1].trim();
  }
  // 2) Otherwise, named ATTENDEEs (may include the candidate — user trims).
  const attendees = event.props
    .filter((p) => p.name === "ATTENDEE")
    .map((p) => p.params.CN?.trim())
    .filter((cn): cn is string => !!cn);
  if (attendees.length) return attendees.join(", ");
  // 3) Last resort: the organizer's name.
  return prop(event, "ORGANIZER")?.params.CN?.trim() ?? null;
}

// ---------------------------------------------------------------------------
// Public entry point.
// ---------------------------------------------------------------------------

/** Parse the first VEVENT out of an .ics file. Returns null if there is none. */
export function parseIcs(text: string): ParsedIcsEvent | null {
  const root = parseBlocks(unfold(text));
  const event = findBlocks(root, "VEVENT")[0];
  if (!event) return null;
  const timezones = collectTimezones(root);

  const summary = prop(event, "SUMMARY")?.value;
  const title = summary ? cap(unescapeText(summary), TITLE_MAX) || null : null;

  const dtstart = prop(event, "DTSTART");
  const startParts = dtstart ? parseDateParts(dtstart.value) : null;
  const scheduledAt = startParts
    ? resolveInstant(startParts, dtstart?.params.TZID ?? null, timezones)
    : null;

  let durationMinutes: number | null = null;
  const dtend = prop(event, "DTEND");
  const endParts = dtend ? parseDateParts(dtend.value) : null;
  const endIso = endParts
    ? resolveInstant(endParts, dtend?.params.TZID ?? dtstart?.params.TZID ?? null, timezones)
    : null;
  if (scheduledAt && endIso) {
    const mins = Math.round((Date.parse(endIso) - Date.parse(scheduledAt)) / 60000);
    if (mins > 0 && mins <= 1440) durationMinutes = mins;
  }
  if (durationMinutes == null) {
    const dur = prop(event, "DURATION");
    if (dur) {
      const mins = parseDuration(dur.value);
      if (mins != null && mins > 0 && mins <= 1440) durationMinutes = mins;
    }
  }

  const description = prop(event, "DESCRIPTION")?.value
    ? unescapeText(prop(event, "DESCRIPTION")!.value)
    : "";

  const locationRaw = prop(event, "LOCATION")?.value;
  const locationText = locationRaw ? unescapeText(locationRaw).trim() : "";
  const location =
    cap(locationText || findMeetingUrl(`${locationText}\n${description}`), LOCATION_MAX) || null;

  const interviewer = (() => {
    const v = extractInterviewer(event, description);
    return v ? cap(v, INTERVIEWER_MAX) || null : null;
  })();

  const notes = description ? cap(description, NOTES_MAX) || null : null;

  return { title, scheduledAt, durationMinutes, location, interviewer, notes };
}
