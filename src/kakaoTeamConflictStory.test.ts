import { describe, expect, it } from "vitest";
import { chooseTeamConflictMember, getTeamConflictCandidates, getTeamConflictChoice, getTeamConflictNode, getTeamConflictNodeCount, TEAM_CONFLICT_STORY, validateTeamConflictStory, getTeamConflictBoyfriendFollowupState } from "./kakaoTeamConflictStory";

describe("KakaoTalk team-conflict story", () => {
  const boyfriend = "ald1-li-liwu";
  const friend = "ald1-jin-qianyou";
  const admirer = "ald1-jin-junshu";
  it("excludes boyfriend, friend and A and only selects verified adults", () => {
    const candidates = getTeamConflictCandidates(boyfriend, friend, admirer, new Date("2026-11-04T00:00:00Z"));
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every(m => m.id !== boyfriend && m.id !== friend && m.id !== admirer)).toBe(true);
    expect(candidates.every(m => m.birthDate && /^\d{4}-\d{2}-\d{2}$/.test(m.birthDate))).toBe(true);
    expect(getTeamConflictCandidates(boyfriend, friend, "unknown")).toEqual([]);
  });
  it("uses a bounded uniform index and persists the chosen stable member record", () => {
    const member = chooseTeamConflictMember(boyfriend, friend, admirer, a => { a[0] = 0; return a; });
    expect(member).not.toBeNull();
    expect([boyfriend, friend, admirer]).not.toContain(member!.id);
    const counts = new Map<string, number>();
    for (let i=0;i<5000;i++) { const m=chooseTeamConflictMember(boyfriend,friend,admirer); expect(m).not.toBeNull(); counts.set(m!.id,(counts.get(m!.id)||0)+1); }
    expect(counts.size).toBe(getTeamConflictCandidates(boyfriend,friend,admirer).length);
    expect(Math.max(...counts.values())-Math.min(...counts.values())).toBeLessThan(250);
  });
  it("contains B001-B101 and S01-S12 with no dangling edges and every node reachable", () => {
    expect(getTeamConflictNodeCount()).toBe(113);
    const known = new Set(Object.keys(TEAM_CONFLICT_STORY));
    for (const id of [...Array.from({length:101},(_,i)=>"B"+String(i+1).padStart(3,"0")), ...Array.from({length:12},(_,i)=>"S"+String(i+1).padStart(2,"0"))]) expect(known.has(id)).toBe(true);
    for (const n of Object.values(TEAM_CONFLICT_STORY)) for (const c of n.choices) expect(known.has(c.next)).toBe(true);
    const seen = new Set(["B001"]); const todo = ["B001"];
    while(todo.length) { const current=todo.pop()!; for(const c of getTeamConflictNode(current)?.choices??[]) if(!seen.has(c.next)){seen.add(c.next);todo.push(c.next);} }
    expect(seen).toEqual(known);
  });
  it("shows direct reply choices without repeating the previous message as a prefix", () => {
    const node = getTeamConflictNode("B009")!;
    expect(node.choices.map(choice => choice.text)).toEqual([
      "你现在是在对我发脾气。",
      "你是不是有其他事情没说？",
      "我们先冷静一下。",
    ]);
    expect(getTeamConflictNode("B001")?.choices.map(choice => choice.text)).toEqual([
      "你想说什么？",
      "如果是关于今天的事，我已经很累了。",
      "你是不是也在怪我？",
    ]);
    expect(Object.keys(TEAM_CONFLICT_STORY).filter(id => id.startsWith("B"))).toHaveLength(101);
    expect(validateTeamConflictStory()).toEqual([]);
  });
  it("maps B outcomes to boyfriend follow-up signals without leaking B's private conversation", () => {
    expect(getTeamConflictBoyfriendFollowupState("S04")).toBe("notice-hesitation");
    expect(getTeamConflictBoyfriendFollowupState("S05")).toBe("await-player-disclosure");
    expect(getTeamConflictBoyfriendFollowupState("S09")).toBe("team-conversation-available");
    expect(getTeamConflictBoyfriendFollowupState("S08")).toBe("respect-no-contact");
    expect(getTeamConflictBoyfriendFollowupState("S12")).toBe("past-story-unlocked");
    expect(getTeamConflictBoyfriendFollowupState("unknown")).toBe("none");
  });
  it("maps independent choices to different branches and all outcomes are terminal", () => {
    expect(getTeamConflictChoice("B001","A")?.next).toBe("B002");
    expect(getTeamConflictChoice("B001","B")?.next).toBe("B003");
    expect(getTeamConflictChoice("B001","C")?.next).toBe("B004");
    for (const id of Array.from({length: 101}, (_, i) => "B" + String(i + 1).padStart(3, "0"))) {
      const choices = getTeamConflictNode(id)?.choices ?? [];
      expect(choices).toHaveLength(3);
      expect(new Set(choices.map(choice => choice.text)).size).toBe(3);
    }
    expect(new Set(Object.values(TEAM_CONFLICT_STORY).filter(n => n.id.startsWith("B")).flatMap(n => n.choices.map(c => c.text))).size).toBeGreaterThan(20);
    for(let i=1;i<=12;i++){const id="S"+String(i).padStart(2,"0");expect(getTeamConflictNode(id)?.result).toBe(id);expect(getTeamConflictNode(id)?.choices).toHaveLength(0);}
  });
});
