import { describe, expect, it } from "vitest";
import {
  FRIEND_PHASE2_STORY,
  getFriendPhase2Node,
  getFriendPhase2NodeCount,
  getFriendPhase2OutcomeLabel,
  getFriendPhase2OutcomeClass,
  resolveFriendPhase2Next,
} from "./kakaoFriendStoryPhase2";

describe("KakaoTalk confidant friend story phase two", () => {
  it("keeps phase two independent from the original F001-F069 and H01-H12 identifiers", () => {
    expect(getFriendPhase2NodeCount()).toBe(54);
    expect(getFriendPhase2Node("F2_070")).toBeDefined();
    for (let i = 1; i <= 12; i++) {
      expect(FRIEND_PHASE2_STORY["H" + String(i).padStart(2, "0")]).toBeUndefined();
    }
    for (let i = 13; i <= 20; i++) {
      const id = "H" + i;
      expect(getFriendPhase2Node(id)?.result).toBe(id);
      expect(getFriendPhase2Node(id)?.choices).toHaveLength(0);
    }
  });

  it("has no dangling choice targets", () => {
    for (const node of Object.values(FRIEND_PHASE2_STORY)) {
      for (const choice of node.choices) expect(FRIEND_PHASE2_STORY[choice.next]).toBeDefined();
    }
  });

  it("reaches every ending, including the low-trust estrangement route", () => {
    const visited = new Set<string>(["F2_070"]);
    const pending = ["F2_070"];
    while (pending.length) {
      const node = getFriendPhase2Node(pending.pop()!);
      for (const choice of node?.choices ?? []) {
        const next = choice.next;
        if (!visited.has(next)) {
          visited.add(next);
          pending.push(next);
        }
        if (node?.id === "F2_080" && choice.key === "B") {
          const conditional = resolveFriendPhase2Next(node.id, choice.key, next, -2, 1, 0);
          if (!visited.has(conditional)) {
            visited.add(conditional);
            pending.push(conditional);
          }
        }
      }
    }
    for (let i = 13; i <= 20; i++) expect(visited.has("H" + i)).toBe(true);
  });

  it("routes low trust or repeated concealment to the estrangement confrontation", () => {
    expect(resolveFriendPhase2Next("F2_080", "B", "F2_083", -2, 0, 0)).toBe("F2_087");
    expect(resolveFriendPhase2Next("F2_080", "B", "F2_083", -1, 0, 0)).toBe("F2_087");
    expect(resolveFriendPhase2Next("F2_080", "B", "F2_083", 0, 1, 0)).toBe("F2_087");
    expect(resolveFriendPhase2Next("F2_080", "B", "F2_083", 2, 0, 0)).toBe("F2_083");
    expect(resolveFriendPhase2Next("F2_080", "A", "F2_081", -2, 2, 2)).toBe("F2_081");
    expect(resolveFriendPhase2Next("F2_081", "A", "H13", 2, 0, 0, true)).toBe("H13");
    expect(resolveFriendPhase2Next("F2_081", "A", "H13", 2, 0, 0, false)).toBe("H14");
    expect(resolveFriendPhase2Next("F2_081", "A", "H13", 0, 0, 0, true)).toBe("H14");
    expect(resolveFriendPhase2Next("F2_084", "B", "H15", -1, 0, 0)).toBe("H14");
  });

  it("classifies all twelve previous outcomes without rewriting their meanings", () => {
    expect(getFriendPhase2OutcomeClass("H01")).toBe("close");
    expect(getFriendPhase2OutcomeClass("H05")).toBe("close");
    expect(getFriendPhase2OutcomeClass("H02")).toBe("ordinary");
    expect(getFriendPhase2OutcomeClass("H07")).toBe("ordinary");
    expect(getFriendPhase2OutcomeClass("H06")).toBe("tense");
    expect(getFriendPhase2OutcomeClass("H10")).toBe("tense");
    expect(getFriendPhase2OutcomeClass("H04")).toBe("distant");
    expect(getFriendPhase2OutcomeClass("H08")).toBe("ordinary");
  });

  it("holds the X leak node until its scheduled event is delivered", () => {
    expect(getFriendPhase2Node("F2_074")?.choices).toHaveLength(1);
    expect(getFriendPhase2Node("F2_074")?.lines).toHaveLength(0);
  });

  it("stores a distinct Simplified Chinese name for every ending", () => {
    const labels = ["重新相信", "有裂痕的友情", "共同面对", "替你承担", "两个重要的人", "无法原谅", "未完成的道歉", "第二次谎言"];
    for (let i = 13; i <= 20; i++) {
      expect(getFriendPhase2OutcomeLabel("H" + i)).toBe(labels[i - 13]);
    }
  });

  it("provides a distinct future conversation for each of the eight endings", () => {
    for (let i = 13; i <= 20; i++) {
      const outcome = "H" + i;
      const followup = getFriendPhase2Node("F2_090_" + outcome);
      expect(followup?.lines.length).toBeGreaterThan(0);
      expect(followup?.choices).toHaveLength(3);
    }
  });
});
