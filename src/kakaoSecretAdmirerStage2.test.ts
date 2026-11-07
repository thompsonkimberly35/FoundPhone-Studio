import {describe,expect,it} from "vitest";
import {SECRET_ADMIRER_STAGE2,SECRET_ADMIRER_STAGE2_RESULTS,SECRET_ADMIRER_STAGE2_OPENINGS,getSecretAdmirerStage2Choice,validateSecretAdmirerStage2} from "./kakaoSecretAdmirerStage2";
import {SECRET_ADMIRER_STORY} from "./kakaoSecretAdmirer";

describe("KakaoTalk secret admirer second stage",()=>{
  it("adds exactly thirty A070-A099 nodes and eight distinct outcomes without reusing first-stage IDs",()=>{
    expect(Object.keys(SECRET_ADMIRER_STAGE2)).toHaveLength(30);
    for(let i=70;i<=99;i++) expect(SECRET_ADMIRER_STAGE2["A"+String(i).padStart(3,"0")]).toBeDefined();
    expect(Object.keys(SECRET_ADMIRER_STAGE2_RESULTS).sort()).toEqual(["R11","R12","R13","R14","R15","R16","R17","R18"]);
    for(const id of Object.keys(SECRET_ADMIRER_STAGE2_RESULTS)) expect(SECRET_ADMIRER_STORY[id]).toBeUndefined();
  });
  it("validates every target and reachability",()=>expect(validateSecretAdmirerStage2()).toEqual([]));
  it("keeps the authored branches intact",()=>{
    expect(getSecretAdmirerStage2Choice("A070","A")?.next).toBe("A071");
    expect(getSecretAdmirerStage2Choice("A078","B")?.next).toBe("A090");
    expect(getSecretAdmirerStage2Choice("A094","A")?.next).toBe("R12");
    expect(getSecretAdmirerStage2Choice("A099","C")?.next).toBe("R18");
  });
  it("has distinct respectful openings for prior relationship outcomes",()=>{
    expect(Object.keys(SECRET_ADMIRER_STAGE2_OPENINGS)).toHaveLength(10);
    expect(SECRET_ADMIRER_STAGE2_OPENINGS.R04.join(" ")).toContain("尊重");
    expect(SECRET_ADMIRER_STAGE2_OPENINGS.R08.join(" ")).toContain("心动");
    expect(SECRET_ADMIRER_STAGE2_OPENINGS.R09.join(" ")).toContain("重新认识");
  });
  it("does not encode an automatic breakup or treat R18 as acceptance",()=>{
    expect(SECRET_ADMIRER_STAGE2_RESULTS.R18.lines.join(" ")).not.toContain("交往");
    expect(SECRET_ADMIRER_STAGE2_RESULTS.R18.result).toBe("R18");
    expect(SECRET_ADMIRER_STAGE2_RESULTS.R12.lines.join(" ")).toContain("朋友");
    expect(SECRET_ADMIRER_STAGE2_RESULTS.R13.lines.join(" ")).toContain("不会再主动");
  });
});
