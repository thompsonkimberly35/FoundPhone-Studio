import { describe, expect, it } from "vitest";
import { BOYFRIEND_STAGE3, BOYFRIEND_STAGE3_RESULTS, validateBoyfriendStage3 } from "./kakaoBoyfriendStage3";
import { BOYFRIEND_STAGE2, BOYFRIEND_STAGE2_RESULTS, getBoyfriendStage2Choice, getBoyfriendStage2Node } from "./kakaoBoyfriendStage2";

describe("Boyfriend sequel: The Decision I Couldn't Tell You", () => {
  it("adds exactly 30 unique nodes without overwriting existing boyfriend story IDs", () => {
    expect(Object.keys(BOYFRIEND_STAGE3)).toHaveLength(30);
    for (let number = 140; number <= 169; number += 1) {
      const id = "K" + number;
      expect(BOYFRIEND_STAGE3[id]).toBeDefined();
      expect(BOYFRIEND_STAGE2[id]).toBeDefined();
    }
    for (let number = 7; number <= 12; number += 1) {
      const id = "M" + String(number).padStart(2, "0");
      expect(BOYFRIEND_STAGE3_RESULTS[id]).toBeDefined();
      expect(BOYFRIEND_STAGE2_RESULTS[id]).toBeDefined();
    }
  });

  it("has no dangling targets and all six new outcomes are reachable", () => {
    expect(validateBoyfriendStage3()).toEqual([]);
  });

  it("starts from every existing stage-two result without replacing it", () => {
    for (let number = 9; number <= 18; number += 1) {
      const id = "E" + String(number).padStart(2, "0");
      expect(BOYFRIEND_STAGE2_RESULTS[id]?.result).toBe(id);
      expect(BOYFRIEND_STAGE2_RESULTS[id]?.lines.length).toBeGreaterThan(0);
    }
  });

  it("preserves player choice and allows relationship distance without forced breakup", () => {
    expect(getBoyfriendStage2Choice("K140", "A")?.next).toBe("K141");
    expect(getBoyfriendStage2Choice("K140", "B")?.next).toBe("K142");
    expect(getBoyfriendStage2Choice("K140", "C")?.next).toBe("K143");
    expect(getBoyfriendStage2Node("M12")?.result).toBe("M12");
    expect(getBoyfriendStage2Node("M12")?.lines.join(" ")).toContain("如果未来你愿意重新谈");
  });

  it("does not add a new X event or alter existing X001-X003 definitions", () => {
    expect(Object.keys(BOYFRIEND_STAGE3)).not.toContain("X001");
    expect(Object.keys(BOYFRIEND_STAGE3)).not.toContain("X002");
    expect(Object.keys(BOYFRIEND_STAGE3)).not.toContain("X003");
  });
});
