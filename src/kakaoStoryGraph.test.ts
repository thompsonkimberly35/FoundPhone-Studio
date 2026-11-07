import { describe, expect, it } from "vitest";
import { KAKAO_ROMANCE_STORY } from "./kakaoRomanceStory";
import { BOYFRIEND_STAGE2, BOYFRIEND_STAGE2_RESULTS } from "./kakaoBoyfriendStage2";
import { FRIEND_STORY } from "./kakaoFriendStory";
import { FRIEND_PHASE2_STORY, validateFriendPhase2Story } from "./kakaoFriendStoryPhase2";
import { FRIEND_PHASE3_STORY, validateFriendPhase3Story } from "./kakaoFriendStoryPhase3";
import { SECRET_ADMIRER_STORY } from "./kakaoSecretAdmirer";
import { SECRET_ADMIRER_STAGE2, SECRET_ADMIRER_STAGE2_RESULTS, validateSecretAdmirerStage2 } from "./kakaoSecretAdmirerStage2";
import { BOYFRIEND_ADMIRER_DISCOVERY, BOYFRIEND_ADMIRER_RESULTS, validateBoyfriendAdmirerDiscovery } from "./kakaoBoyfriendAdmirerDiscovery";
import { TEAM_CONFLICT_STORY, validateTeamConflictStory } from "./kakaoTeamConflictStory";

type StoryNode = { id: string; choices: Array<{ key: string; text: string; next: string }>; pauseTo?: string; autoNext?: string };

function expectAllNodesReachable(
  name: string,
  nodes: Record<string, StoryNode & { pauseTo?: string }>,
  starts: string[],
  eventEdges: Record<string, string[]> = {},
) {
  const visited = new Set<string>();
  const pending = [...starts];
  while (pending.length) {
    const id = pending.shift()!;
    if (visited.has(id) || !nodes[id]) continue;
    visited.add(id);
    const node = nodes[id];
    pending.push(...node.choices.map(choice => choice.next));
    if (node.pauseTo) pending.push(node.pauseTo);
    if (node.autoNext) pending.push(node.autoNext);
    pending.push(...(eventEdges[id] || []));
  }
  expect(Object.keys(nodes).filter(id => !visited.has(id)), name + " unreachable nodes").toEqual([]);
}

function expectClosedStoryGraph(name: string, nodes: Record<string, StoryNode>) {
  const known = new Set(Object.keys(nodes));
  for (const [id, node] of Object.entries(nodes)) {
    expect(node.id, name + " node key " + id).toBe(id);
    expect(node.choices.length, name + " choice count " + id).toBeLessThanOrEqual(3);
    expect(node.choices.length, name + " must not use a one-button placeholder " + id).not.toBe(1);
    const keys = node.choices.map(choice => choice.key);
    expect(new Set(keys).size, name + " duplicate choice keys " + id).toBe(keys.length);
    for (const choice of node.choices) {
      expect(known.has(choice.next), name + " dangling route " + id + ":" + choice.key + " -> " + choice.next).toBe(true);
    }
    if (node.autoNext) {
      expect(known.has(node.autoNext), name + " dangling auto route " + id + " -> " + node.autoNext).toBe(true);
    }
  }
}

describe("KakaoTalk authored story graph integrity", () => {
  it("validates the first boyfriend arc and every authored ending", () => {
    expectClosedStoryGraph("boyfriend arc 1", KAKAO_ROMANCE_STORY);
    expectAllNodesReachable("boyfriend arc 1", KAKAO_ROMANCE_STORY, ["K001"]);
  });

  it("validates the combined boyfriend follow-up arcs and outcomes", () => {
    const combined = { ...BOYFRIEND_STAGE2, ...BOYFRIEND_STAGE2_RESULTS };
    expectClosedStoryGraph("boyfriend arc 2 and 3", combined);
    const eventEdges: Record<string, string[]> = {
      K107: ["K113"], K108: ["K113"], K109: ["K113"], K112: ["K113"],
      ...Object.fromEntries(["E09","E10","E11","E12","E13","E14","E15","E16","E17","E18"].map(id => [id, ["K140"]])),
    };
    expectAllNodesReachable("boyfriend arcs 2 and 3", combined, ["K046"], eventEdges);
  });

  it("validates the confidant first arc", () => {
    expectClosedStoryGraph("friend arc 1", FRIEND_STORY);
    expectAllNodesReachable("friend arc 1", FRIEND_STORY, ["F001"], { H04: ["F071"], H09: ["F070"] });
  });

  it("removes the invented single-choice filler from the confidant second arc", () => {
    expect(validateFriendPhase2Story()).toEqual([]);
    expectClosedStoryGraph("friend arc 2", FRIEND_PHASE2_STORY);
    expectAllNodesReachable("friend arc 2", FRIEND_PHASE2_STORY, ["F2_070"], { F2_074: ["F2_075"], ...Object.fromEntries(["H13","H14","H15","H16","H17","H18","H19","H20"].map(id => [id, ["F2_090_" + id]])) });
  });

  it("validates the confidant third arc", () => {
    expect(validateFriendPhase3Story()).toEqual([]);
    expectClosedStoryGraph("friend arc 3", FRIEND_PHASE3_STORY);
    expectAllNodesReachable("friend arc 3", FRIEND_PHASE3_STORY, ["F088"]);
  });

  it("validates both secret-admirer arcs", () => {
    expectClosedStoryGraph("secret admirer arc 1", SECRET_ADMIRER_STORY);
    expectAllNodesReachable("secret admirer arc 1", SECRET_ADMIRER_STORY, ["A001"]);
    expect(validateSecretAdmirerStage2()).toEqual([]);
    const secretAdmirerStage2 = { ...SECRET_ADMIRER_STAGE2, ...SECRET_ADMIRER_STAGE2_RESULTS };
    expectClosedStoryGraph("secret admirer arc 2", secretAdmirerStage2);
    expectAllNodesReachable("secret admirer arc 2", secretAdmirerStage2, ["A070"]);
  });

  it("validates the boyfriend discovery arc", () => {
    expect(validateBoyfriendAdmirerDiscovery()).toEqual([]);
    const discovery = { ...BOYFRIEND_ADMIRER_DISCOVERY, ...BOYFRIEND_ADMIRER_RESULTS };
    expectClosedStoryGraph("boyfriend discovery", discovery);
    expectAllNodesReachable("boyfriend discovery", discovery, ["M170"]);
  });

  it("validates the team-conflict arc", () => {
    expect(validateTeamConflictStory()).toEqual([]);
    expectClosedStoryGraph("team conflict", TEAM_CONFLICT_STORY);
    expectAllNodesReachable("team conflict", TEAM_CONFLICT_STORY, ["B001"]);
  });
});
