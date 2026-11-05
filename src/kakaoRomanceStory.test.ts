import { describe, expect, it } from "vitest";
import {
  KAKAO_ROMANCE_STORY,
  getKakaoStoryChoice,
  getKakaoStoryNode,
  getKakaoRomanceStageId,
} from "./kakaoRomanceStory";

describe("KakaoTalk romance story", () => {
  it("contains every requested K node and all eight stage outcomes", () => {
    const keys = Object.keys(KAKAO_ROMANCE_STORY);
    expect(keys).toContain("K001");
    expect(keys).toContain("K002A");
    expect(keys).toContain("K002B");
    for (const branch of "ABCDEF") expect(keys).toContain("K003" + branch);
    for (let number = 4; number <= 45; number += 1) {
      expect(keys).toContain("K" + String(number).padStart(3, "0"));
    }
    for (let number = 1; number <= 8; number += 1) {
      expect(keys).toContain("E" + String(number).padStart(2, "0"));
    }
  });

  it("has no dangling choice targets and every K node is reachable from K001", () => {
    const known = new Set(Object.keys(KAKAO_ROMANCE_STORY));
    for (const node of Object.values(KAKAO_ROMANCE_STORY)) {
      for (const choice of node.choices) expect(known.has(choice.next)).toBe(true);
    }
    const visited = new Set<string>(["K001"]);
    const pending = ["K001"];
    while (pending.length) {
      const node = getKakaoStoryNode(pending.pop()!);
      for (const choice of node?.choices ?? []) {
        if (!visited.has(choice.next)) {
          visited.add(choice.next);
          pending.push(choice.next);
        }
      }
    }
    for (const id of known) {
      if (/^(K\d{3}[A-F]?|E0[1-8])$/.test(id)) expect(visited.has(id)).toBe(true);
    }
  });

  it("keeps all eight second-stage routes distinct and playable", () => {
    for (let number = 1; number <= 8; number += 1) {
      const resultId = "E" + String(number).padStart(2, "0");
      const result = getKakaoStoryNode(resultId)!;
      expect(result.result).toBe(resultId);
      expect(result.choices).toHaveLength(3);
      const routeIds = result.choices.map((choice) => choice.next);
      expect(new Set(routeIds).size).toBe(3);
      for (const routeId of routeIds) {
        const route = getKakaoStoryNode(routeId)!;
        expect(route.lines.length).toBeGreaterThan(0);
        expect(route.choices).toHaveLength(2);
      }
    }
  });

  it("pauses K014 without an immediate loop and resumes at K030", () => {
    const pause = getKakaoStoryNode("K014")!;
    expect(pause.choices).toHaveLength(0);
    expect(pause.pauseTo).toBe("K030");
    expect(getKakaoStoryNode(pause.pauseTo!)?.choices.length).toBeGreaterThan(0);
    expect(getKakaoStoryNode("K037")?.choices.every((choice) => choice.next !== "K037")).toBe(true);
    expect(getKakaoStoryNode("K040")?.choices.every((choice) => choice.next !== "K040")).toBe(true);
  });

  it("keeps letter-suffixed branch nodes in the same stage", () => {
    expect(getKakaoRomanceStageId("K001")).toBe("boyfriend-main-1");
    expect(getKakaoRomanceStageId("K002A")).toBe("boyfriend-main-1");
    expect(getKakaoRomanceStageId("K002B")).toBe("boyfriend-main-1");
    expect(getKakaoRomanceStageId("K045")).toBe("boyfriend-main-1");
    expect(getKakaoRomanceStageId("K046")).toBe("boyfriend-main-2");
  });

  it("maps a selected option to one exact branch target", () => {
    expect(getKakaoStoryChoice("K001", "A")?.next).toBe("K002A");
    expect(getKakaoStoryChoice("K001", "B")?.next).toBe("K002B");
    expect(getKakaoStoryChoice("K003F", "A")?.next).toBe("K014");
    expect(getKakaoStoryChoice("K044", "C")?.next).toBe("E08");
  });
});
