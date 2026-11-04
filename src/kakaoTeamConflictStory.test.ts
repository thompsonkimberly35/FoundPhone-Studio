import { describe, expect, it } from "vitest";
import { ALD1_SECRET_ADMIRER_MEMBERS } from "./kakaoSecretAdmirer";
import { chooseTeamConflictMember, getTeamConflictCandidates, getTeamConflictChoice, getTeamConflictNode, getTeamConflictNodeCount, TEAM_CONFLICT_STORY } from "./kakaoTeamConflictStory";

describe("KakaoTalk team-conflict story", () => {
  const boyfriend = "ald1-li-liwu";
  const friend = "ald1-jin-qianyou";
  const admirer = "ald1-jin-junshu";
  it("excludes boyfriend, friend and A and only selects verified adults", () => {
    const candidates = getTeamConflictCandidates(boyfriend, friend, admirer, new Date("2026-11-04T00:00:00Z"));
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every(m => m.id !== boyfriend && m.id !== friend && m.id !== admirer)).toBe(true);
    expect(candidates.every(m => m.birthDate && /^\d{4}-\d{2}-\d{2}$/.test(m.birthDate))).toBe(true);
    expect(candidates.some(m => m.isAdult === false)).toBe(false);
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
  it("maps independent choices to different branches and all outcomes are terminal", () => {
    expect(getTeamConflictChoice("B001","A")?.next).toBe("B002");
    expect(getTeamConflictChoice("B001","B")?.next).toBe("B003");
    expect(getTeamConflictChoice("B001","C")?.next).toBe("B004");
    for (const id of Array.from({length: 101}, (_, i) => "B" + String(i + 1).padStart(3, "0"))) {
      const choices = getTeamConflictNode(id)?.choices ?? [];
      expect(choices).toHaveLength(3);
      expect(new Set(choices.map(choice => choice.text)).size).toBe(3);
    }
    expect(new Set(Object.values(TEAM_CONFLICT_STORY).filter(n => n.id.startsWith("B")).flatMap(n => n.choices.map(c => c.text))).size).toBeGreaterThan(250);
    for(let i=1;i<=12;i++){const id="S"+String(i).padStart(2,"0");expect(getTeamConflictNode(id)?.result).toBe(id);expect(getTeamConflictNode(id)?.choices).toHaveLength(0);}
  });
});
