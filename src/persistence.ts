import Dexie, { type Table } from "dexie";
import type { Work, Runtime } from "./schema";
class Database extends Dexie {
  works!: Table<Work, string>;
  saves!: Table<{ id: string; state: Runtime }, string>;
  manualSaves!: Table<{ id: string; state: Runtime; savedAt: string; selectedBoyfriend: string; selectedFriend: string }, string>;
  constructor() {
    super("foundphone-studio");
    this.version(1).stores({ works: "id,updatedAt", saves: "id" });
    this.version(2).stores({ works: "id,updatedAt", saves: "id", manualSaves: "id" });
  }
}
export const db = new Database();
