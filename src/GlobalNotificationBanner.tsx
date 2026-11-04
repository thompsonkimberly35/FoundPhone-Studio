import { useEffect, useRef, useState } from "react";
import { AtSign, MessageCircle } from "lucide-react";
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
    const leaveTimer = window.setTimeout(() => setLeaving(true), 2200);
    const dismissTimer = window.setTimeout(() => dismissRef.current(), 2500);
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
          {notificationAppId === "threads" ? <AtSign size={19} /> : notificationAppId === "twitter" ? <span className="global-x-glyph">𝕏</span> : <MessageCircle size={18} fill="currentColor" strokeWidth={1.8} />}
        </span>
        <span className="global-kakao-copy">
          <strong className="global-kakao-sender">{item.sender}</strong>
          <span className="global-kakao-preview">{item.body}</span>
        </span>
        <time className="global-kakao-time">现在</time>
      </button>
    </div>
  );
}
