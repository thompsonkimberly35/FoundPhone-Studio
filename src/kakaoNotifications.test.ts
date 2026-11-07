import { describe, expect, it } from "vitest";
import { makeItem } from "./schema";
import { enqueueIncomingKakaoNotifications, getCompletedKakaoStoryNodeIds } from "./kakaoNotifications";

describe("global KakaoTalk notification queue", () => {
  it("collects only newly appended incoming messages and ignores outgoing messages", () => {
    const old = makeItem({ id: "old", title: "男友", outgoing: false });
    const incoming = makeItem({ id: "incoming", title: "好友", outgoing: false });
    const outgoing = makeItem({ id: "outgoing", title: "好友", outgoing: true });
    const result = enqueueIncomingKakaoNotifications(
      [old], [old, incoming, outgoing], [], [], "", true,
    );
    expect(result.arrivals.map((item) => item.id)).toEqual(["incoming"]);
    expect(result.queue.map((item) => item.id)).toEqual(["incoming"]);
  });

  it("waits for every queued bubble in a story node before marking that node complete", () => {
    const first = makeItem({ id: "K047-0", title: "男友", meta: { boyfriendStage2Node: "K047" } });
    const last = makeItem({ id: "K047-1", title: "男友", meta: { boyfriendStage2Node: "K047" } });
    const completed = makeItem({ id: "K048-0", title: "男友", meta: { boyfriendStage2Node: "K048" } });
    expect([...getCompletedKakaoStoryNodeIds([first, completed], [last], "boyfriendStage2Node")]).toEqual(["K048"]);
    expect([...getCompletedKakaoStoryNodeIds([first, last, completed], [], "boyfriendStage2Node")]).toEqual(["K047", "K048"]);
  });

  it("deduplicates stable message IDs across repeated updates", () => {
    const message = makeItem({ id: "stable-message", title: "男友" });
    const first = enqueueIncomingKakaoNotifications([], [message], [], [], "", true);
    const second = enqueueIncomingKakaoNotifications(
      [message], [message], first.seenIds, first.queue, "", true,
    );
    expect(second.arrivals).toEqual([]);
    expect(second.queue).toHaveLength(1);
  });

  it("suppresses only the conversation currently being viewed", () => {
    const boyfriend = makeItem({ id: "boyfriend", title: "男友" });
    const friend = makeItem({ id: "friend", title: "好友" });
    const result = enqueueIncomingKakaoNotifications(
      [], [boyfriend, friend], [], [], "男友", true,
    );
    expect(result.queue.map((item) => item.title)).toEqual(["好友"]);
    expect(result.seenIds).toEqual(["boyfriend", "friend"]);
  });

  it("keeps simultaneous A and B arrivals as two ordered notifications", () => {
    const a = makeItem({ id: "A-first", title: "A成员" });
    const b = makeItem({ id: "B-first", title: "B成员" });
    const result = enqueueIncomingKakaoNotifications([], [a, b], [], [], "", true);
    expect(result.queue.map((item) => item.id)).toEqual(["A-first", "B-first"]);
  });

  it("merges only queued messages from the same sender and keeps other senders separate", () => {
    const a1 = makeItem({ id: "a1", title: "A成员" });
    const b1 = makeItem({ id: "b1", title: "B成员" });
    const a2 = makeItem({ id: "a2", title: "A成员" });
    const result = enqueueIncomingKakaoNotifications(
      [], [a2], [], [a1, b1], "", true,
    );
    expect(result.queue.map((item) => item.id)).toEqual(["a2", "b1"]);
  });

  it("does not merge different senders in the same group conversation", () => {
    const first = makeItem({ id: "group-first", title: "练习室群聊", sender: "A成员" });
    const second = makeItem({ id: "group-second", title: "练习室群聊", sender: "B成员" });
    const result = enqueueIncomingKakaoNotifications(
      [], [first, second], [], [], "", true,
    );
    expect(result.queue.map((item) => item.sender)).toEqual(["A成员", "B成员"]);
  });

  it("bounds a large backlog and records IDs even when notifications are disabled", () => {
    const messages = Array.from({ length: 45 }, (_, index) =>
      makeItem({ id: "message-" + index, title: "成员" + index }),
    );
    const result = enqueueIncomingKakaoNotifications([], messages, [], [], "", false, 40);
    expect(result.queue).toHaveLength(0);
    expect(result.seenIds).toHaveLength(45);
    const enabled = enqueueIncomingKakaoNotifications([], messages, [], [], "", true, 40);
    expect(enabled.queue).toHaveLength(40);
    expect(enabled.queue[0].id).toBe("message-5");
  });
});
