import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
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
    const leaveTimer = window.setTimeout(() => setLeaving(true), 3600);
    const dismissTimer = window.setTimeout(() => dismissRef.current(), 4000);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [item?.id]);

  if (!item) return null;

  return (
    <div className="global-notification-layer" aria-live="polite">
      <button
        type="button"
        className={`global-kakao-notification ${leaving ? "is-leaving" : ""}`}
        aria-label={`KakaoTalk，${item.sender}：${item.body}。点击打开聊天`}
        onClick={() => onOpen(item)}
      >
        <span className="global-kakao-app-icon" aria-hidden="true">
          <MessageCircle size={20} fill="currentColor" strokeWidth={1.8} />
        </span>
        <span className="global-kakao-avatar">
          {item.avatar ? (
            <img src={item.avatar} alt="" />
          ) : (
            <span>{item.sender.slice(0, 1)}</span>
          )}
        </span>
        <span className="global-kakao-copy">
          <span className="global-kakao-heading">
            <strong>KakaoTalk</strong>
            <time>现在</time>
          </span>
          <strong className="global-kakao-sender">{item.sender}</strong>
          <span className="global-kakao-preview">{item.body}</span>
        </span>
      </button>
    </div>
  );
}
