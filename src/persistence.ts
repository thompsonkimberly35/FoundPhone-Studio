import Dexie, { type Table } from "dexie";
import type { Work, Runtime } from "./schema";

type SaveRecord = { id: string; state: Runtime };
type ManualSaveRecord = SaveRecord & {
  savedAt: string;
  selectedBoyfriend: string;
  selectedFriend: string;
};
type FallbackTable<T extends { id: string }> = {
  get(id: string): Promise<T | undefined>;
  put(value: T): Promise<string>;
  delete(id: string): Promise<void>;
};

const fallbackKey = (table: string, id: string) => `foundphone-studio:fallback:${table}:${id}`;
const readFallback = <T,>(table: string, id: string): T | undefined => {
  try {
    const raw = window.localStorage.getItem(fallbackKey(table, id));
    if (!raw) return undefined;
    const value = JSON.parse(raw) as T | { __deleted: true };
    return value && typeof value === "object" && "__deleted" in value
      ? undefined
      : value as T;
  } catch {
    return undefined;
  }
};
const writeFallback = <T,>(table: string, id: string, value: T | { __deleted: true }) => {
  try {
    window.localStorage.setItem(fallbackKey(table, id), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

class Database extends Dexie {
  works!: Table<Work, string>;
  private saveTable!: Table<SaveRecord, string>;
  private manualSaveTable!: Table<ManualSaveRecord, string>;
  saves: FallbackTable<SaveRecord>;
  manualSaves: FallbackTable<ManualSaveRecord>;

  constructor() {
    super("foundphone-studio");
    this.version(1).stores({ works: "id,updatedAt", saves: "id" });
    this.version(2).stores({ works: "id,updatedAt", saves: "id", manualSaves: "id" });
    this.saveTable = this.table("saves");
    this.manualSaveTable = this.table("manualSaves");
    this.saves = this.withFallback("saves", this.saveTable);
    this.manualSaves = this.withFallback("manualSaves", this.manualSaveTable);
  }

  private withFallback<T extends { id: string }>(
    name: string,
    table: Table<T, string>,
  ): FallbackTable<T> {
    return {
      get: async (id) => {
        const backup = readFallback<T>(name, id);
        try {
          const value = await table.get(id);
          if (value) {
            if (!backup) writeFallback(name, id, value);
            return value;
          }
          return backup;
        } catch {
          return backup;
        }
      },
      put: async (value) => {
        let indexedDbError: unknown;
        try {
          await table.put(value);
          writeFallback(name, value.id, value);
          return value.id;
        } catch (error) {
          indexedDbError = error;
        }
        if (writeFallback(name, value.id, value)) return value.id;
        const reason = indexedDbError instanceof Error ? indexedDbError.message : String(indexedDbError);
        throw new Error(`浏览器数据库与备用本地存储均无法写入：${reason}`);
      },
      delete: async (id) => {
        let indexedDbError: unknown;
        try {
          await table.delete(id);
        } catch (error) {
          indexedDbError = error;
        }
        if (!writeFallback(name, id, { __deleted: true })) {
          if (indexedDbError) throw indexedDbError;
          try { window.localStorage.removeItem(fallbackKey(name, id)); } catch { /* storage unavailable */ }
        }
      },
    };
  }
}

export const db = new Database();
