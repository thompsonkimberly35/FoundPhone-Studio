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

type StoryNode = { id: string; choices: Array<{ key: string; text: string; next: string }> };

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
  }
}

describe("KakaoTalk authored story graph integrity", () => {
  it("validates the first boyfriend arc and every authored ending", () => {
    expectClosedStoryGraph("boyfriend arc 1", KAKAO_ROMANCE_STORY);
  });

  it("validates the combined boyfriend follow-up arcs and outcomes", () => {
    expectClosedStoryGraph("boyfriend arc 2 and 3", { ...BOYFRIEND_STAGE2, ...BOYFRIEND_STAGE2_RESULTS });
  });

  it("validates the confidant first arc", () => {
    expectClosedStoryGraph("friend arc 1", FRIEND_STORY);
  });

  it("removes the invented single-choice filler from the confidant second arc", () => {
    expect(validateFriendPhase2Story()).toEqual([]);
    expectClosedStoryGraph("friend arc 2", FRIEND_PHASE2_STORY);
  });

  it("validates the confidant third arc", () => {
    expect(validateFriendPhase3Story()).toEqual([]);
    expectClosedStoryGraph("friend arc 3", FRIEND_PHASE3_STORY);
  });

  it("validates both secret-admirer arcs", () => {
    expectClosedStoryGraph("secret admirer arc 1", SECRET_ADMIRER_STORY);
    expect(validateSecretAdmirerStage2()).toEqual([]);
    expectClosedStoryGraph("secret admirer arc 2", { ...SECRET_ADMIRER_STAGE2, ...SECRET_ADMIRER_STAGE2_RESULTS });
  });

  it("validates the boyfriend discovery arc", () => {
    expect(validateBoyfriendAdmirerDiscovery()).toEqual([]);
    expectClosedStoryGraph("boyfriend discovery", { ...BOYFRIEND_ADMIRER_DISCOVERY, ...BOYFRIEND_ADMIRER_RESULTS });
  });

  it("validates the team-conflict arc", () => {
    expect(validateTeamConflictStory()).toEqual([]);
    expectClosedStoryGraph("team conflict", TEAM_CONFLICT_STORY);
  });
});
