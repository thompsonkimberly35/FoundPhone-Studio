import { describe, expect, it } from "vitest";
import {
  FRIEND_PHASE3_STORY,
  getFriendPhase3Choice,
  getFriendPhase3Node,
  getFriendPhase3NodeCount,
  validateFriendPhase3Story,
} from "./kakaoFriendStoryPhase3";

describe("KakaoTalk confidant friend story phase three", () => {
  it("contains exactly thirty new nodes and eight distinct outcomes", () => {
    expect(getFriendPhase3NodeCount()).toBe(30);
    for (let i = 21; i <= 28; i++) {
      const id = "H" + i;
      expect(FRIEND_PHASE3_STORY[id]?.result).toBe(id);
      expect(FRIEND_PHASE3_STORY[id]?.choices).toHaveLength(0);
    }
  });

  it("uses unique IDs without overwriting either previous friend phase", () => {
    expect(FRIEND_PHASE3_STORY.F088).toBeDefined();
    expect(FRIEND_PHASE3_STORY.F117).toBeDefined();
    expect(FRIEND_PHASE3_STORY.H21).toBeDefined();
    expect(FRIEND_PHASE3_STORY.H28).toBeDefined();
  });

  it("has no dangling targets and every node and outcome is reachable", () => {
    expect(validateFriendPhase3Story()).toEqual([]);
  });

  it("does not claim a confrontation happened before a completed event", () => {
    const node = getFriendPhase3Node("F092", { knowsBoyfriendConflict: false });
    expect(node?.lines.join(" ")).toContain("没有听到他们吵架");
    expect(getFriendPhase3Node("F092", { knowsBoyfriendConflict: true })?.lines.join(" ")).toContain("单独谈了一会儿");
    expect(getFriendPhase3Node("F100", { knowsBoyfriendConflict: false })?.lines.join(" ")).toContain("没有听到他们谈话的内容");
  });

  it("does not reveal A's private disclosure without a trusted source", () => {
    expect(getFriendPhase3Node("F115", { secretSource: "observed-only" })?.lines.join(" ")).not.toContain("亲口告诉我");
    expect(getFriendPhase3Node("F115", { secretSource: "A-direct" })?.lines.join(" ")).toContain("听");
  });

  it("filters claims about rejecting A against the saved A-line outcome", () => {
    expect(getFriendPhase3Choice("F108", "B", { aOutcome: "R12" })).toBeUndefined();
    expect(getFriendPhase3Choice("F108", "A", { aOutcome: "R12" })?.text).toContain("拒绝");
    expect(getFriendPhase3Choice("F108", "A", { aOutcome: "R13" })?.text).toContain("保持距离");
    expect(getFriendPhase3Choice("F108", "A", { aOutcome: "R18" })?.text).toContain("没有完全想清楚");
  });
});
