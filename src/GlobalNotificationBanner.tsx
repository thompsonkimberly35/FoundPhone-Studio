import { useEffect, useRef, useState } from "react";
import { Instagram, MessageCircle } from "lucide-react";
import type { Item } from "./schema";

type Props = {
  item: Item | null;
  onDismiss: () => void;
  onOpen: (item: Item) => void;
};

export function GlobalNotificationBanner({ item, onDismiss, onOpen }: Props) {
  const [leaving, setLeaving] = useState(false);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (!item) return;
    setLeaving(false);
    const duration = item.meta?.notificationAppId === "instagram" ? 500 : 2500;
    const leaveTimer = window.setTimeout(() => setLeaving(true), Math.max(150, duration - 300));
    const dismissTimer = window.setTimeout(() => dismissRef.current(), duration);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [item?.id]);

  if (!item) return null;
  const notificationAppId = String(item.meta?.notificationAppId || "kakao");

  return (
    <div className="global-notification-layer" aria-live="polite">
      <button
        type="button"
        className={`global-kakao-notification global-notification-${notificationAppId} ${leaving ? "is-leaving" : ""}`}
        aria-label={`${item.sender}：${item.body}。点击打开应用`}
        onClick={() => onOpen(item)}
      >
        <span className="global-kakao-app-icon" aria-hidden="true">
          {notificationAppId === "instagram" ? (
            <Instagram size={18} />
          ) : notificationAppId === "threads" ? (
            <svg width="21" height="21" viewBox="0 0 64 64" aria-hidden="true">
              <path d="M48 17C42 5 17 8 14 25c-5 23 26 32 36 17 9-15-9-25-23-17-11 8 7 17 13 8 5-8 0-16-10-14M49 29c6 20-16 31-29 17" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          ) : notificationAppId === "twitter" ? (
            <span className="global-x-glyph">𝕏</span>
          ) : (
            <MessageCircle size={18} fill="currentColor" strokeWidth={1.8} />
          )}
        </span>
        <span className="global-kakao-copy">
          <strong className="global-kakao-sender">{item.sender}</strong>
          <span className="global-kakao-preview">{item.body}</span>
        </span>
        <time className="global-kakao-time">{item.time.slice(-5)}</time>
      </button>
    </div>
  );
}
