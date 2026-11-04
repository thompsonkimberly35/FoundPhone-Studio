import { describe, expect, it } from "vitest";
import { createWork } from "./demo";
import { initialRuntime, makeItem } from "./schema";
import {
  ensureJapanLotteryMail,
  generateSerialNumbers,
  getJapanLotteryMail,
  JAPAN_LOTTERY_BATCH_ID,
  JAPAN_LOTTERY_BODY_PREFIX,
  JAPAN_LOTTERY_BODY_SUFFIX,
  JAPAN_LOTTERY_SUBJECT,
  SERIAL_PATTERN,
} from "./mail";

describe("Japan limited lottery rejection mail batch", () => {
  it("generates twenty unique serials in the exact supplied character-position format", () => {
    const serials = generateSerialNumbers(20);
    expect(serials).toHaveLength(20);
    expect(new Set(serials).size).toBe(20);
    for (const serial of serials) {
      expect(serial).toMatch(SERIAL_PATTERN);
      expect(serial).toHaveLength(12);
      expect((serial.match(/[a-z]/g) ?? []).length).toBe(4);
      expect((serial.match(/[A-Z]/g) ?? []).length).toBe(6);
      expect((serial.match(/[0-9]/g) ?? []).length).toBe(2);
    }
  });

  it("seeds exactly twenty independent messages once and keeps their serials stable", () => {
    const runtime = initialRuntime(createWork());
    const seeded = ensureJapanLotteryMail(runtime);
    const mail = getJapanLotteryMail(seeded.messages.mail ?? []);
    expect(mail).toHaveLength(20);
    expect(new Set(mail.map((item) => item.id)).size).toBe(20);
    expect(new Set(mail.map((item) => item.meta.serialNumber)).size).toBe(20);
    expect(mail.every((item) => item.sender === "support-mg")).toBe(true);
    expect(mail.every((item) => item.title === JAPAN_LOTTERY_SUBJECT)).toBe(true);
    expect(mail.map((item) => item.meta.mailIndex)).toEqual(
      Array.from({ length: 20 }, (_, index) => String(index + 1)),
    );
    const normalizedBodies = mail.map((item) =>
      item.body.replace(
        /(?<=\[シリアルナンバー\] )[A-Za-z0-9]{12}/,
        "<SERIAL>",
      ),
    );
    expect(new Set(normalizedBodies).size).toBe(1);
    expect(normalizedBodies[0]).toBe(
      JAPAN_LOTTERY_BODY_PREFIX + "<SERIAL>" + JAPAN_LOTTERY_BODY_SUFFIX,
    );
    expect(ensureJapanLotteryMail(seeded)).toBe(seeded);
    const refreshed = ensureJapanLotteryMail(structuredClone(seeded));
    expect(getJapanLotteryMail(refreshed.messages.mail ?? []).map((item) => item.meta.serialNumber))
      .toEqual(mail.map((item) => item.meta.serialNumber));
  });

  it("preserves other existing mail and read states when upgrading an old save", () => {
    const oldMail = makeItem({ id: "older-mail", sender: "someone", title: "旧邮件" });
    const runtime = {
      ...initialRuntime(createWork()),
      messages: { mail: [oldMail] },
    };
    const seeded = ensureJapanLotteryMail(runtime);
    expect(seeded.messages.mail).toHaveLength(21);
    const first = getJapanLotteryMail(seeded.messages.mail)[0];
    const withRead = {
      ...seeded,
      messages: {
        ...seeded.messages,
        mail: seeded.messages.mail.map((item) =>
          item.id === first.id ? { ...item, read: true } : item,
        ),
      },
    };
    expect(ensureJapanLotteryMail(withRead)).toBe(withRead);
    expect(withRead.messages.mail.find((item) => item.id === first.id)?.read).toBe(true);
    expect(withRead.messages.mail.some((item) => item.id === oldMail.id)).toBe(true);
    expect(first.meta.mailBatchId).toBe(JAPAN_LOTTERY_BATCH_ID);
  });
});
