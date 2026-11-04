import { makeItem, type Item, type Runtime } from "./schema";

export const JAPAN_LOTTERY_BATCH_ID = "ald1-japan-lottery-rejection-2026";
export const JAPAN_LOTTERY_SUBJECT =
  "【落選】ALPHA DRIVE ONE 2ND MINI ALBUM〈UNBREAKABLE：少年BEAST〉购入者 日本限定特典";
export const JAPAN_LOTTERY_URL =
  "https://mg.withlive-app.com/lottery/confirm";
export const JAPAN_LOTTERY_BODY_PREFIX = `この度は、ALPHA DRIVE ONE 2ND MINI ALBUM
〈UNBREAKABLE：少年BEAST〉日本限定特典にご応募いただきありがとうございます。


お客様の応募内容・抽選結果は、下記の通りとなります。

[シリアルナンバー] `;
export const JAPAN_LOTTERY_BODY_SUFFIX = `
[申込受付日] 2026年10月25日
--------------
■応募内容
A賞【個別トーク会】11/1（日）パシフィコ横浜
--------------

■抽選結果
落選

※応募内容、抽選結果は、応募サイトの「抽選エントリー状況確認（${JAPAN_LOTTERY_URL}）」からもご確認いただけます。`;

// Verified against the supplied serial fpEkQ6x3LDAF:
// lower, lower, upper, lower, upper, digit, lower, digit, upper x 4.
export const SERIAL_PATTERN = /^[a-z]{2}[A-Z][a-z][A-Z][0-9][a-z][0-9][A-Z]{4}$/;
const SERIAL_ALPHABETS = "abcdefghijklmnopqrstuvwxyz";
const SERIAL_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SERIAL_DIGITS = "0123456789";
const SERIAL_MASK = [
  SERIAL_ALPHABETS,
  SERIAL_ALPHABETS,
  SERIAL_UPPER,
  SERIAL_ALPHABETS,
  SERIAL_UPPER,
  SERIAL_DIGITS,
  SERIAL_ALPHABETS,
  SERIAL_DIGITS,
  SERIAL_UPPER,
  SERIAL_UPPER,
  SERIAL_UPPER,
  SERIAL_UPPER,
];

type RandomFill = (buffer: Uint8Array) => Uint8Array;

function secureRandomFill(buffer: Uint8Array): Uint8Array {
  if (!globalThis.crypto?.getRandomValues)
    throw new Error("此设备不支持安全随机数，无法初始化邮件序号。");
  return globalThis.crypto.getRandomValues(buffer);
}

export function generateSerialNumbers(
  count = 20,
  randomFill: RandomFill = secureRandomFill,
  initiallyUsed: Iterable<string> = [],
): string[] {
  const used = new Set(initiallyUsed);
  const serials: string[] = [];
  let attempts = 0;
  while (serials.length < count) {
    if (++attempts > count * 1000)
      throw new Error("无法生成足够的不重复邮件序号。");
    const bytes = randomFill(new Uint8Array(SERIAL_MASK.length));
    const serial = SERIAL_MASK.map(
      (alphabet, index) => alphabet[bytes[index] % alphabet.length],
    ).join("");
    if (!SERIAL_PATTERN.test(serial) || used.has(serial)) continue;
    used.add(serial);
    serials.push(serial);
  }
  return serials;
}

function batchItems(items: Item[]) {
  return items.filter((item) => item.meta?.mailBatchId === JAPAN_LOTTERY_BATCH_ID);
}

/** Seed the mail batch once per saved runtime. Existing mail from other batches is retained. */
export function ensureJapanLotteryMail(runtime: Runtime): Runtime {
  const existing = runtime.messages.mail ?? [];
  const batch = batchItems(existing);
  const present = new Map(
    batch.map((item) => [Number(item.meta.mailIndex), item]),
  );
  const missing = Array.from({ length: 20 }, (_, index) => index + 1).filter(
    (index) => !present.has(index),
  );
  if (!missing.length) return runtime;

  const serials = generateSerialNumbers(
    missing.length,
    secureRandomFill,
    batch.map((item) => item.meta.serialNumber).filter(Boolean),
  );
  const additions = missing.map((index, offset) => {
    const serialNumber = serials[offset];
    const time = `2026-10-25 09:${String(index - 1).padStart(2, "0")}`;
    const item = makeItem({
      id: `${JAPAN_LOTTERY_BATCH_ID}-${String(index).padStart(2, "0")}`,
      title: JAPAN_LOTTERY_SUBJECT,
      body: JAPAN_LOTTERY_BODY_PREFIX + serialNumber + JAPAN_LOTTERY_BODY_SUFFIX,
      time,
      sender: "support-mg",
      read: false,
    });
    item.meta = {
      ...item.meta,
      mailBatchId: JAPAN_LOTTERY_BATCH_ID,
      mailIndex: String(index),
      serialNumber,
      receivedAt: String(Date.parse(`2026-10-25T09:${String(index - 1).padStart(2, "0")}:00+09:00`)),
    };
    return item;
  });

  return {
    ...runtime,
    messages: {
      ...runtime.messages,
      mail: [...existing, ...additions],
    },
  };
}

export function getJapanLotteryMail(items: Item[]): Item[] {
  return batchItems(items).sort(
    (a, b) => Number(a.meta.mailIndex) - Number(b.meta.mailIndex),
  );
}
