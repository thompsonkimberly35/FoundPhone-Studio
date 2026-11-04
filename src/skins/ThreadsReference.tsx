import { useEffect, useMemo, useState } from "react";
import {
  Home,
  Send,
  Plus,
  Heart,
  User,
  Search,
  Menu,
  MoreHorizontal,
  ArrowLeft,
  Repeat2,
  Bookmark,
  SquarePen,
  SlidersHorizontal,
  BellOff,
  ChevronRight,
  X,
  Smile,
  Globe,
  Mic,
  Delete,
  ArrowUp,
  CornerDownLeft,
  Pin,
  Image as ImageIcon,
} from "lucide-react";
import type { SkinProps } from "../AppSkins";
import { Avatar, Media } from "./shared";
import { makeItem, type Item } from "../schema";
import { createThreadsReplyRecord, type ThreadsReplyRecord } from "../threadsBacklash";
import { createThreadsAvatar, createThreadsCommentIdentity, generateThreadsFanReplies, type ThreadsPlayerPost, type ThreadsFanReply } from "../threadsPlayerPosts";
import { useSkinState } from "../skinState";
import { formatGameDateTime, formatRelativeGameTime, zonedDateTimeToTimestamp } from "../gameClock";
import "./threads-reference.css";

function getPostImages(media?: string): string[] {
  if (!media) return [];
  try { const parsed: unknown = JSON.parse(media); if (Array.isArray(parsed)) return parsed.filter((value): value is string => typeof value === "string" && /^(data:image\/|https?:\/\/|\/)/.test(value)); } catch { /* legacy single-image URL */ }
  return /^(data:image\/|https?:\/\/|\/)/.test(media) ? [media] : [];
}
export function ThreadsReference(p: SkinProps) {
  const relativeTime = (item: Item) => {
    const explicit = item.time.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}:\d{2})/);
    const timestamp = item.sentAt ?? (explicit ? zonedDateTimeToTimestamp(explicit[1], explicit[2]) : p.virtualTimestamp || 0);
    return formatRelativeGameTime(timestamp, p.virtualTimestamp ?? timestamp);
  };
  const [tab, setTab] = useSkinState<string>(p, "threads-tab", "首页"),
    [liked, setLiked] = useSkinState<string[]>(p, "threads-liked", []),
    [saved, setSaved] = useSkinState<string[]>(p, "threads-saved", []),
    [posts, setPosts] = useSkinState<string[]>(p, "threads-posts", []),
    [replies] = useSkinState<string[]>(p, "threads-replies", []);
  const [replyRecordsJson, setReplyRecordsJson] = useSkinState<string>(p, "threads-replies-v2", "[]");
  const [localPostsJson, setLocalPostsJson] = useSkinState<string>(p, "threads-posts-timestamps-v1", "[]");
  const [playerPostsJson, setPlayerPostsJson] = useSkinState<string>(p, "threads-player-posts-v1", "[]");
  const [fanRepliesJson, setFanRepliesJson] = useSkinState<string>(p, "threads-fan-replies-v1", "[]");
  const [activityReadAt, setActivityReadAt] = useSkinState<string>(p, "threads-activity-read-at", "0");
  const playerPosts: ThreadsPlayerPost[] = useMemo(() => {
    try { const value: unknown = JSON.parse(playerPostsJson); return Array.isArray(value) ? value : []; } catch { return []; }
  }, [playerPostsJson]);
  const fanReplies: ThreadsFanReply[] = useMemo(() => {
    try { const value: unknown = JSON.parse(fanRepliesJson); return Array.isArray(value) ? value : []; } catch { return []; }
  }, [fanRepliesJson]);
  useEffect(() => {
    const now = p.virtualTimestamp ?? 0;
    if (!fanReplies.some((reply) => !reply.deliveredAt && reply.scheduledAt <= now)) return;
    setFanRepliesJson(JSON.stringify(fanReplies.map((reply) => !reply.deliveredAt && reply.scheduledAt <= now ? { ...reply, deliveredAt: now } : reply)));
  }, [fanRepliesJson, p.virtualTimestamp, setFanRepliesJson]);

  const localPostRecords = useMemo<Array<{ id: string; text: string; createdAt: number }>>(() => {
    try {
      const value: unknown = JSON.parse(localPostsJson);
      return Array.isArray(value) ? value.filter((entry): entry is { id: string; text: string; createdAt: number } => !!entry && typeof entry.id === "string" && typeof entry.text === "string" && typeof entry.createdAt === "number") : [];
    } catch { return []; }
  }, [localPostsJson]);
  useEffect(() => {
    const cleanPosts = posts.filter((body) => !/测试|(?:^|[\s_-])(test|demo|sample)(?:$|[\s_-])/i.test(body));
    if (cleanPosts.length !== posts.length) setPosts(cleanPosts);
  }, [posts, setPosts]);
  useEffect(() => {
    const next = posts.map((text, index) => {
      const current = localPostRecords[index];
      return current?.text === text ? current : { id: "legacy-thread-" + index, text, createdAt: p.virtualTimestamp ?? 0 };
    });
    if (JSON.stringify(next) !== localPostsJson) setLocalPostsJson(JSON.stringify(next));
  }, [posts, localPostRecords, localPostsJson, p.virtualTimestamp, setLocalPostsJson]);
  const replyRecords: ThreadsReplyRecord[] = (() => {
    try {
      const value: unknown = JSON.parse(replyRecordsJson);
      return Array.isArray(value) ? value.filter((entry): entry is ThreadsReplyRecord => !!entry && typeof entry.id === "string" && typeof entry.postId === "string" && typeof entry.text === "string" && typeof entry.createdAt === "number" && entry.isPlayerReply === true) : [];
    } catch { return []; }
  })();
  const [draft, setDraft] = useState(""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("全部"),
    [side, setSide] = useState(false),
    [compose, setCompose] = useState(false),
    [keyboard, setKeyboard] = useState(false),
    [shift, setShift] = useState(false),
    [numbers, setNumbers] = useState(false),
    [options, setOptions] = useState(false),
    [selected, setSelected] = useState<Item | null>(null),
    [evidenceExpanded, setEvidenceExpanded] = useState(false);
  const [draftMedia, setDraftMedia] = useState<string[]>([]);
  const [lightboxImage, setLightboxImage] = useState("");
  const [replyTarget, setReplyTarget] = useState("");
  const [highlightedReplyId, setHighlightedReplyId] = useState("");
  const local = posts
    .filter((body) => !/测试|(?:^|[\\s_-])(test|demo|sample)(?:$|[\\s_-])/i.test(body))
    .map((body, n) => {
      const record = localPostRecords[n]?.text === body ? localPostRecords[n] : undefined;
      const createdAt = record?.createdAt ?? p.virtualTimestamp ?? 0;
      return makeItem({
        id: record?.id || "local-thread-" + n,
        title: "本地串文",
        body,
        sender: "allyz_1101",
        time: formatGameDateTime(createdAt),
        sentAt: createdAt,
        meta: { local: "true", handle: "allyz_1101" },
      });
    });
  const playerItems = playerPosts.map((post) => makeItem({
    id: post.id, title: "你的串文", body: post.text, sender: "allyz_1101",
    time: formatGameDateTime(post.createdAt), kind: "post",
    media: post.media || "",
    comments: [],
    meta: { local: "true", handle: "allyz_1101", playerPostId: post.id },
  }));
  useEffect(() => {
    if (tab === "动态") setActivityReadAt(String(p.virtualTimestamp ?? 0));
  }, [tab, p.virtualTimestamp, setActivityReadAt]);
  const feed = [
      ...playerItems,
      ...local,
      ...p.items.filter((i) => i.folder !== "私信" && i.folder !== "threads-reply" && !i.meta.activityType && (!i.hidden || ["T029", "T030"].includes(String(i.meta.postId))) && !/测试|(?:^|[\s_-])(test|demo|sample)(?:$|[\s_-])/i.test([i.id, i.title, i.sender, i.body, i.folder, ...Object.values(i.meta ?? {})].join(" "))),
    ],
    messages = p.items.filter((i) => i.folder === "私信"),
    activities = [
      ...p.items.filter((i) => i.meta.activityType),
      ...fanReplies.filter((reply) => reply.deliveredAt !== null).map((reply) => makeItem({
        id: "activity-" + reply.id, title: "回复了你的串文", sender: reply.displayName || reply.handle, avatar: createThreadsAvatar(reply.handle),
        body: reply.text, time: formatGameDateTime(reply.deliveredAt || reply.scheduledAt),
        meta: { activityType: reply.text.includes("@") ? "mention" : "reply", handle: reply.handle, postId: reply.postId, replyId: reply.id,
          originalPreview: playerPosts.find((post) => post.id === reply.postId)?.text || "",
          activityCreatedAt: String(reply.deliveredAt || 0) },
      })),
    ],
    playerReplies = p.items.filter((i) => i.folder === "threads-reply");
  useEffect(() => {
    if (!p.targetPostId) return;
    const target = feed.find((item) => item.id === p.targetPostId);
    if (target) { setSelected(target); setHighlightedReplyId(p.targetReplyId || ""); }
    p.onTargetPostHandled?.();
  }, [p.targetPostId, feed.map((item) => item.id).join("|")]);
  useEffect(() => {
    if (!highlightedReplyId) return;
    const timer = window.setTimeout(() => {
      document.querySelector(".tr-fan-reply.is-targeted")?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [highlightedReplyId, selected?.id]);
  const toggle = (id: string, items: string[], set: (v: string[]) => void) =>
    set(items.includes(id) ? items.filter((v) => v !== id) : [...items, id]);
  const open = (i: Item) => {
    if (i.password || p.creator) {
      p.onItem(i);
      return;
    }
    if (i.meta.local !== "true") p.onRead(i.id);
    setSelected(i);
  };
  const card = (i: Item) => (
    <article className="tr-post" key={i.id}>
      <button className="tr-avatar" onClick={() => setTab("个人主页")}>
        <Avatar name={i.sender} src={i.avatar} />
        <span>+</span>
      </button>
      <div className="tr-post-content">
        <div className="tr-byline">
          <b>@{i.meta.handle || i.sender}</b>
          <span>{relativeTime(i)}</span>
          <button
            aria-label="帖子选项"
            onClick={() => {
              setSelected(i);
              setOptions(true);
            }}
          >
            <MoreHorizontal />
          </button>
        </div>
        <button className="tr-body" onClick={() => open(i)}>{i.body}</button>
        {getPostImages(i.media).length > 0 && <div className="tr-post-media" aria-label="贴文图片" onClick={(event) => event.stopPropagation()}>{getPostImages(i.media).map((src, index) => <button type="button" className="tr-post-media-item" key={src + index} aria-label="放大图片" onClick={() => setLightboxImage(src)}><img src={src} alt={"贴文图片 " + (index + 1)} loading="lazy" /></button>)}</div>}
        {i.meta.evidenceId === "ig-first-reply-evidence" && <button type="button" className="tr-ig-evidence" aria-label="查看Instagram私信截图" onClick={() => open(i)}><div className="tr-ig-evidence-head">Instagram · 私信对话截图</div><div className="tr-ig-evidence-user">@{i.meta.evidenceAttackerHandle || "unknown"}</div><div className="tr-ig-evidence-bubble">{i.meta.evidenceAttackerText || "Instagram 私信内容"}</div><div className="tr-ig-evidence-player">{i.meta.evidencePlayerReplyText || "玩家回复"}</div><small>游戏内对话引用</small></button>}
        <div className="tr-actions">
          <button
            aria-label={"喜欢" + i.title}
            aria-pressed={liked.includes(i.id)}
            onClick={() => toggle(i.id, liked, setLiked)}
          >
            <Heart
              fill={liked.includes(i.id) ? "#ff3060" : "none"}
              color={liked.includes(i.id) ? "#ff3060" : "currentColor"}
            />
            {i.likes + (liked.includes(i.id) ? 1 : 0) || ""}
          </button>
          <button aria-label={"回复" + i.title} onClick={() => open(i)}>
            <MessageCircleIcon />
            {(i.meta.playerPostId ? fanReplies.filter((reply) => reply.postId === i.id && reply.deliveredAt !== null).length : i.comments.length) + replies.filter((v) => v.startsWith(i.id + "\t")).length + replyRecords.filter((r) => r.postId === i.id).length || ""}
          </button>
          <button
            aria-label={"转发" + i.title}
            onClick={() => toggle(i.id, saved, setSaved)}
          >
            <Repeat2 />
          </button>
          <button
            aria-label={"分享" + i.title}
            onClick={() => {
              setDraft(i.body);
              setCompose(true);
            }}
          >
            <Send />
          </button>
        </div>
      </div>
    </article>
  );
  return (
    <div className="threads-reference">
      <div className="tr-scroll">
        {selected ? (
          <>
            <header className="tr-head">
              <button
                aria-label="返回Threads列表"
                onClick={() => setSelected(null)}
              >
                <ArrowLeft />
              </button>
              <b>串文</b>
              <MoreHorizontal />
            </header>
            {card(selected)}
            {(selected.meta.evidenceId === "ig-first-reply-evidence") && <button type="button" aria-label="放大或收起Instagram对话截图" className={`tr-ig-evidence ${evidenceExpanded ? "is-expanded" : ""}`} onClick={() => setEvidenceExpanded(!evidenceExpanded)}><div className="tr-ig-evidence-head">Instagram · 私信对话截图 · {evidenceExpanded ? "点击收起" : "点击放大"}</div><div className="tr-ig-evidence-user">@{selected.meta.evidenceAttackerHandle}</div><div className="tr-ig-evidence-bubble">{selected.meta.evidenceAttackerText}</div><div className="tr-ig-evidence-player">{selected.meta.evidencePlayerReplyText}</div><small>游戏内对话引用 · 非真实账号资料</small></button>}
            <div className="tr-comments">
              {[
                ...selected.comments,
                ...replies
                  .filter((v) => v.startsWith(selected.id + "\t"))
                  .map((v) => "@allyz_1101：" + v.split("\t").slice(1).join("\t")),
                
                ...playerReplies.filter((r) => r.meta.postId === selected.meta.postId).map((r) => r.sender + "：" + r.body),
              ].map((c, n) => {
                const identity = createThreadsCommentIdentity(c);
                return <div className="tr-comment-row" key={selected.id + "-legacy-comment-" + n}><Avatar name={identity.handle} src={identity.avatar} /><div className="tr-comment-main"><div className="tr-comment-byline"><b>@{identity.handle}</b><small>{relativeTime(selected)}</small></div><p>{c}</p><div className="tr-comment-actions"><button type="button" aria-label="点赞评论"><Heart size={15} /></button><button type="button" aria-label="回复评论" onClick={() => setReplyTarget(selected.id)}><MessageCircleIcon /></button></div></div></div>;
              })}
              {fanReplies.filter((reply) => reply.postId === selected.id && reply.deliveredAt !== null).map((reply) => (
                <div className={"tr-fan-reply" + (highlightedReplyId === reply.id ? " is-targeted" : "")} key={reply.id}>
                  <div className="tr-comment-row"><Avatar name={reply.handle} src={reply.avatar || createThreadsAvatar(reply.handle)} /><div className="tr-comment-main"><div className="tr-comment-byline"><b>@{reply.handle}</b><small>{formatRelativeGameTime(reply.deliveredAt || reply.scheduledAt, p.virtualTimestamp ?? reply.scheduledAt)}</small></div><p>{reply.text}</p><div className="tr-comment-actions"><button type="button" aria-label="点赞评论"><Heart size={15} /></button><button type="button" onClick={() => setReplyTarget(reply.id)} aria-label="回复评论"><MessageCircleIcon /></button><button type="button" onClick={() => setReplyTarget(reply.id)}>回复</button></div></div></div>
                  {replyRecords.filter((child) => child.parentReplyId === reply.id).map((child) => (
                    <p className="tr-nested-reply" key={child.id}>{child.authorHandle}：{child.text}</p>
                  ))}
                </div>
              ))}
              {replyRecords.filter((record) => record.postId === selected.id && !record.parentReplyId).map((record) => (
                <div className="tr-fan-reply" key={record.id}>
                  <p>{record.authorHandle}：{record.text}</p>
                  <button type="button" onClick={() => setReplyTarget(record.id)}>回覆</button>
                  {replyRecords.filter((child) => child.parentReplyId === record.id).map((child) => (
                    <p className="tr-nested-reply" key={child.id}>{child.authorHandle}：{child.text}</p>
                  ))}
                </div>
              ))}
            </div>
            <form
              className="tr-reply"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) {
                  const record = createThreadsReplyRecord(selected.id, draft.trim(), p.virtualTimestamp ?? 0, replyTarget || undefined);
                  setReplyRecordsJson(JSON.stringify([...replyRecords, record]));
                  setDraft("");
                  setReplyTarget("");
                }
              }}
            >
              <input
                aria-label="Threads回复"
                placeholder={replyTarget ? "回覆這則留言" : "回复串文"}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button>发送</button>
            </form>
          </>
        ) : (
          <>
            <header
              className={
                "tr-head " + (tab === "首页" ? "tr-home-head" : "tr-large-head")
              }
            >
              {tab === "首页" ? (
                <>
                  <button
                    aria-label="打开Threads菜单"
                    onClick={() => setSide(true)}
                  >
                    <Menu />
                  </button>
                  <svg
                    className="tr-logo"
                    width="29"
                    height="36"
                    viewBox="0 0 64 64"
                    aria-label="Threads"
                  >
                    <path
                      d="M48 17C42 5 17 8 14 25c-5 23 26 32 36 17 9-15-9-25-23-17-11 8 7 17 13 8 5-8 0-16-10-14M49 29c6 20-16 31-29 17"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <button
                    aria-label="搜索Threads"
                    onClick={() => setTab("搜索")}
                  >
                    <Search />
                  </button>
                </>
              ) : (
                <>
                  <h1>
                    {tab === "消息"
                      ? "消息"
                      : tab === "动态"
                        ? "动态"
                        : tab === "个人主页"
                          ? "allyz_1101"
                          : tab}
                  </h1>
                  {(tab === "消息" || tab === "动态") && <BellOff />}
                  <button
                    aria-label="新建串文"
                    onClick={() => setCompose(true)}
                  >
                    <SquarePen />
                  </button>
                </>
              )}
            </header>
            {(tab === "消息" || tab === "搜索") && (
              <label className="tr-search">
                <Search size={18} />
                <input
                  aria-label="搜索Threads内容"
                  placeholder="搜索"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            )}
            {(tab === "消息" || tab === "动态") && (
              <nav className="tr-filters">
                {(tab === "消息"
                  ? ["筛选", "收件箱", "陌生消息"]
                  : ["全部", "关注", "对话", "提及", "你关注的人"]
                ).map((t) => (
                  <button
                    key={t}
                    className={filter === t ? "selected" : ""}
                    onClick={() => setFilter(t)}
                  >
                    {t === "筛选" ? <SlidersHorizontal size={19} /> : t}
                  </button>
                ))}
              </nav>
            )}
            {tab === "首页" &&
              feed
                .filter((i) =>
                  filter === "收藏"
                    ? saved.includes(i.id)
                    : filter === "已关注"
                      ? i.meta.following === "true"
                      : filter === "限时帖"
                        ? i.meta.story === "true"
                        : true,
                )
                .map(card)}
            {tab === "搜索" &&
              feed.filter((i) => (i.body + i.sender).includes(query)).map(card)}
            {tab === "消息" &&
              messages
                .filter(
                  (i) =>
                    (i.body + i.sender).includes(query) &&
                    (filter !== "陌生消息" || i.meta.request === "true"),
                )
                .map((i) => (
                  <button
                    className="tr-message"
                    key={i.id}
                    onClick={() => open(i)}
                  >
                    <Avatar name={i.sender} src={i.avatar} />
                    <span>
                      <b>{i.sender}</b>
                      <small>
                        {i.body} · {relativeTime(i)}
                      </small>
                    </span>
                    {i.favorite && <Pin size={16} />}
                  </button>
                ))}
            {tab === "动态" && (
              <>
                <h3 className="tr-section">过去 7 天</h3>
                {activities
                  .filter((i) =>
                    filter === "关注"
                      ? i.meta.activityType === "follow"
                      : filter === "对话"
                        ? i.meta.activityType === "reply"
                        : filter === "提及"
                          ? i.meta.activityType === "mention"
                          : true,
                  )
                  .map((i) => (
                    <button className={`tr-activity ${Number(i.meta.activityCreatedAt || 0) > Number(activityReadAt) ? "is-unread" : ""}`} key={i.id} onClick={() => { const target = feed.find((post) => post.id === i.meta.postId); if (target) setSelected(target); }}>
                      <Avatar name={i.sender} src={i.avatar} />
                      <div>
                        <b>{i.sender}</b>
                        <small>@{i.meta.handle || i.sender} · {relativeTime(i)}</small>
                        <p className="tr-activity-original">{i.meta.originalPreview || "你關注的動態"}</p>
                        <p>{i.body}</p>
                        <div className="tr-actions"><Heart /><MessageCircleIcon /><Repeat2 /><Send /></div>
                      </div>
                    </button>
                  ))}
                {!activities.length && <p className="tr-empty">暂无动态</p>}
              </>
            )}
            {tab === "个人主页" && (
              <>
                <div className="tr-profile">
                  <Avatar name={"allyz_1101"} />
                  <p>allyz_1101</p>
                </div>
                {feed
                  .filter(
                    (i) => i.sender === "allyz_1101" || i.meta.local === "true",
                  )
                  .map(card)}
              </>
            )}
            {((tab === "消息" && !messages.length) ||
              (tab === "首页" && !feed.length)) && (
              <p className="tr-empty">暂无内容</p>
            )}
          </>
        )}
      </div>
      <nav className="tr-bottom">
        {[Home, Send, Plus, Heart, User].map((Icon, n) => (
          <button
            key={n}
            aria-label={
              [
                "Threads首页",
                "Threads消息",
                "新建串文",
                "Threads动态",
                "Threads个人主页",
              ][n]
            }
            className={
              tab === ["首页", "消息", "", "动态", "个人主页"][n]
                ? "selected"
                : ""
            }
            onClick={() => {
              setSelected(null);
              if (n === 2) {
                setCompose(true);
                setKeyboard(true);
              } else setTab(["首页", "消息", "", "动态", "个人主页"][n]);
            }}
          >
            <Icon
              fill={
                (n === 0 && tab === "首页") || (n === 3 && tab === "动态")
                  ? "currentColor"
                  : "none"
              }
            />
          </button>
        ))}
      </nav>
      {side && (
        <div className="tr-side-cover" onClick={() => setSide(false)}>
          <aside className="tr-side" onClick={(e) => e.stopPropagation()}>
            <header>
              <b>动态</b>
              <button
                aria-label="关闭Threads菜单"
                onClick={() => setSide(false)}
              >
                <X />
              </button>
            </header>
            <div className="tr-side-tools">
              <button
                onClick={() => {
                  setTab("首页");
                  setSide(false);
                }}
              >
                <Heart />
              </button>
              <button
                onClick={() => {
                  setFilter("收藏");
                  setSide(false);
                }}
              >
                <Bookmark />
              </button>
            </div>
            <div className="tr-side-list">
              {["为你推荐", "已关注", "限时帖"].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setFilter(t);
                    setSide(false);
                  }}
                >
                  {t}
                  <ChevronRight />
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
      {compose && (
        <section className="tr-compose">
          <header>
            <button
              onClick={() => {
                setCompose(false);
                setKeyboard(false);
              }}
            >
              取消
            </button>
            <b>新建串文</b>
            <button aria-label="串文选项" onClick={() => setOptions(!options)}>
              <MoreHorizontal />
            </button>
          </header>
          <div className="tr-compose-content">
            <Avatar name={"allyz_1101"} />
            <div>
              <b>{"allyz_1101"}</b>
              <span className="tr-muted"> › 社群或话题</span>
              <textarea
                aria-label="串文内容"
                placeholder="有什么新鲜事吗？"
                value={draft}
                inputMode="none"
                onFocus={() => setKeyboard(true)}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={2000}
              />
              <p className="tr-muted">添加到串文</p>
              {draftMedia.length > 0 && <div className="tr-compose-photo-list">{draftMedia.map((src, index) => <div className="tr-compose-photo" key={src + index}><img src={src} alt={"待发布图片 " + (index + 1)} /><button type="button" onClick={() => setDraftMedia((current) => current.filter((_, itemIndex) => itemIndex !== index))}>移除</button></div>)}</div>}
            </div>
          </div>
          <div className="tr-compose-actions">
            <button type="button" onClick={() => document.getElementById("threads-player-photo")?.click()}>
              <ImageIcon size={21} />
              照片
            </button>
            <input id="threads-player-photo" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden onChange={(event) => {
              const files = Array.from(event.target.files || []);
              if (files.some((file) => file.size > 5 * 1024 * 1024)) { window.alert("每张图片请小于 5 MB"); event.target.value = ""; return; }
              Promise.all(files.map((file) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("图片读取失败")); reader.onerror = () => reject(new Error("图片读取失败")); reader.readAsDataURL(file); }))).then((images) => setDraftMedia((current) => [...current, ...images].slice(0, 4))).catch(() => window.alert("图片读取失败，请重试"));
              event.target.value = "";
            }} />
            <button onClick={() => setOptions(!options)}>
              <SlidersHorizontal size={21} />
              帖子选项
            </button>
            <button
              disabled={!draft.trim()}
              onClick={() => {
                const createdAt = p.virtualTimestamp ?? 0;
                const post: ThreadsPlayerPost = {
                  id: "player-threads-" + createdAt + "-" + Math.random().toString(36).slice(2, 8),
                  text: draft, createdAt, boyfriend: p.selectedBoyfriend || "", media: draftMedia.length ? JSON.stringify(draftMedia) : undefined,
                  contextText: [p.storyContext || "", ...p.items.filter(item => item.kind === "post").slice(-2).map(item => item.body)].filter(Boolean).join(" ").slice(0, 1200),
                };
                setPlayerPostsJson(JSON.stringify([post, ...playerPosts]));
                setFanRepliesJson(JSON.stringify([...fanReplies, ...generateThreadsFanReplies(post)]));
                // Player posts are stored separately from legacy local posts to avoid duplicate feed cards.
                setDraft("");
                setDraftMedia([]);
                setCompose(false);
                setKeyboard(false);
                setTab("首页");
              }}
            >
              发布
            </button>
          </div>
          {keyboard && (
            <div className="tr-keyboard">
              <div className="tr-candidates">
                {["我", "你", "好", "他", "不", "这", "这个", "对"].map((k) => (
                  <button
                    key={k}
                    onClick={() =>
                      setDraft(draft + (shift ? k.toUpperCase() : k))
                    }
                  >
                    {k}
                  </button>
                ))}
                <button
                  aria-label="收起串文键盘"
                  onClick={() => setKeyboard(false)}
                >
                  ⌄
                </button>
              </div>
              {(numbers
                ? ["1234567890", "-/:;()&@", ".,?!"]
                : ["qwertyuiop", "asdfghjkl", "zxcvbnm"]
              ).map((row, n) => (
                <div className="tr-key-row" key={n}>
                  {n === 2 && (
                    <button
                      aria-label="大写"
                      aria-pressed={shift}
                      onClick={() => setShift(!shift)}
                    >
                      <ArrowUp />
                    </button>
                  )}
                  {[...row].map((k) => (
                    <button key={k} onClick={() => setDraft(draft + k)}>
                      {k}
                    </button>
                  ))}
                  {n === 2 && (
                    <button
                      aria-label="删除串文字符"
                      onClick={() => setDraft(draft.slice(0, -1))}
                    >
                      <Delete />
                    </button>
                  )}
                </div>
              ))}
              <div className="tr-key-row">
                <button onClick={() => setNumbers(!numbers)}>
                  {numbers ? "ABC" : "123"}
                </button>
                <button>
                  <Smile />
                </button>
                <button
                  className="space"
                  aria-label="空格"
                  onClick={() => setDraft(draft + " ")}
                >
                  {" "}
                </button>
                <button
                  aria-label="换行"
                  onClick={() => setDraft(draft + "\n")}
                >
                  <CornerDownLeft />
                </button>
              </div>
              <footer>
                <Globe />
                <Mic />
              </footer>
            </div>
          )}
        </section>
      )}
      {lightboxImage && <div className="tr-image-lightbox" role="dialog" aria-modal="true" aria-label="图片预览" onClick={() => setLightboxImage("")}><button type="button" aria-label="关闭图片预览" onClick={() => setLightboxImage("")}>×</button><img src={lightboxImage} alt="放大图片" /></div>}
      {options && (
        <div className="tr-options">
          <b>帖子选项</b>
          <p>所有人可以回复</p>
          <button onClick={() => setOptions(false)}>完成</button>
        </div>
      )}
    </div>
  );
}
function MessageCircleIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20 12a8 8 0 0 1-8 8H4l2-4a8 8 0 1 1 14-4z" />
    </svg>
  );
}
