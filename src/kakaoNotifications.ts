import type { Item } from "./schema";

export type KakaoNotificationQueueResult = {
  arrivals: Item[];
  seenIds: string[];
  queue: Item[];
};

/**
 * Collect only newly appended incoming messages. The caller supplies persisted
 * notification IDs and queue contents from Runtime.ui.kakao.
 */
export function enqueueIncomingKakaoNotifications(
  previousMessages: Item[],
  nextMessages: Item[],
  seenIds: string[],
  pending: Item[],
  currentlyViewedThread: string,
  notificationsEnabled: boolean,
  maxQueue = 40,
): KakaoNotificationQueueResult {
  const previousIds = new Set(previousMessages.map((item) => item.id));
  const arrivals = nextMessages.filter(
    (item) => !item.outgoing && !previousIds.has(item.id),
  );
  const seen = new Set(seenIds);
  const fresh = arrivals.filter((item) => !seen.has(item.id));
  fresh.forEach((item) => seen.add(item.id));

  const queue = [...pending];
  if (notificationsEnabled) {
    for (const item of fresh) {
      if (currentlyViewedThread && currentlyViewedThread === item.title) continue;
      const sameSenderIndex = queue.findIndex((queued) => queued.title === item.title);
      if (sameSenderIndex >= 0) queue[sameSenderIndex] = item;
      else queue.push(item);
    }
  }

  return {
    arrivals,
    seenIds: [...seen].slice(-500),
    queue: queue.slice(-Math.max(1, maxQueue)),
  };
}
