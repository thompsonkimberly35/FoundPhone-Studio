import type { Item, Runtime, Work } from "./schema";

export type GameClockState = {
  currentGameTimestamp: number;
  lastRealTimestamp: number;
  timeScale: number;
  timezone: string;
  currentStoryDay: number;
  migrationVersion: number;
};

const DEFAULT_TIMEZONE = "Asia/Seoul";
const pad = (value: number) => String(value).padStart(2, "0");

function zonedParts(timestamp: number, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(value.year), month: Number(value.month), day: Number(value.day),
    hour: Number(value.hour), minute: Number(value.minute), second: Number(value.second),
  };
}

export function zonedDateTimeToTimestamp(date: string, time: string, timezone = DEFAULT_TIMEZONE): number {
  const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!dateMatch || !timeMatch) return Date.parse(date + "T" + time) || 0;
  const [, year, month, day] = dateMatch;
  const [, hour, minute, second = "0"] = timeMatch;
  const target = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  let guess = target;
  for (let index = 0; index < 3; index++) {
    const p = zonedParts(guess, timezone);
    const represented = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    guess += target - represented;
  }
  return guess;
}

export function formatGameDate(timestamp: number, timezone = DEFAULT_TIMEZONE): string {
  const p = zonedParts(timestamp, timezone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}
export function formatGameTime(timestamp: number, timezone = DEFAULT_TIMEZONE): string {
  const p = zonedParts(timestamp, timezone);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}
export function formatGameDateTime(timestamp: number, timezone = DEFAULT_TIMEZONE): string {
  return `${formatGameDate(timestamp, timezone)} ${formatGameTime(timestamp, timezone)}`;
}

export function createGameClock(date: string | undefined, time: string, timezone = DEFAULT_TIMEZONE): GameClockState {
  const storyDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "2026-10-25";
  const timestamp = zonedDateTimeToTimestamp(storyDate, /^\d{1,2}:\d{2}$/.test(time) ? time : "09:00", timezone);
  return {
    currentGameTimestamp: timestamp,
    lastRealTimestamp: Date.now(),
    timeScale: 1,
    timezone,
    currentStoryDay: 1,
    migrationVersion: 0,
  };
}

export function ensureGameClock(runtime: Runtime, work: Work): GameClockState {
  if (runtime.gameClock && Number.isFinite(runtime.gameClock.currentGameTimestamp)) {
    return {
      ...runtime.gameClock,
      timezone: runtime.gameClock.timezone || DEFAULT_TIMEZONE,
      timeScale: Number.isFinite(runtime.gameClock.timeScale) ? Math.max(0, runtime.gameClock.timeScale) : 1,
      currentStoryDay: Math.max(1, runtime.gameClock.currentStoryDay || 1),
      migrationVersion: runtime.gameClock.migrationVersion || 0,
    };
  }
  return createGameClock(runtime.date || work.phone.date, runtime.time || work.phone.time);
}

function inferLegacyTime(item: Item, date: string, timezone: string, cursor: number): number {
  const explicit = item.time.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}:\d{2})(?::\d{2})?$/);
  if (explicit) return zonedDateTimeToTimestamp(explicit[1], explicit[2], timezone);
  const clock = item.time.match(/(\d{1,2}):(\d{2})$/);
  let hour = clock ? Number(clock[1]) : 9;
  let minute = clock ? Number(clock[2]) : 0;
  const body = item.body;
  if (/晚安|睡吧|早点休息|准备睡|睡觉/.test(body)) hour = Math.max(hour, 22);
  if (/早安|早上好|起床了吗/.test(body)) hour = Math.min(hour, 9);
  if (/午安|午餐|午饭|中午/.test(body)) hour = 12;
  if (/下班|练习结束|晚上|晚餐|夜宵/.test(body)) hour = Math.max(hour, 19);
  let candidate = zonedDateTimeToTimestamp(date, `${pad(hour)}:${pad(minute)}`, timezone);
  if (/早安|早上好|起床了吗/.test(body) && candidate <= cursor && cursor - candidate > 6 * 60 * 60 * 1000) {
    candidate = zonedDateTimeToTimestamp(formatGameDate(cursor + 24 * 60 * 60 * 1000, timezone), `${pad(hour)}:${pad(minute)}`, timezone);
  }
  if (candidate <= cursor) candidate = cursor + (1 + (item.id.length % 3)) * 60_000;
  return candidate;
}

