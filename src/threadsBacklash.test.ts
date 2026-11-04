import { describe, expect, it } from "vitest";
import { makeThreadsBacklash, hasThreadsX002, createThreadsReplyRecord, type InstagramReplyEvidence } from "./threadsBacklash";

const evidence: InstagramReplyEvidence = {
  conversationId: "ig-backlash-1",
  attackerUserId: "ig-backlash-1",
  attackerHandle: "only4rio_",
  attackerMessageId: "ig-backlash-1",
  playerReplyMessageId: "ig-player-reply-1",
  attackerText: "你就是那个勾引我欧巴的女人？",
  playerReplyText: "请不要再这样联系我。",
  capturedAt: 1793800000000,
};

describe("Threads backlash event", () => {
  it("creates 36 unique posts with at least three stable fan comments each", () => {
    const posts = makeThreadsBacklash("李理悟", evidence, "2026-11-04 09:41", false);
    expect(posts).toHaveLength(36);
    expect(new Set(posts.map((post) => post.id)).size).toBe(36);
    expect(new Set(posts.map((post) => post.meta.handle)).size).toBe(36);
    expect(posts.every((post) => post.comments.length >= 3)).toBe(true);
    expect(posts.every((post) => !post.body.includes("{{BOYFRIEND_NAME}}"))).toBe(true);
    expect(posts[0].body).toContain("李理悟");
  });

  it("binds T029 and T030 to the real first Instagram reply evidence", () => {
    const posts = makeThreadsBacklash("李理悟", evidence, "2026-11-04 09:41", false);
    const original = posts.find((post) => post.meta.postId === "T029")!;
    const quote = posts.find((post) => post.meta.postId === "T030")!;
    expect(original.sender).toBe("only4rio_");
    expect(original.meta.authorId).toBe("ig-backlash-1");
    expect(original.meta.evidencePlayerReplyText).toBe("请不要再这样联系我。");
    expect(quote.meta.evidencePlayerReplyText).toBe("请不要再这样联系我。");
  });

  it("keeps T025 hidden until X002 has been published", () => {
    const before = makeThreadsBacklash("李理悟", evidence, "2026-11-04 09:41", false);
    const after = makeThreadsBacklash("李理悟", evidence, "2026-11-04 09:41", true);
    expect(before.find((post) => post.meta.postId === "T025")?.hidden).toBe(true);
    expect(after.find((post) => post.meta.postId === "T025")?.hidden).toBe(false);
    expect(hasThreadsX002([{ ...after[24], id: "x-story-X002", meta: { eventId: "X002" } }])).toBe(true);
  });
});


describe("Threads player replies", () => {
  it("creates uniquely identified replies with persistent author and timestamp fields", () => {
    const first = createThreadsReplyRecord("threads-backlash-t001", "玩家自定义回复", 1234);
    const second = createThreadsReplyRecord("threads-backlash-t001", "第二条回复", 1235);
    expect(first.id).not.toBe(second.id);
    expect(first).toMatchObject({
      postId: "threads-backlash-t001",
      authorId: "player-allyz_1101",
      authorHandle: "@allyz_1101",
      text: "玩家自定义回复",
      createdAt: 1234,
      isPlayerReply: true,
    });
  });
});
