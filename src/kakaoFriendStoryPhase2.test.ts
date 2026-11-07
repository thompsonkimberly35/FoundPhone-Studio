import { describe, expect, it } from "vitest";
import { getFriendPhase3Opening } from "./kakaoFriendStoryPhase3";
import {
  FRIEND_PHASE2_STORY,
  getFriendPhase2Node,
  getFriendPhase2NodeCount,
  getFriendPhase2Opening,
  getFriendPhase2OutcomeLabel,
  getFriendPhase2OutcomeClass,
  isExplicitBoyfriendAngerResponse,
  resolveFriendPhase2Next,
} from "./kakaoFriendStoryPhase2";

describe("KakaoTalk confidant friend story phase two", () => {
  it("keeps phase two independent from the original F001-F069 and H01-H12 identifiers", () => {
    expect(getFriendPhase2NodeCount()).toBe(56);
    expect(getFriendPhase2Node("F2_070")).toBeDefined();
    for (let i = 1; i <= 12; i++) {
      expect(FRIEND_PHASE2_STORY["H" + String(i).padStart(2, "0")]).toBeUndefined();
    }
    for (let i = 13; i <= 20; i++) {
      const id = "H" + i;
      expect(getFriendPhase2Node(id)?.result).toBe(id);
      expect(getFriendPhase2Node(id)?.choices).toHaveLength(0);
    }
  });

  it("waits for a real boyfriend anger response before opening F085", () => {
    const f080 = getFriendPhase2Node("F2_080");
    const wait = getFriendPhase2Node("F2_080C_WAIT");
    const f085 = getFriendPhase2Node("F2_085");
    const f086 = getFriendPhase2Node("F2_086");
    expect(f080?.choices.find(choice => choice.key === "C")?.next).toBe("F2_080C_WAIT");
    expect(wait?.effect).toBe("wait-for-boyfriend-reaction");
    expect(f085?.autoNext).toBe("F2_086");
    expect(f085?.scriptedPlayerLines).toEqual([
      { afterLineIndex: 1, text: "说了。" },
      { afterLineIndex: 2, text: "他很生气。" },
    ]);
    expect(f085?.lines).toEqual(["你跟他说了吗？", "……他怎么说？", "我猜也是。", "如果我是他，我可能也会这样。"]);
    expect(f086?.lines).toEqual(["他有没有叫你不要再跟我联络？"]);
    expect(f086?.choices.map(choice => [choice.key, choice.next, choice.replyLines])).toEqual([
      ["A", "H14", ["那我真的欠他一句道歉。"]],
      ["B", "H17", ["我知道。", "这次我确实没有立场反驳。", "但我还是希望有一天能亲自跟他说清楚。"]],
      ["C", "H14", ["对不起。", "我不应该让你变成夹在中间的人。"]],
    ]);
  });

  it("only recognizes explicit anger statements, not references to the player's anger", () => {
    expect(isExplicitBoyfriendAngerResponse("我真的很生气。")).toBe(true);
    expect(isExplicitBoyfriendAngerResponse("我无法接受她这样做。")).toBe(true);
    expect(isExplicitBoyfriendAngerResponse("我知道你会生气。")).toBe(false);
    expect(isExplicitBoyfriendAngerResponse("有人不太高兴。")).toBe(false);
    expect(isExplicitBoyfriendAngerResponse("那就让他生气吧。")).toBe(false);
  });

  it("preserves the original F087 estrangement and unfinished-apology responses", () => {
    const f087 = getFriendPhase2Node("F2_087");
    const h18 = getFriendPhase2Node("H18");
    const h19 = getFriendPhase2Node("H19");
    expect(f087?.choices.map(choice => [choice.key, choice.next])).toEqual([
      ["A", "H18"], ["B", "H20"], ["C", "H19"],
    ]);
    expect(h18?.lines).toEqual([
      "好。",
      "我不会再打扰你。",
      "希望你以后能平安，也希望你身边有人好好照顾你。",
    ]);
    expect(h19?.lines).toEqual([
      "……真的吗？",
      "那我还有机会把事情说清楚吗？",
    ]);
  });

  it("plays the original F081 scripted exchange before showing F082 choices", () => {
    const f081 = getFriendPhase2Node("F2_081");
    const f082 = getFriendPhase2Node("F2_082");
    expect(f081?.choices).toHaveLength(0);
    expect(f081?.autoNext).toBe("F2_082");
    expect(f081?.scriptedPlayerLines).toEqual([{ afterLineIndex: 4, text: "你这次终于没有自己决定了。" }]);
    expect(f081?.lines).toEqual([
      "我把所有对话都整理好了。",
      "包括我当时传出去的截图。",
      "还有韩知恩回复我的内容。",
      "我没有删任何东西。",
      "嗯。",
      "我想过了。",
      "我不是你的保护人。",
      "我是你的朋友。",
      "这两件事我以前好像一直搞混了。",
    ]);
    expect(f082?.lines).toEqual([
      "如果有一天你不再和 {{BOYFRIEND_NAME}} 在一起……",
      "我希望你还是可以找我。",
      "但如果你们一直在一起，我也希望你幸福。",
      "我不应该因为担心你，就一直替你决定什么才是对的。",
    ]);
    expect(f082?.choices.map(choice => [choice.key, choice.next])).toEqual([["A", "H13"], ["B", "H14"]]);
  });

  it("has no dangling choice targets", () => {
    for (const node of Object.values(FRIEND_PHASE2_STORY)) {
      for (const choice of node.choices) expect(FRIEND_PHASE2_STORY[choice.next]).toBeDefined();
      if (node.autoNext) expect(FRIEND_PHASE2_STORY[node.autoNext]).toBeDefined();
    }
  });

  it("reaches every ending, including the low-trust estrangement route", () => {
    const visited = new Set<string>(["F2_070"]);
    const pending = ["F2_070"];
    while (pending.length) {
      const node = getFriendPhase2Node(pending.pop()!);
      for (const choice of node?.choices ?? []) {
        const next = choice.next;
        if (!visited.has(next)) {
          visited.add(next);
          pending.push(next);
        }
        if (node?.id === "F2_080" && choice.key === "B") {
          const conditional = resolveFriendPhase2Next(node.id, choice.key, next, -2, 1, 0);
          if (!visited.has(conditional)) {
            visited.add(conditional);
            pending.push(conditional);
          }
        }
      }
      if (node?.id === "F2_080C_WAIT" && !visited.has("F2_085")) { visited.add("F2_085"); pending.push("F2_085"); }
      if (node?.autoNext && !visited.has(node.autoNext)) {
        visited.add(node.autoNext);
        pending.push(node.autoNext);
      }
      // F2_074 is an event-only pause; the scheduled X post opens F2_075.
      if (node?.id === "F2_074" && !visited.has("F2_075")) {
        visited.add("F2_075");
        pending.push("F2_075");
      }
    }
    for (let i = 13; i <= 20; i++) expect(visited.has("H" + i)).toBe(true);
  });

  it("routes low trust or repeated concealment to the estrangement confrontation", () => {
    expect(resolveFriendPhase2Next("F2_080", "B", "F2_083", -2, 0, 0)).toBe("F2_087");
    expect(resolveFriendPhase2Next("F2_080", "B", "F2_083", -1, 0, 0)).toBe("F2_087");
    expect(resolveFriendPhase2Next("F2_080", "B", "F2_083", 0, 1, 0)).toBe("F2_087");
    expect(resolveFriendPhase2Next("F2_080", "B", "F2_083", 2, 0, 0)).toBe("F2_083");
    expect(resolveFriendPhase2Next("F2_080", "A", "F2_081", -2, 2, 2)).toBe("F2_081");
    expect(resolveFriendPhase2Next("F2_082", "A", "H13", 0, 0, 0, false)).toBe("H13");
    expect(resolveFriendPhase2Next("F2_082", "B", "H14", -2, 2, 2, false)).toBe("H14");
    expect(resolveFriendPhase2Next("F2_084", "B", "H15", -1, 0, 0)).toBe("H14");
    // The second-lie ending is available only after the earlier warning was disclosed.
    expect(resolveFriendPhase2Next("F2_084", "A", "H20", 2, 0, 0)).toBe("H19");
    expect(resolveFriendPhase2Next("F2_084", "A", "H20", 2, 0, 1)).toBe("H20");
    expect(resolveFriendPhase2Next("F2_087", "B", "H20", -2, 1, 0)).toBe("H19");
    expect(resolveFriendPhase2Next("F2_087", "B", "H20", -2, 1, 1)).toBe("H20");
  });

  it("carries each Phase 2 ending into a distinct Phase 3 opening", () => {
    const endings = ["H13", "H14", "H15", "H16", "H17", "H18", "H19", "H20"];
    const openings = endings.map(friendOutcome => getFriendPhase3Opening({ friendOutcome }).join(""));
    expect(new Set(openings).size).toBe(endings.length);
    expect(openings[0]).toContain("重新相信我");
    expect(openings[2]).toContain("一起面对");
    expect(openings[3]).toContain("承担");
    expect(openings[4]).toContain("选边");
    expect(openings[6]).toContain("道歉");
    expect(openings[7]).toContain("第二次隐瞒");
  });

  it("classifies all twelve previous outcomes without rewriting their meanings", () => {
    expect(getFriendPhase2OutcomeClass("H01")).toBe("close");
    expect(getFriendPhase2OutcomeClass("H05")).toBe("close");
    expect(getFriendPhase2OutcomeClass("H02")).toBe("ordinary");
    expect(getFriendPhase2OutcomeClass("H07")).toBe("ordinary");
    expect(getFriendPhase2OutcomeClass("H06")).toBe("tense");
    expect(getFriendPhase2OutcomeClass("H10")).toBe("tense");
    expect(getFriendPhase2OutcomeClass("H04")).toBe("distant");
    expect(getFriendPhase2OutcomeClass("H08")).toBe("ordinary");
  });

  it("holds the X leak node as an event-only pause until its scheduled event is delivered", () => {
    expect(getFriendPhase2Node("F2_074")?.choices).toHaveLength(0);
    expect(getFriendPhase2Node("F2_074")?.lines).toHaveLength(0);
    expect(getFriendPhase2Node("F2_075")).toBeDefined();
  });

  it("uses the prior ending as a unique prelude before the F2_070 question", () => {
    for (let i = 1; i <= 12; i++) {
      const opening = getFriendPhase2Opening("H" + String(i).padStart(2, "0"));
      expect(opening[0]).not.toBe("你现在方便说话吗？");
    }
  });

  it("stores a distinct Simplified Chinese name for every ending", () => {
    const labels = ["重新相信", "有裂痕的友情", "共同面对", "替你承担", "两个重要的人", "无法原谅", "未完成的道歉", "第二次谎言"];
    for (let i = 13; i <= 20; i++) {
      expect(getFriendPhase2OutcomeLabel("H" + i)).toBe(labels[i - 13]);
    }
  });

  it("provides a distinct future conversation for each of the eight endings", () => {
    for (let i = 13; i <= 20; i++) {
      const outcome = "H" + i;
      const followup = getFriendPhase2Node("F2_090_" + outcome);
      expect(followup?.lines.length).toBeGreaterThan(0);
      expect(followup?.choices).toHaveLength(3);
    }
  });
});
