import { describe, expect, it } from "vitest";
import { FRIEND_STORY, getFriendStoryChoice, getFriendStoryNode, getFriendStoryNodeCount } from "./kakaoFriendStory";

describe("KakaoTalk confidant friend story", () => {
  it("contains the full F001-F069 branch set and all twelve stage outcomes", () => {
    expect(getFriendStoryNodeCount()).toBe(85);
    expect(getFriendStoryNode("F001")?.choices).toHaveLength(3);
    expect(getFriendStoryNode("F002A")?.choices).toHaveLength(3);
    for (const outcome of Array.from({ length: 12 }, (_, i) => "H" + String(i + 1).padStart(2, "0"))) {
      expect(getFriendStoryNode(outcome)?.result).toBe(outcome);
      expect(getFriendStoryNode(outcome)?.choices).toHaveLength(0);
    }
  });

  it("has no missing choice targets", () => {
    const ids = new Set(Object.keys(FRIEND_STORY));
    for (const node of Object.values(FRIEND_STORY)) {
      for (const choice of node.choices) expect(ids.has(choice.next)).toBe(true);
    }
  });

  it("reaches all F nodes and all twelve outcomes from F001", () => {
    const visited = new Set<string>(["F001"]);
    const pending = ["F001"];
    while (pending.length) {
      const node = getFriendStoryNode(pending.pop()!);
      for (const choice of node?.choices ?? []) {
        if (!visited.has(choice.next)) {
          visited.add(choice.next);
          pending.push(choice.next);
        }
      }
    }
    for (const id of Object.keys(FRIEND_STORY).filter(id => id !== "F070" && id !== "F071")) expect(visited.has(id)).toBe(true);
    expect(getFriendStoryNode("F070")?.choices).toHaveLength(3);
    expect(getFriendStoryNode("F071")?.choices).toHaveLength(3);
  });

  it("keeps A/B/C choices separate and targets distinct branches", () => {
    expect(getFriendStoryChoice("F001", "A")?.next).toBe("F002A");
    expect(getFriendStoryChoice("F001", "B")?.next).toBe("F002B");
    expect(getFriendStoryChoice("F001", "C")?.next).toBe("F002C");
    expect(new Set(["A", "B", "C"].map(key => getFriendStoryChoice("F002A", key)?.next)).size).toBe(3);
  });
});