/** One-time conservative migration: preserve explicit dates; infer only missing timestamps. */
export function migrateRuntimeGameClock(runtime: Runtime, work: Work): Runtime {
  const clock = ensureGameClock(runtime, work);
  if (clock.migrationVersion >= 1 && runtime.gameClock) return runtime;
  const timezone = clock.timezone;
  const baseline = zonedDateTimeToTimestamp(runtime.date || work.phone.date || "2026-10-25", "00:00", timezone);
  const explicitTimes = Object.values(runtime.messages || {}).flat().map((item) => {
    const match = item.time.match(/^(\\d{4}-\\d{2}-\\d{2})[ T](\\d{1,2}:\\d{2})/);
    return match ? zonedDateTimeToTimestamp(match[1], match[2], timezone) : Number.POSITIVE_INFINITY;
  });
  let cursor = Math.min(baseline, ...explicitTimes) - 1;
  const messages: Runtime["messages"] = {};
  for (const [appId, items] of Object.entries(runtime.messages || {})) {
    messages[appId] = (items || []).map((item) => {
      if (Number.isFinite(item.sentAt)) {
        cursor = Math.max(cursor, Number(item.sentAt));
        return item;
      }
      const sentAt = inferLegacyTime(item, runtime.date || work.phone.date || formatGameDate(cursor, timezone), timezone, cursor - 1);
      cursor = Math.max(cursor, sentAt);
      return { ...item, sentAt, time: formatGameDateTime(sentAt, timezone) };
    });
  }
  const currentGameTimestamp = Math.max(clock.currentGameTimestamp, cursor);
  const migratedClock = {
    ...clock,
    currentGameTimestamp,
    currentStoryDay: Math.max(clock.currentStoryDay, Math.floor((Date.UTC(Number(formatGameDate(currentGameTimestamp, timezone).slice(0, 4)), Number(formatGameDate(currentGameTimestamp, timezone).slice(5, 7)) - 1, Number(formatGameDate(currentGameTimestamp, timezone).slice(8, 10))) - Date.UTC(Number(formatGameDate(clock.currentGameTimestamp, timezone).slice(0, 4)), Number(formatGameDate(clock.currentGameTimestamp, timezone).slice(5, 7)) - 1, Number(formatGameDate(clock.currentGameTimestamp, timezone).slice(8, 10)))) / 86_400_000) + 1),
    lastRealTimestamp: Date.now(),
    migrationVersion: 1,
  };
  return {
    ...runtime,
    gameClock: migratedClock,
    date: formatGameDate(currentGameTimestamp, timezone),
    time: formatGameTime(currentGameTimestamp, timezone),
    messages,
  };
}

function applyTextTimeHint(item: Item, timestamp: number, timezone: string): number {
  const body = item.body;
  const date = formatGameDate(timestamp, timezone);
  const time = formatGameTime(timestamp, timezone);
  const hour = Number(time.slice(0, 2));
  const choose = (targetDate: string, targetTime: string) => zonedDateTimeToTimestamp(targetDate, targetTime, timezone);
  if (/晚安|睡吧|早点休息|准备睡觉|要睡了|先睡了/.test(body)) {
    const target = choose(date, "23:00");
    return target > timestamp ? target : choose(formatGameDate(timestamp + 86_400_000, timezone), "23:00");
  }
  if (/早安|早上好|起床了吗|醒了吗/.test(body)) {
    const targetDate = hour >= 18 ? formatGameDate(timestamp + 86_400_000, timezone) : date;
    const target = choose(targetDate, "08:30");
    return target > timestamp ? target : timestamp + 60_000;
  }
  if (/午安|午餐|午饭|中午/.test(body) && hour < 12) return choose(date, "12:00");
  if (/晚上好|晚餐|下班了|练习结束|夜宵/.test(body) && hour < 19) return choose(date, "19:00");
  return timestamp;
}

