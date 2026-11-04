import { describe, expect, it } from "vitest";
import { createThreadsAvatar, generateThreadsFanReplies, reconcileThreadsFanReplies } from "./threadsPlayerPosts";

describe("player-authored Threads posts", () => {
  it("generates 24 distinct replies across all eight reaction categories", () => {
    const post = {
      id: "player-post-test-1",
      text: "今天終於鼓起勇氣說出我的感受，也希望大家能理解並繼續支持 ALD1。@friend",
      createdAt: 100_000,
      boyfriend: "李理悟",
    };
    const replies = generateThreadsFanReplies(post);
    expect(replies).toHaveLength(24);
    expect(new Set(replies.map((reply) => reply.id)).size).toBe(24);
    expect(new Set(replies.map((reply) => reply.handle)).size).toBe(24);
    expect(new Set(replies.map((reply) => reply.text)).size).toBe(24);
    expect(new Set(replies.map((reply) => reply.category))).toEqual(new Set([
      "claim", "explain", "attack", "sad", "apology", "daily", "support", "mention",
    ]));
    expect(replies.every((reply) => !/@allyz_1101\b/i.test(reply.text))).toBe(true);
    expect(replies.filter((reply) => reply.category === "mention").every((reply) => /@[\w.]+/.test(reply.text))).toBe(true);
    expect(replies.filter((reply) => reply.category === "mention").every((reply) => !reply.text.includes("@" + reply.handle))).toBe(true);
    expect(replies.every((reply) => reply.deliveredAt === null && reply.readAt === null)).toBe(true);
  });

  it("schedules replies in staggered batches and uses stable account identities", () => {
    const post = { id: "player-post-test-2", text: "今天吃了蛋糕。", createdAt: 200_000, boyfriend: "" };
    const first = generateThreadsFanReplies(post);
    const second = generateThreadsFanReplies({ ...post, id: "player-post-test-3" });
    expect(first.map((reply) => reply.handle)).toEqual(second.map((reply) => reply.handle));
    expect(first.map((reply) => reply.personality)).toEqual(second.map((reply) => reply.personality));
    expect(first.map((reply) => reply.displayName)).toEqual(second.map((reply) => reply.displayName));
    expect(first[0].scheduledAt - post.createdAt).toBe(3_000);
    expect(first.at(-1)!.scheduledAt - post.createdAt).toBeGreaterThanOrEqual(60_000);
    expect(first.every((reply) => reply.scheduledAt >= post.createdAt)).toBe(true);
  });
  it("uses stable local avatars and replaces the selected boyfriend token", () => {
    const post = { id: "avatar-test", text: "我男朋友今天陪着我。", createdAt: 400_000, boyfriend: "李理悟" };
    const first = generateThreadsFanReplies(post);
    const again = generateThreadsFanReplies(post);
    expect(first.every((reply) => reply.avatar === createThreadsAvatar(reply.handle))).toBe(true);
    expect(first.map((reply) => reply.avatar)).toEqual(again.map((reply) => reply.avatar));
    expect(new Set(first.map((reply) => reply.avatar)).size).toBe(24);
    expect(first.some((reply) => reply.text.includes("李理悟"))).toBe(true);
    expect(first.every((reply) => !reply.text.includes("{{BOYFRIEND_NAME}}"))).toBe(true);
  });

  it("uses recent story context when shaping support replies", () => {
    const replies = generateThreadsFanReplies({
      id: "player-post-context",
      text: "我會繼續支持 ALD1。",
      createdAt: 300_000,
      boyfriend: "李理悟",
      contextText: "先前X事件：團體活動安排出現變化",
    });
    expect(replies.some((reply) => reply.text.includes("先前X事件"))).toBe(true);
  });

  it("recovers missing replies for saved player posts without duplicating existing replies", () => {
    const post = { id: "player-post-recovery", text: "今天想和大家说说心里话。", createdAt: 500_000, boyfriend: "李理悟" };
    const generated = generateThreadsFanReplies(post);
    const firstDelivered = { ...generated[0], deliveredAt: 503_000, readAt: 504_000 };
    const recovered = reconcileThreadsFanReplies([post], [firstDelivered]);
    expect(recovered).toHaveLength(24);
    expect(recovered.find((reply) => reply.id === firstDelivered.id)).toEqual(firstDelivered);
    expect(new Set(recovered.map((reply) => reply.id)).size).toBe(24);
    expect(reconcileThreadsFanReplies([post], recovered)).toBe(recovered);
  });

  it("reconstructs all fan replies when a saved post has no reply records", () => {
    const post = { id: "player-post-empty-recovery", text: "今天想和大家说说心里话。", createdAt: 600_000, boyfriend: "" };
    const recovered = reconcileThreadsFanReplies([post], []);
    expect(recovered).toHaveLength(24);
    expect(recovered.every((reply) => reply.postId === post.id && reply.deliveredAt === null)).toBe(true);
  });

});