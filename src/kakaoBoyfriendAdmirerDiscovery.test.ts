import { describe, expect, it } from "vitest";
import {
  BOYFRIEND_ADMIRER_DISCOVERY,
  BOYFRIEND_ADMIRER_RESULTS,
  validateBoyfriendAdmirerDiscovery,
} from "./kakaoBoyfriendAdmirerDiscovery";

describe("boyfriend admirer discovery sequel", () => {
  it("contains 36 unique dialogue nodes and eight stage outcomes", () => {
    expect(Object.keys(BOYFRIEND_ADMIRER_DISCOVERY)).toHaveLength(36);
    expect(Object.keys(BOYFRIEND_ADMIRER_RESULTS)).toHaveLength(8);
    expect(validateBoyfriendAdmirerDiscovery()).toEqual([]);
  });

  it("keeps all branch targets within the sequel graph", () => {
    const known = new Set([
      ...Object.keys(BOYFRIEND_ADMIRER_DISCOVERY),
      ...Object.keys(BOYFRIEND_ADMIRER_RESULTS),
    ]);
    for (const node of Object.values(BOYFRIEND_ADMIRER_DISCOVERY)) {
      for (const choice of node.choices) expect(known.has(choice.next)).toBe(true);
    }
  });

  it("does not reuse the already occupied M07-M12 boyfriend result IDs", () => {
    for (const id of ["M07", "M08", "M09", "M10", "M11", "M12"]) {
      expect(BOYFRIEND_ADMIRER_DISCOVERY[id]).toBeUndefined();
      expect(BOYFRIEND_ADMIRER_RESULTS[id]).toBeUndefined();
    }
  });
});