/** Stamp only newly appended messages, once, in deterministic cross-App order. */
export function stampNewMessages(previous: Runtime, next: Runtime): Runtime {
  const clock = ensureGameClock(next, { phone: { date: next.date, time: next.time } } as Work);
  let cursor = Math.max(clock.currentGameTimestamp, ...Object.values(previous.messages || {}).flat().map((item) => Number(item.sentAt || 0)));
  let changed = false;
  let hasStampedMessage = false;
  const messages: Runtime["messages"] = {};
  for (const [appId, items] of Object.entries(next.messages || {})) {
    const oldIds = new Set((previous.messages?.[appId] || []).map((item) => item.id));
    messages[appId] = (items || []).map((item) => {
      if (oldIds.has(item.id) || Number.isFinite(item.sentAt)) return item;
      if (hasStampedMessage) cursor += 60_000;
      else cursor = applyTextTimeHint(item, cursor, clock.timezone);
      const sentAt = cursor;
      hasStampedMessage = true;
      changed = true;
      return { ...item, sentAt, time: formatGameDateTime(sentAt, clock.timezone) };
    });
  }
  if (!changed) return next;
  const currentGameTimestamp = Math.max(clock.currentGameTimestamp, cursor);
  const gameClock = { ...clock, currentGameTimestamp, lastRealTimestamp: Date.now() };
  return {
    ...next,
    messages,
    gameClock,
    date: formatGameDate(currentGameTimestamp, clock.timezone),
    time: formatGameTime(currentGameTimestamp, clock.timezone),
  };
}

export function setGameClockTime(clock: GameClockState, time: string, date?: string): GameClockState {
  const currentDate = formatGameDate(clock.currentGameTimestamp, clock.timezone);
  const requestedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : currentDate;
  let timestamp = zonedDateTimeToTimestamp(requestedDate, time, clock.timezone);
  if (!date && timestamp < clock.currentGameTimestamp) {
    timestamp = zonedDateTimeToTimestamp(formatGameDate(clock.currentGameTimestamp + 86_400_000, clock.timezone), time, clock.timezone);
  }
  timestamp = Math.max(clock.currentGameTimestamp, timestamp);
  const nextDate = formatGameDate(timestamp, clock.timezone);
  const dayNumber = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return Date.UTC(year, month - 1, day) / 86_400_000;
  };
  const dayDelta = Math.max(0, dayNumber(nextDate) - dayNumber(currentDate));
  return {
    ...clock,
    currentGameTimestamp: timestamp,
    currentStoryDay: clock.currentStoryDay + dayDelta,
    lastRealTimestamp: Date.now(),
  };
}

export type StoryTimeHint = {
  period?: "morning" | "noon" | "afternoon" | "evening" | "night";
  earliestTime?: string;
  preferredTime?: string;
  advanceToNextDay?: boolean;
  minimumElapsedMinutes?: number;
};

export function applyStoryTimeHint(clock: GameClockState, hint: StoryTimeHint): GameClockState {
  const targets: Record<NonNullable<StoryTimeHint["period"]>, string> = {
    morning: "08:30", noon: "12:00", afternoon: "15:00", evening: "19:30", night: "22:30",
  };
  const current = clock.currentGameTimestamp;
  let timestamp = current + Math.max(0, hint.minimumElapsedMinutes || 0) * 60_000;
  const requested = hint.preferredTime || hint.earliestTime || (hint.period ? targets[hint.period] : "");
  if (requested) {
    const date = hint.advanceToNextDay
      ? formatGameDate(timestamp + 86_400_000, clock.timezone)
      : formatGameDate(timestamp, clock.timezone);
    const target = zonedDateTimeToTimestamp(date, requested, clock.timezone);
    timestamp = Math.max(timestamp, target);
    if (!hint.advanceToNextDay && target < current) {
      timestamp = zonedDateTimeToTimestamp(formatGameDate(current + 86_400_000, clock.timezone), requested, clock.timezone);
    }
  } else if (hint.advanceToNextDay) {
    timestamp = Math.max(timestamp, zonedDateTimeToTimestamp(formatGameDate(current + 86_400_000, clock.timezone), "08:00", clock.timezone));
  }
  return setGameClockTime(clock, formatGameTime(timestamp, clock.timezone), formatGameDate(timestamp, clock.timezone));
}
