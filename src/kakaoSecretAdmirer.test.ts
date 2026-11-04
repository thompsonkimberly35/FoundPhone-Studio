import { describe, expect, it } from "vitest";
import {
  ALD1_SECRET_ADMIRER_MEMBERS,
  chooseSecretAdmirer,
  getSecretAdmirerCandidates,
  getSecretAdmirerChoice,
  getSecretAdmirerNode,
  getSecretAdmirerNodeCount,
  memberIdForName,
  secureRandomIndex,
} from "./kakaoSecretAdmirer";

describe("KakaoTalk secret admirer", () => {
  const boyfriendId = "ald1-li-liwu";
  const friendId = "ald1-jin-qianyou";

  it("only draws from adult members and excludes boyfriend and close friend by stable ID", () => {
    const candidates = getSecretAdmirerCandidates(boyfriendId, friendId);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every((member) => member.adult)).toBe(true);
    expect(candidates.some((member) => member.id === boyfriendId)).toBe(false);
    expect(candidates.some((member) => member.id === friendId)).toBe(false);
    expect(new Set(candidates.map((member) => member.id)).size).toBe(candidates.length);
  });

  it("checks candidate exclusion, name aliases and invalid random bounds", () => {
    const all = ALD1_SECRET_ADMIRER_MEMBERS;
    const none = getSecretAdmirerCandidates(all[0].id, all[1].id);
    expect(none).toHaveLength(all.length - 2);
    expect(chooseSecretAdmirer("unknown-boyfriend", "unknown-friend")).not.toBeNull();
    expect(memberIdForName("张家豪")).toBe("ald1-zhang-jiahao");
    expect(memberIdForName("張家豪")).toBe("ald1-zhang-jiahao");
    expect(() => secureRandomIndex(0)).toThrow(RangeError);
  });

  it("excludes the selected pair for every valid distinct member combination", () => {
    for (const boyfriend of ALD1_SECRET_ADMIRER_MEMBERS) {
      for (const friend of ALD1_SECRET_ADMIRER_MEMBERS) {
        if (boyfriend.id === friend.id) continue;
        const candidates = getSecretAdmirerCandidates(boyfriend.id, friend.id);
        expect(candidates).toHaveLength(ALD1_SECRET_ADMIRER_MEMBERS.length - 2);
        expect(candidates.some((member) => member.id === boyfriend.id || member.id === friend.id)).toBe(false);
      }
    }
  });

  it("uses unbiased bounded indexes and samples multiple independent members", () => {
    const counts = new Map<string, number>();
    for (let index = 0; index < 6000; index += 1) {
      const member = chooseSecretAdmirer(boyfriendId, friendId);
      expect(member).not.toBeNull();
      counts.set(member!.id, (counts.get(member!.id) || 0) + 1);
    }
    expect(counts.size).toBe(6);
    const values = [...counts.values()];
    expect(Math.max(...values) - Math.min(...values)).toBeLessThan(180);
  });

  it("contains all 69 story nodes and ten distinct stage outcomes", () => {
    expect(getSecretAdmirerNodeCount()).toBe(79);
    for (let index = 1; index <= 69; index += 1) {
      expect(getSecretAdmirerNode("A" + String(index).padStart(3, "0"))).toBeDefined();
    }
    for (let index = 1; index <= 10; index += 1) {
      expect(getSecretAdmirerNode("R" + String(index).padStart(2, "0"))?.result).toBe("R" + String(index).padStart(2, "0"));
    }
  });

  it("has no dangling targets and all nodes and results are reachable from A001", () => {
    const known = new Set<string>();
    for (let index = 1; index <= 69; index += 1) known.add("A" + String(index).padStart(3, "0"));
    for (let index = 1; index <= 10; index += 1) known.add("R" + String(index).padStart(2, "0"));
    const visited = new Set<string>(["A001"]);
    const pending = ["A001"];
    while (pending.length) {
      const node = getSecretAdmirerNode(pending.pop()!);
      for (const choice of node?.choices ?? []) {
        expect(known.has(choice.next)).toBe(true);
        if (!visited.has(choice.next)) {
          visited.add(choice.next);
          pending.push(choice.next);
        }
      }
    }
    expect(visited).toEqual(known);
  });

  it("keeps each player choice mapped to its authored next node", () => {
    expect(getSecretAdmirerChoice("A001", "A")?.next).toBe("A002");
    expect(getSecretAdmirerChoice("A001", "B")?.next).toBe("A003");
    expect(getSecretAdmirerChoice("A032", "C")?.next).toBe("A050");
    expect(getSecretAdmirerChoice("A061", "C")?.next).toBe("R10");
  });
});
