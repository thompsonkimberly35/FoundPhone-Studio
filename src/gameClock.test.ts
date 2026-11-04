import { describe, expect, it } from "vitest";
import { advance, dispatch } from "./engine";
import { createWork } from "./demo";
import { initialRuntime, makeItem } from "./schema";
import {
  formatGameDate,
  formatGameDateTime,
  formatGameTime,
  formatRelativeGameTime,
  migrateRuntimeGameClock,
  normalizeStoryItems,
  stampNewMessages,
  zonedDateTimeToTimestamp,
} from "./gameClock";

describe("global story clock", () => {
  it("advances one game minute per real minute and rolls the story date at midnight", () => {
    const work = createWork();
    const state = initialRuntime(work);
    const timestamp = zonedDateTimeToTimestamp("2026-10-25", "23:59");
    state.gameClock = { ...state.gameClock!, currentGameTimestamp: timestamp };
    state.date = "2026-10-25";
    state.time = "23:59";

    const next = advance(work, state, 60_000);

    expect(next.time).toBe("00:00");
    expect(next.date).toBe("2026-10-26");
    expect(formatGameDate(next.gameClock!.currentGameTimestamp)).toBe("2026-10-26");
    expect(next.gameClock!.currentStoryDay).toBe(2);
  });

  it("keeps an explicit story time action monotonic across midnight", () => {
    const work = createWork();
    work.mode = "story";
    work.nodes = [{
      ...work.nodes[0],
      id: "set-late-night",
      type: "action",
      event: "test-time",
      target: "",
      next: [],
      actions: [{ type: "time", key: "", value: "23:45" }],
    }];
    const state = initialRuntime(work);
    state.time = "08:00";
    state.gameClock = { ...state.gameClock!, currentGameTimestamp: zonedDateTimeToTimestamp("2026-10-25", "08:00") };

    const next = dispatch(work, state, "test-time");

    expect(next.date).toBe("2026-10-25");
    expect(next.time).toBe("23:45");
  });

  it("gives every newly delivered cross-App message its own persistent timestamp", () => {
    const work = createWork();
    const previous = initialRuntime(work);
    previous.gameClock = { ...previous.gameClock!, currentGameTimestamp: zonedDateTimeToTimestamp("2026-10-25", "22:58") };
    previous.date = "2026-10-25";
    previous.time = "22:58";
    const next = {
      ...previous,
      messages: {
        kakao: [
          makeItem({ id: "night-1", sender: "男友", title: "男友", body: "晚安，早点休息。" }),
          makeItem({ id: "morning-1", sender: "男友", title: "男友", body: "早安，起床了吗？" }),
        ],
        twitter: [makeItem({ id: "x-1", sender: "官方账号", title: "官方账号", body: "新的公告。" })],
      },
    };

    const stamped = stampNewMessages(previous, next);
    const messages = [...stamped.messages.kakao, ...stamped.messages.twitter];

    expect(messages.every((item) => Number.isFinite(item.sentAt))).toBe(true);
    expect(messages[0].time).toBe("2026-10-25 23:00");
    expect(messages[1].time).toBe("2026-10-26 08:30");
    expect(messages[2].sentAt).toBeGreaterThan(messages[1].sentAt!);
    expect(formatGameDateTime(messages[1].sentAt!)).toBe(messages[1].time);
  });

  it("migrates repeated legacy 09:00 times once without rewriting explicit historical timestamps", () => {
    const work = createWork();
    const state = initialRuntime(work);
    const fixed = makeItem({ id: "legacy-fixed", time: "09:00", body: "今天有空嗎？" });
    const goodnight = makeItem({ id: "legacy-night", time: "09:00", body: "晚安，今天辛苦了。" });
    const morning = makeItem({ id: "legacy-morning", time: "09:00", body: "早安，起床了吗？" });
    const explicitAt = zonedDateTimeToTimestamp("2026-10-20", "14:36");
    const explicit = makeItem({ id: "legacy-explicit", time: "2026-10-20 14:36", sentAt: explicitAt });
    state.messages = { kakao: [fixed, goodnight, morning, explicit] };

    const migrated = migrateRuntimeGameClock(state, work);

    expect(migrated.messages.kakao[0].time).toContain("09:00");
    expect(migrated.messages.kakao[1].time).toContain("22:00");
    expect(migrated.messages.kakao[2].time).toContain("2026-10-26");
    expect(migrated.messages.kakao[3].sentAt).toBe(explicitAt);
    expect(migrateRuntimeGameClock(migrated, work)).toBe(migrated);
  });

  it("formats the phone clock using the story timezone, not the device timezone", () => {
    const timestamp = zonedDateTimeToTimestamp("2026-10-25", "23:17", "Asia/Seoul");
    expect(formatGameDate(timestamp, "Asia/Seoul")).toBe("2026-10-25");
    expect(formatGameTime(timestamp, "Asia/Seoul")).toBe("23:17");
  });
  it("applies explicit story node time hints and advances to the next morning", () => {
    const work = createWork();
    work.mode = "story";
    work.nodes = [{
      ...work.nodes[0],
      id: "next-morning",
      type: "action",
      event: "story-morning",
      target: "",
      next: [],
      actions: [],
      timeHint: { period: "morning", advanceToNextDay: true },
    }];
    const state = initialRuntime(work);
    state.date = "2026-10-25";
    state.time = "23:00";
    state.gameClock = { ...state.gameClock!, currentGameTimestamp: zonedDateTimeToTimestamp("2026-10-25", "23:00") };

    const next = dispatch(work, state, "story-morning");

    expect(next.date).toBe("2026-10-26");
    expect(next.time).toBe("08:30");
    expect(next.gameClock!.currentStoryDay).toBe(2);
  });

  it("normalizes static legacy 09:00 story fixtures without mutating source items", () => {
    const source = [
      makeItem({ id: "static-day", time: "09:00", body: "早安，起床了吗？" }),
      makeItem({ id: "static-night", time: "09:00", body: "晚安，早点休息。" }),
    ];
    const normalized = normalizeStoryItems(source, "2026-10-25");

    expect(normalized[0].time).toContain("08:30");
    expect(normalized[1].time).toContain("23:00");
    expect(source.every((item) => item.time === "09:00")).toBe(true);
  });
  it("formats Threads relative times against the virtual game timestamp", () => {
    const now = zonedDateTimeToTimestamp("2026-10-25", "15:40");
    expect(formatRelativeGameTime(now - 5 * 60_000, now)).toBe("5分钟前");
    expect(formatRelativeGameTime(now - 2 * 60 * 60_000, now)).toBe("2小时前");
    expect(formatRelativeGameTime(now - 2 * 86_400_000, now)).toBe("2天前");
  });
});
