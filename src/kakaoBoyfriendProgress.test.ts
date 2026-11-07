import { describe, expect, it } from "vitest";
import { getBoyfriendStageHistoryKey, getBoyfriendStageResultKey } from "./kakaoBoyfriendProgress";

describe("boyfriend stage persistence keys", () => {
  it("keeps phase-two and phase-three outcomes separate", () => {
    const ui: Record<string, string> = {};
    ui[getBoyfriendStageResultKey("stage2")] = "E09";
    ui[getBoyfriendStageResultKey("stage3")] = "M07";
    expect(ui["boyfriend-stage2-result"]).toBe("E09");
    expect(ui["boyfriend-stage3-result"]).toBe("M07");
  });

  it("preserves each phase history in its own slot", () => {
    expect(getBoyfriendStageHistoryKey("stage2")).not.toBe(getBoyfriendStageHistoryKey("stage3"));
  });
});
