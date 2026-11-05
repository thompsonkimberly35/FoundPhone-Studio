import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export function UpdateAvailableBanner({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="global-notification-layer global-update-notification-layer" role="status" aria-live="polite">
      <div className="global-update-notification">
        <span className="global-update-app-icon" aria-hidden="true"><RefreshCw size={18} /></span>
        <span className="global-update-copy">
          <strong>游戏有新版本啦</strong>
          <span>请前往设置查看更新</span>
        </span>
        <time>现在</time>
      </div>
    </div>
  );
}
