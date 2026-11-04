import { useState } from "react";
import { ChevronLeft, Mail, MailOpen } from "lucide-react";
import type { Item } from "./schema";
import "./mail-app.css";

type Props = {
  items: Item[];
  onRead: (id: string) => void;
  onBack: () => void;
};

const CONFIRM_URL = "https://mg.withlive-app.com/lottery/confirm";

function MailBody({ value }: { value: string }) {
  const parts = value.split(CONFIRM_URL);
  return (
    <div className="mail-detail-body">
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 && (
            <a href={CONFIRM_URL} target="_blank" rel="noreferrer">
              {CONFIRM_URL}
            </a>
          )}
        </span>
      ))}
    </div>
  );
}

export function MailApp({ items, onRead, onBack }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const mail = [...items]
    .filter((item) => item.meta?.mailBatchId === "ald1-japan-lottery-rejection-2026")
    .sort((a, b) => Number(a.meta.mailIndex) - Number(b.meta.mailIndex));
  const selected = mail.find((item) => item.id === selectedId) ?? null;

  if (selected) {
    return (
      <section className="mail-app mail-reading">
        <header className="mail-topbar">
          <button type="button" onClick={() => setSelectedId("")} aria-label="返回收件箱">
            <ChevronLeft size={22} />
            <span>收件箱</span>
          </button>
          <strong>邮件</strong>
          <span className="mail-topbar-spacer" />
        </header>
        <article className="mail-reading-scroll">
          <h1>{selected.title}</h1>
          <div className="mail-sender-line">
            <span className="mail-sender-avatar">s</span>
            <span className="mail-sender-details">
              <strong>support-mg</strong>
              <small>{selected.time}</small>
            </span>
          </div>
          <MailBody value={selected.body} />
        </article>
      </section>
    );
  }

  return (
    <section className="mail-app">
      <header className="mail-topbar">
        <button type="button" onClick={onBack} aria-label="返回手机主屏幕">
          <ChevronLeft size={22} />
          <span>返回</span>
        </button>
        <strong>收件箱</strong>
        <span className="mail-count">{mail.length} 封</span>
      </header>
      <div className="mail-inbox-subhead">
        <strong>收件箱</strong>
        <span>共 {mail.length} 封邮件</span>
      </div>
      <div className="mail-list" role="list" aria-label="邮件列表">
        {mail.map((item) => (
          <button
            type="button"
            role="listitem"
            className={`mail-row ${item.read ? "is-read" : "is-unread"}`}
            key={item.id}
            onClick={() => {
              setSelectedId(item.id);
              onRead(item.id);
            }}
          >
            <span className="mail-row-icon">
              {item.read ? <MailOpen size={19} /> : <Mail size={19} />}
            </span>
            <span className="mail-row-main">
              <span className="mail-row-first">
                <strong>support-mg</strong>
                <time>{item.time.slice(-5)}</time>
              </span>
              <span className="mail-row-subject">{item.title}</span>
              <span className="mail-row-preview">{item.body.split("\n").filter(Boolean).slice(0, 1)[0]}</span>
            </span>
            {!item.read && <i className="mail-unread-dot" aria-label="未读" />}
          </button>
        ))}
      </div>
    </section>
  );
}
