import {describe,expect,it} from "vitest";
import {ALD1_SECRET_ADMIRER_MEMBERS} from "./kakaoSecretAdmirer";
import {chooseTeamConflictMember,getTeamConflictCandidates,getTeamConflictNode,getTeamConflictNodeCount,validateTeamConflictGraph} from "./kakaoTeamConflictStory";
describe("KakaoTalk team-conflict story",()=>{
 it("contains B001-B101 and S01-S12 with complete reachable graph",()=>{expect(getTeamConflictNodeCount()).toBe(113);expect(getTeamConflictNode("B001")?.choices).toHaveLength(3);expect(validateTeamConflictGraph()).toEqual([]);});
 it("excludes boyfriend, friend and secret admirer by stable IDs",()=>{const ids=ALD1_SECRET_ADMIRER_MEMBERS.filter(x=>x.birthDate<"2008-01-01").map(x=>x.id);const c=getTeamConflictCandidates(ids[0],ids[1],ids[2],new Date("2026-11-04T00:00:00Z"));expect(c.every(x=>![ids[0],ids[1],ids[2]].includes(x.id))).toBe(true);});
 it("chooses a uniformly indexed eligible member and safely stops when empty",()=>{const c=getTeamConflictCandidates("ald1-zhou-anxin","ald1-zhang-jiahao","ald1-li-liwu",new Date("2026-11-04T00:00:00Z"));const picked=chooseTeamConflictMember("ald1-zhou-anxin","ald1-zhang-jiahao","ald1-li-liwu",a=>{a[0]=0;return a;});expect(picked?.id).toBe(c[0].id);expect(chooseTeamConflictMember("x","y","z",undefined,new Date("2000-01-01T00:00:00Z"))).toBeNull();});
 it("has no missing branch targets and all twelve outcomes are reachable",()=>{expect(validateTeamConflictGraph()).toEqual([]);for(let i=1;i<=12;i++)expect(getTeamConflictNode("S"+String(i).padStart(2,"0"))?.result).toBe("S"+String(i).padStart(2,"0"));});
});
