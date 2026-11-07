/* React/data adapters for dudwo5/Mymy UI templates: kt/ktn/KHD/bub,
 * igHome/igProfile/igDM/igSheet, xHome. See NOTICE.txt for permission.
 * Author content, DOM globals, timers and media dependencies are excluded. */
import { Fragment, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  Settings,
  Users,
  MessageCircle,
  MoreHorizontal,
  Heart,
  Home,
  Grid,
  Send,
  Bookmark,
  Repeat2,
  BarChart2,
  Share,
  User,
  Bell,
  X,
  Smile,
  Menu,
  Compass,
  ChevronDown,
  Phone,
  Camera,
  Mic,
  Image as ImageIcon,
  PlusCircle,
  SquarePen,
  Video,
  Info,
} from "lucide-react";
import type { SkinProps } from "../../AppSkins";
import { Avatar, Media } from "../../skins/shared";
import { useSkinState } from "../../skinState";
import type { Item } from "../../schema";
import { getKakaoStoryNode } from "../../kakaoRomanceStory";
import { getBoyfriendStage2Node } from "../../kakaoBoyfriendStage2";
import { getBoyfriendAdmirerNode } from "../../kakaoBoyfriendAdmirerDiscovery";
import { getFriendStoryNode } from "../../kakaoFriendStory";
import { getFriendPhase2Node, getFriendPhase2OutcomeLabel } from "../../kakaoFriendStoryPhase2";
import { getFriendPhase3Node, getFriendPhase3Choice, getFriendPhase3OutcomeLabel } from "../../kakaoFriendStoryPhase3";
import { ALD1_SECRET_ADMIRER_MEMBERS, getSecretAdmirerNode } from "../../kakaoSecretAdmirer";
import { getTeamConflictNode } from "../../kakaoTeamConflictStory";
import "./ui.css";
import "./adapter.css";
export function messageRun(items: Item[], index: number) {
  const m = items[index],
    previous = items[index - 1],
    next = items[index + 1];
  return {
    first:
      !previous ||
      previous.outgoing !== m.outgoing ||
      previous.sender !== m.sender,
    last: !next || next.outgoing !== m.outgoing || next.sender !== m.sender,
  };
}
const read = (p: SkinProps, i: Item) =>
  p.creator || i.password ? p.onItem(i) : p.onRead(i.id);
function Blank() {
  return <p className="mymy-empty">暂无内容</p>;
}
function Back({ onClick }: { onClick: () => void }) {
  return (
    <button aria-label="返回" onClick={onClick}>
      <ArrowLeft size={22} />
    </button>
  );
}
export function MymyKakao(p: SkinProps) {
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "聊天"),
    [query, setQuery] = useState(""),
    [showChoices, setShowChoices] = useState(false),
    [menu, setMenu] = useState(false);
  const contacts = [
    { name: "周安信", file: "周安信-kakao.png" },
    { name: "张家豪", file: "張家豪-kakao.png" },
    { name: "李理悟", file: "李理悟-kakao-v2.jpg" },
    { name: "李相沅", file: "李相沅-kakao.png" },
    { name: "贺鑫隆", file: "賀鑫隆-kakao.png" },
    { name: "郑相炫", file: "鄭相炫-kakao.png" },
    { name: "金俊抒", file: "金俊抒-kakao.png" },
    { name: "金虔佑", file: "金虔佑-kakao.png" },
  ].map((person) => ({ ...person, avatar: import.meta.env.BASE_URL + "kakao/" + person.file + "?v=20261031-avatar-v2" })),
    isTestItem = (item: Item) => /测试|test/i.test([item.title, item.sender, item.body, item.folder, ...Object.values(item.meta ?? {})].join(" ")),
    chatItems = p.items.filter((item) => !isTestItem(item)),
    memberAvatar = (name: string, saved = "") => contacts.find((person) => person.name === name)?.avatar || saved,
    kakaoAvatarImageStyle = {
      width: "100%",
      height: "100%",
      objectFit: "cover" as const,
      objectPosition: "center center",
      display: "block",
      borderRadius: "50%",
    },
    kakaoChatAvatarImageStyle = {
      ...kakaoAvatarImageStyle,
      transform: "translateZ(0)",
      backfaceVisibility: "hidden" as const,
    },
    messages: Item[] = chatItems.filter((item) => item.title === p.thread),
    scroll = useRef<HTMLDivElement>(null);
  const hasBacklashCheckin = messages.some((item) => item.id === "boyfriend-backlash-checkin");
  const romanceNodeId = String(p.ui?.["romance-node"] || "");
  const romanceNode = getKakaoStoryNode(romanceNodeId);
  const boyfriendStage2NodeId = String(p.ui?.["boyfriend-stage3-started"] === true ? p.ui?.["boyfriend-stage3-node"] || p.ui?.["boyfriend-stage2-node"] || "" : p.ui?.["boyfriend-stage2-node"] || "");
  const boyfriendStage2Node = getBoyfriendStage2Node(boyfriendStage2NodeId);
  const friendStoryNodeId = String(p.ui?.["friend-story-node"] || "");
  const friendStoryNode = getFriendStoryNode(friendStoryNodeId);
  const friendPhase2NodeId = String(p.ui?.["friend-story-phase2-node"] || "");
  const friendPhase2Node = getFriendPhase2Node(friendPhase2NodeId);

  const secretAdmirerMemberId = String(p.ui?.["secret-admirer-member-id"] || "");
  const secretAdmirerMember = ALD1_SECRET_ADMIRER_MEMBERS.find((member) => member.id === secretAdmirerMemberId);
  const secretAdmirerThread = Boolean(secretAdmirerMember && p.thread === secretAdmirerMember.name);
  const secretAdmirerNodeId = String(p.ui?.["secret-admirer-story-node"] || "");
  const secretAdmirerNode = secretAdmirerThread ? getSecretAdmirerNode(secretAdmirerNodeId) : undefined;
  const teamConflictMemberId = String(p.ui?.["team-conflict-member-id"] || "");
  const teamConflictMember = ALD1_SECRET_ADMIRER_MEMBERS.find((member) => member.id === teamConflictMemberId);
  const teamConflictThread = Boolean(teamConflictMember && p.thread === teamConflictMember.name);
  const teamConflictNodeId = String(p.ui?.["team-conflict-story-node"] || "");
  const teamConflictNode = teamConflictThread ? getTeamConflictNode(teamConflictNodeId) : undefined;
  const queuePending = (() => {
    let pending: Array<{ item?: { title?: string }; typingAt?: number; deliverAt?: number }> = [];
    try { pending = JSON.parse(String(p.ui?.["delivery-queue"] || "[]")); } catch { pending = []; }
    let typing: Record<string, number> = {};
    try {
      const parsed = JSON.parse(String(p.ui?.["typing-state"] || "{}"));
      if (parsed && typeof parsed === "object" && "title" in parsed) {
        const legacy = parsed as { title?: string; until?: number };
        if (legacy.title) typing[legacy.title] = Number(legacy.until || 0);
      } else if (parsed && typeof parsed === "object") {
        typing = parsed as Record<string, number>;
      }
    } catch { typing = {}; }
    return pending.some((entry) => entry.item?.title === p.thread)
      || Number(typing[p.thread] || 0) > Date.now();
  })();
  const romancePaused = romanceNodeId === "K014" && p.ui?.["romance-pending-node"] === "K030";
  useEffect(() => {
    if (!p.thread) return;
    messages.filter((item) => !item.outgoing && !item.read).forEach((item) => p.onRead(item.id));
  }, [p.thread, messages.length]);
  useEffect(() => {
    const node = scroll.current;
    if (!node) return;
    const nearBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 90;
    if (nearBottom) node.scrollTop = node.scrollHeight;
  }, [p.ui?.["typing-state"]]);
  useEffect(() => {
    const node = scroll.current;
    if (node) node.scrollTop = node.scrollHeight;
    setShowChoices(hasBacklashCheckin);
  }, [p.thread, messages.length, hasBacklashCheckin]);
  const boyfriendThread = Boolean(p.selectedBoyfriend && p.thread === p.selectedBoyfriend);
  const admirerMember = ALD1_SECRET_ADMIRER_MEMBERS.find(member => member.id === String(p.ui?.["boyfriend-admirer-discovery-member-id"] || ""));
  const boyfriendAdmirerNodeId = String(p.ui?.["boyfriend-admirer-discovery-node"] || "");
  const boyfriendAdmirerNode = boyfriendThread && p.ui?.["boyfriend-admirer-discovery-started"] === true ? getBoyfriendAdmirerNode(boyfriendAdmirerNodeId) : undefined;
  const boyfriendAdmirerChoices = (boyfriendAdmirerNode?.choices || []).filter(choice => !(boyfriendAdmirerNodeId === "M184" && choice.key === "A" && String(p.ui?.["secret-admirer-stage2-outcome"] || "") !== "R12" && p.ui?.["boyfriend-admirer-explicit-rejection"] !== true) && !(boyfriendAdmirerNodeId === "M184" && choice.key === "B" && String(p.ui?.["secret-admirer-stage2-outcome"] || "") === "R12"));

  const friendThread = Boolean(p.selectedFriend && p.thread === p.selectedFriend);
  const friendPhase3NodeId = String(p.ui?.["friend-third-arc-node"] || "");
  const friendPhase3Context = {
    aOutcome: String(p.ui?.["friend-third-arc-a-outcome"] || p.ui?.["secret-admirer-stage2-outcome"] || ""),
    boyfriendOutcome: String(p.ui?.["friend-third-arc-boyfriend-outcome"] || p.ui?.["boyfriend-admirer-discovery-result"] || ""),
    friendOutcome: String(p.ui?.["friend-third-arc-friend-outcome"] || p.ui?.["friend-story-phase2-outcome"] || ""),
    trust: Number(p.ui?.["friend-third-arc-trust-level"] ?? p.ui?.["friend-story-phase2-trust"] ?? 0),
    knowsAConfession: p.ui?.["friend-third-arc-knows-a-confession"] === true,
    knowsBoyfriendConflict: p.ui?.["friend-third-arc-knows-boyfriend-conflict"] === true,
    secretSource: String(p.ui?.["friend-third-arc-secret-source"] || "observed-only"),
  };
  const friendPhase3Node = friendThread ? getFriendPhase3Node(friendPhase3NodeId, friendPhase3Context) : undefined;
  const friendPhase3Choices = friendPhase3Node?.choices
    .map(choice => getFriendPhase3Choice(friendPhase3Node.id, choice.key, friendPhase3Context))
    .filter((choice): choice is NonNullable<typeof choice> => Boolean(choice))
    .map(choice => ({ ...choice, text: choice.text.replace(/\{\{ADMIRER_NAME\}\}/g, secretAdmirerMember?.name || "那位成员") })) || [];

  const boyfriendContext = romanceNode?.lines.join("") || "";
  // These cross-story prompts belong only to the first boyfriend arc. Once a
  // follow-up node exists, the stale first-arc node must not add choices to it.
  const friendLinkOptions = boyfriendThread && romanceNode && !boyfriendStage2Node && romanceNode.choices.length > 0
    ? p.ui?.["friend-story-handoff"] === "H07" && /公司|经纪人|活动/.test(boyfriendContext) && !p.ui?.["friend-link-used-" + romanceNode.id + "-handoff"]
      ? (messages.some(item => /公司.{0,8}警告|警告.{0,8}公司/.test(item.body))
          ? [
              { key: "friend-link:handoff:A", text: "你之前说过的警告，我想再确认细节。" },
              { key: "friend-link:handoff:B", text: "除了那件事，你还有其他没告诉我的事吗？" },
              { key: "friend-link:handoff:C", text: "我听到了，我们可以一起想办法。" },
            ]
          : [
              { key: "friend-link:handoff:A", text: "我知道你还有事情瞒着我，我们谈谈吧。" },
              { key: "friend-link:handoff:B", text: "我想听你亲口说出那件事。" },
              { key: "friend-link:handoff:C", text: "如果你现在还没准备好，我可以再等一会儿。" },
            ])
      : p.ui?.["friend-story-knows-sacrifice"] === true && /公司|经纪人|活动/.test(boyfriendContext) && !p.ui?.["friend-link-used-" + romanceNode.id + "-sacrifice"]
      ? [
          { key: "friend-link:sacrifice:A", text: "你是不是想用暂停活动换公司不要追究我？" },
          { key: "friend-link:sacrifice:B", text: "我不希望你放弃自己的梦想。" },
          { key: "friend-link:sacrifice:C", text: "你应该先跟团员商量。" },
        ]
      : p.ui?.["friend-story-knows-warning"] === true && /公司|经纪人/.test(boyfriendContext) && !p.ui?.["friend-link-used-" + romanceNode.id + "-warning"]
        ? [
            { key: "friend-link:warning:A", text: "你是不是几个星期前就被公司警告了？" },
            { key: "friend-link:warning:B", text: "你还有什么事情没有告诉我？" },
            { key: "friend-link:warning:C", text: "如果你现在不想说，我可以等。" },
          ]
        : []
    : [];
  const displayedRomanceChoices = [...(boyfriendStage2Node?.choices || romanceNode?.choices || []), ...friendLinkOptions];
  const playerReply = boyfriendThread ? "看到了，怎么办？" : "不好，我好害怕";
  const previousThread = useRef(p.thread);
  useEffect(() => {
    const reopened = !previousThread.current && Boolean(p.thread);
    previousThread.current = p.thread;
    if (reopened && boyfriendThread && romancePaused) p.onKakaoChoice?.(p.thread, "", "", "", "__resume__");
  }, [p.thread, romancePaused, boyfriendThread]);
  useEffect(() => {
    if (boyfriendThread && hasBacklashCheckin && !romanceNodeId) p.onKakaoChoice?.(p.thread, "", "", "", "__migrate__");
  }, [boyfriendThread, hasBacklashCheckin, romanceNodeId]);
  const replyAlreadySent = hasBacklashCheckin
    ? messages.some((item) => item.meta.storyCheckinChoice === "1" || item.meta.storyCheckinChoice === "2")
    : messages.some((item) => item.outgoing && item.sender === "我" && item.body === playerReply);
  return (
    <div className="mymy-ui mymy-kakao" data-mymy="kakao">
      {p.thread ? (
        <>
          <header className="kzth">
            <Back onClick={() => p.onThread("")} />
            <span className="kzname">{p.thread}</span>
            <span className="kzpill">
              <button aria-label="聊天菜单" onClick={() => setMenu(!menu)}>
                <Menu size={21} />
              </button>
            </span>
          </header>
          <div className="msgs kk" ref={scroll}>
            {messages.map((m, i) => {
              const run = messageRun(messages, i);
              const dateLabel = m.time.slice(0, 10);
              const showDate = i === 0 || dateLabel !== messages[i - 1]?.time.slice(0, 10);
              const bubble = (
                <button
                  className={"kzbub" + (m.media ? " kzimg" : "")}
                  onClick={() => m.meta.local !== "true" && read(p, m)}
                >
                  {m.meta.friendPhase2Screenshot ? (
                    <div style={{ width: 250, maxWidth: "68vw", padding: 12, borderRadius: 13, background: "#f7f8fa", border: "1px solid #e3e6eb", color: "#30343b", textAlign: "left", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 10, color: "#89909b" }}>
                        <b>聊天记录截图</b><span>私人对话</span>
                      </div>
                      {m.meta.friendPhase2Screenshot === "original" ? (
                        <div style={{ padding: 10, borderRadius: 9, background: "#fff", fontSize: 12, lineHeight: 1.8 }}>
                          <div style={{ color: "#8a9099", fontSize: 10, marginBottom: 5 }}>我</div>
                          我真的不知道那些粉丝到底想怎样。<br />难道我要为了她们的情绪，跟自己喜欢的人分手吗？
                        </div>
                      ) : (
                        <div style={{ padding: 10, borderRadius: 9, background: "#fff", fontSize: 12, lineHeight: 1.8 }}>
                          <div style={{ color: "#8a9099", fontSize: 10, marginBottom: 5 }}>我</div>
                          我真的不知道那些粉丝到底想怎样。
                          <div style={{ marginTop: 9, paddingTop: 8, borderTop: "1px dashed #d7dbe2", color: "#b35e62", fontSize: 10 }}>后续内容被裁掉，缺少完整上下文</div>
                        </div>
                      )}
                      <div style={{ marginTop: 8, textAlign: "right", color: "#9aa1aa", fontSize: 9 }}>截图 · 仅供剧情调查</div>
                    </div>
                  ) : m.media ? <Media item={m} /> : m.body}
                </button>
              );
              if (m.outgoing) {
                return (
                  <Fragment key={m.id}>
                    {showDate && <div className="kz-date">{dateLabel}</div>}
                    <div className={"kzm kzmy" + (run.first ? " first" : "")}>
                    {run.last && (
                      <span className="kzt">
                        {m.meta.unread || ""}
                        <br />
                        {m.time.slice(-5)}
                      </span>
                    )}
                    {bubble}
                    </div>
                  </Fragment>
                );
              }
              return (
                <Fragment key={m.id}>
                  {showDate && <div className="kz-date">{dateLabel}</div>}
                  <div
                  className={"kzm kzot" + (run.first ? " first" : " continuation")}
                >
                  {run.first && (
                    <div className="kzmav">
                      <span className="catalog-avatar kzka round">
                        <img
                          src={memberAvatar(p.thread)}
                          alt={p.thread}
                          loading="eager"
                          decoding="sync"
                          style={kakaoChatAvatarImageStyle}
                        />
                      </span>
                    </div>
                  )}
                  <div className="kz-content">
                    {run.first && <div className="kzmn">{m.sender}</div>}
                    <div className="kz-message-line">
                      {bubble}
                      {run.last && <span className="kzt">{m.time.slice(-5)}</span>}
                    </div>
                  </div>
                  </div>
                </Fragment>
              );
            })}
            {(() => {
              let typingUntil = 0;
              try {
                const typing = JSON.parse(String(p.ui?.["typing-state"] || "null"));
                if (typing && typeof typing === "object" && "title" in typing) {
                  if (typing.title === p.thread) typingUntil = Number(typing.until || 0);
                } else if (typing && typeof typing === "object") {
                  typingUntil = Number(typing[p.thread] || 0);
                }
              } catch { typingUntil = 0; }
              return typingUntil > Date.now() ? (
                <div className="kzm kzot first kztyping" aria-label="正在输入">
                  <div className="kzmav">
                    <span className="catalog-avatar kzka round">
                      <img
                        src={memberAvatar(p.thread)}
                        alt=""
                        loading="eager"
                        decoding="sync"
                        style={kakaoChatAvatarImageStyle}
                      />
                    </span>
                  </div>
                  <div className="kz-content">
                    <div className="kzmn">{p.thread}</div>
                    <div className="kz-message-line">
                      <div className="kzbub kztyping-bubble"><i/><i/><i/></div>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
            {!messages.length && <Blank />}
          </div>
          {boyfriendThread && !hasBacklashCheckin && !replyAlreadySent && !queuePending ? (
            <div className="kzinp" style={{ minHeight: 48, padding: "5px 10px" }}>
              <button type="button" className="go" style={{ display: "block", boxSizing: "border-box", minWidth: 0, width: "100%", borderRadius: 14, padding: "10px 13px", border: "1px solid #eadbc8", background: "linear-gradient(180deg, #ffffff 0%, #fff8ed 100%)", color: "#655344", boxShadow: "0 2px 7px rgba(115, 87, 58, 0.07)", fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", fontSize: 13, fontWeight: 500, lineHeight: 1.55, textAlign: "left", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word" }}
                onClick={() => p.onKakaoChoice?.(p.thread, playerReply, "你的身份好像已经被扒出来了")}>
                {playerReply}
              </button>
            </div>
          ) : boyfriendThread && !romanceNode && !boyfriendStage2Node ? (
            <div className="kzinp" style={{ minHeight: 48, padding: "5px 10px" }}>
              <div style={{ width: "100%", textAlign: "center", color: "#777", padding: 8 }}>等待下一段消息…</div>
            </div>
          ) : boyfriendThread && (boyfriendAdmirerNode || romanceNode || boyfriendStage2Node) ? (
            <div className="kzinp" style={{ minHeight: 48, padding: "5px 10px" }}>
              {queuePending ? (
                <div style={{ width: "100%", textAlign: "center", color: "#777", padding: 8 }}>正在接收消息…</div>
              ) : romancePaused ? (
                <button type="button" className="go" style={{ borderRadius: 18, padding: "11px 14px", width: "100%", whiteSpace: "normal" }} onClick={() => p.onThread("")}>
                  先结束聊天，稍后重新打开继续
                </button>
              ) : displayedRomanceChoices.length ? (
                <div style={{ display: "grid", gap: 9, width: "100%", minWidth: 0, boxSizing: "border-box", padding: "10px 9px", borderRadius: 20, background: "linear-gradient(145deg, #fffefa 0%, #fbf3e8 100%)", border: "1px solid #eee2d2", boxShadow: "0 3px 12px rgba(126, 99, 69, 0.07)" }}>
                  {(boyfriendAdmirerNode ? boyfriendAdmirerChoices : displayedRomanceChoices).map((choice, index) => (
                    <button key={choice.key} type="button" className="go" style={{ display: "block", boxSizing: "border-box", minWidth: 0, maxWidth: "100%", width: "100%", minHeight: 42, borderRadius: 14, padding: "10px 13px", border: "1px solid #eadbc8", background: "linear-gradient(180deg, #ffffff 0%, #fffaf2 100%)", color: "#655344", boxShadow: "0 2px 5px rgba(115, 87, 58, 0.06)", fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", fontSize: 13, fontWeight: 500, lineHeight: 1.55, letterSpacing: "0.1px", textAlign: "left", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word", overflow: "visible" }}
                      onClick={() => p.onKakaoChoice?.(p.thread, admirerMember ? choice.text.replace(/那位成员/g, admirerMember.name).replace(/他/g, admirerMember.name) : choice.text, "", "", boyfriendAdmirerNode ? "boyfriend-admirer:" + boyfriendAdmirerNode.id + ":" + choice.key : boyfriendStage2Node ? "boyfriend-stage2:" + boyfriendStage2Node.id + ":" + choice.key : choice.key)}>
                      <span style={{ display: "inline-block", marginRight: 7, color: "#c2a17c", fontSize: 11, fontWeight: 600 }}>{String(index + 1).padStart(2, "0")}</span>
                      {choice.text}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ width: "100%", textAlign: "center", color: "#777", padding: 8 }}>这一段暂时告一段落，后续消息会继续更新。</div>
              )}
            </div>
          ) : secretAdmirerThread && secretAdmirerNode ? (
            <div className="kzinp" style={{ minHeight: 48, padding: "5px 10px" }}>
              {queuePending ? (
                <div style={{ width: "100%", textAlign: "center", color: "#777", padding: 8 }}>正在接收消息…</div>
              ) : secretAdmirerNode.choices.length ? (
                <div style={{ display: "grid", gap: 9, width: "100%", minWidth: 0, boxSizing: "border-box", padding: "10px 9px", borderRadius: 20, background: "linear-gradient(145deg, #fffefa 0%, #fbf3e8 100%)", border: "1px solid #eee2d2", boxShadow: "0 3px 12px rgba(126, 99, 69, 0.07)" }}>
                  {secretAdmirerNode.choices.map((choice, index) => (
                    <button key={choice.key} type="button" className="go" style={{ display: "block", boxSizing: "border-box", minWidth: 0, maxWidth: "100%", width: "100%", minHeight: 42, borderRadius: 14, padding: "10px 13px", border: "1px solid #eadbc8", background: "linear-gradient(180deg, #ffffff 0%, #fffaf2 100%)", color: "#655344", boxShadow: "0 2px 5px rgba(115, 87, 58, 0.06)", fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", fontSize: 13, fontWeight: 500, lineHeight: 1.55, letterSpacing: "0.1px", textAlign: "left", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word", overflow: "visible" }}
                      onClick={() => p.onKakaoChoice?.(p.thread, choice.text, "", "", "admirer:" + secretAdmirerNode.id + ":" + choice.key)}>
                      <span style={{ display: "inline-block", marginRight: 7, color: "#c2a17c", fontSize: 11, fontWeight: 600 }}>{String(index + 1).padStart(2, "0")}</span>
                      {choice.text}
                    </button>
                  ))}
                </div>
              ) : ["distance", "rejected"].includes(String(p.ui?.["secret-admirer-boundary"] || "")) ? (
                Date.now() >= Number(p.ui?.["secret-admirer-boundary-until-at"] || 0) ? (
                  <button type="button" className="go" style={{ display: "block", boxSizing: "border-box", width: "100%", borderRadius: 14, padding: "11px 13px", border: "1px solid #eadbc8", background: "linear-gradient(180deg, #ffffff 0%, #fffaf2 100%)", color: "#655344", fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", fontSize: 13, whiteSpace: "normal" }}
                    onClick={() => p.onKakaoChoice?.(p.thread, "我想重新联系你。", "", "", "admirer:reconnect")}>
                    我想重新联系你
                  </button>
                ) : (
                  <div style={{ width: "100%", textAlign: "center", color: "#777", padding: 8 }}>他会尊重你的决定，不会主动打扰你。</div>
                )
              ) : (
                <div style={{ width: "100%", textAlign: "center", color: "#777", padding: 8 }}>这一阶段暂时告一段落。</div>
              )}
            </div>
          ) : teamConflictThread && teamConflictNode ? (
            <div className="kzinp" style={{ minHeight: 48, padding: "5px 10px" }}>
              {queuePending ? (
                <div style={{ width: "100%", textAlign: "center", color: "#777", padding: 8 }}>正在接收消息…</div>
              ) : teamConflictNode.choices.length ? (
                <div style={{ display: "grid", gap: 9, width: "100%", minWidth: 0, boxSizing: "border-box", padding: "10px 9px", borderRadius: 20, background: "linear-gradient(145deg, #fffefa 0%, #fbf3e8 100%)", border: "1px solid #eee2d2", boxShadow: "0 3px 12px rgba(126, 99, 69, 0.07)" }}>
                  {teamConflictNode.choices.map((choice, index) => (
                    <button key={choice.key} type="button" className="go" style={{ display: "block", boxSizing: "border-box", minWidth: 0, maxWidth: "100%", width: "100%", minHeight: 42, borderRadius: 14, padding: "10px 13px", border: "1px solid #eadbc8", background: "linear-gradient(180deg, #ffffff 0%, #fffaf2 100%)", color: "#655344", boxShadow: "0 2px 5px rgba(115, 87, 58, 0.06)", fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", fontSize: 13, fontWeight: 500, lineHeight: 1.55, letterSpacing: "0.1px", textAlign: "left", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word", overflow: "visible" }}
                      onClick={() => p.onKakaoChoice?.(p.thread, choice.text, "", "", "team-conflict:" + teamConflictNode.id + ":" + choice.key)}>
                      <span style={{ display: "inline-block", marginRight: 7, color: "#c2a17c", fontSize: 11, fontWeight: 600 }}>{String(index + 1).padStart(2, "0")}</span>
                      {choice.text}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ width: "100%", textAlign: "center", color: "#777", padding: 8 }}>这一阶段已结束，聊天记录已保存。</div>
              )}
            </div>
          ) : friendThread && friendPhase3Node ? (
            <div className="kzinp" style={{ minHeight: 48, padding: "5px 10px" }}>
              {queuePending ? (
                <div style={{ width: "100%", textAlign: "center", color: "#777", padding: 8 }}>正在接收消息…</div>
              ) : friendPhase3Choices.length ? (
                <div style={{ display: "grid", gap: 9, width: "100%", minWidth: 0, boxSizing: "border-box", padding: "10px 9px", borderRadius: 20, background: "linear-gradient(145deg, #fffefa 0%, #fbf3e8 100%)", border: "1px solid #eee2d2", boxShadow: "0 3px 12px rgba(126, 99, 69, 0.07)" }}>
                  {friendPhase3Choices.map((choice, index) => (
                    <button key={choice.key} type="button" className="go" style={{ display: "block", boxSizing: "border-box", minWidth: 0, maxWidth: "100%", width: "100%", minHeight: 42, borderRadius: 14, padding: "10px 13px", border: "1px solid #eadbc8", background: "linear-gradient(180deg, #ffffff 0%, #fffaf2 100%)", color: "#655344", boxShadow: "0 2px 5px rgba(115, 87, 58, 0.06)", fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", fontSize: 13, fontWeight: 500, lineHeight: 1.55, letterSpacing: "0.1px", textAlign: "left", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word", overflow: "visible" }}
                      onClick={() => p.onKakaoChoice?.(p.thread, choice.text, "", "", "friend-phase3:" + friendPhase3Node.id + ":" + choice.key)}>
                      <span style={{ display: "inline-block", marginRight: 7, color: "#c2a17c", fontSize: 11, fontWeight: 600 }}>{String(index + 1).padStart(2, "0")}</span>
                      {choice.text}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ width: "100%", textAlign: "center", color: "#777", padding: 8 }}>阶段结果：{getFriendPhase3OutcomeLabel(friendPhase3Node.result || String(p.ui?.["friend-third-arc-outcome"] || ""))}。聊天记录和结果已保存。</div>
              )}
            </div>
          ) : friendThread && friendPhase2Node ? (
            <div className="kzinp" style={{ minHeight: 48, padding: "5px 10px" }}>
              {friendPhase2Node.id === "F2_074" ? (
                <div style={{ width: "100%", textAlign: "center", color: "#777", padding: 8 }}>我先等一会儿，等有新的消息再告诉你。</div>
              ) : queuePending ? (
                <div style={{ width: "100%", textAlign: "center", color: "#777", padding: 8 }}>正在接收消息…</div>
              ) : friendPhase2Node.choices.length ? (
                <div style={{ display: "grid", gap: 9, width: "100%", minWidth: 0, boxSizing: "border-box", padding: "10px 9px", borderRadius: 20, background: "linear-gradient(145deg, #fffefa 0%, #fbf3e8 100%)", border: "1px solid #eee2d2", boxShadow: "0 3px 12px rgba(126, 99, 69, 0.07)" }}>
                  {friendPhase2Node.choices.map((choice, index) => (
                    <button key={choice.key} type="button" className="go" style={{ display: "block", boxSizing: "border-box", minWidth: 0, maxWidth: "100%", width: "100%", minHeight: 42, borderRadius: 14, padding: "10px 13px", border: "1px solid #eadbc8", background: "linear-gradient(180deg, #ffffff 0%, #fffaf2 100%)", color: "#655344", boxShadow: "0 2px 5px rgba(115, 87, 58, 0.06)", fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", fontSize: 13, fontWeight: 500, lineHeight: 1.55, letterSpacing: "0.1px", textAlign: "left", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word", overflow: "visible" }}
                      onClick={() => p.onKakaoChoice?.(p.thread, choice.text, "", "", "friend-phase2:" + friendPhase2Node.id + ":" + choice.key)}>
                      <span style={{ display: "inline-block", marginRight: 7, color: "#c2a17c", fontSize: 11, fontWeight: 600 }}>{String(index + 1).padStart(2, "0")}</span>
                      {choice.text}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ width: "100%", textAlign: "center", color: "#777", padding: 8 }}>阶段结果：{getFriendPhase2OutcomeLabel(friendPhase2Node.result || String(p.ui?.["friend-story-phase2-outcome"] || ""))}。聊天记录和结果已保存。</div>
              )}
            </div>
          ) : friendThread && friendStoryNode ? (
            <div className="kzinp" style={{ minHeight: 48, padding: "5px 10px" }}>
              {queuePending ? (
                <div style={{ width: "100%", textAlign: "center", color: "#777", padding: 8 }}>正在接收消息…</div>
              ) : friendStoryNode.choices.length ? (
                <div style={{ display: "grid", gap: 9, width: "100%", minWidth: 0, boxSizing: "border-box", padding: "10px 9px", borderRadius: 20, background: "linear-gradient(145deg, #fffefa 0%, #fbf3e8 100%)", border: "1px solid #eee2d2", boxShadow: "0 3px 12px rgba(126, 99, 69, 0.07)" }}>
                  {friendStoryNode.choices.map((choice, index) => (
                    <button key={choice.key} type="button" className="go" style={{ display: "block", boxSizing: "border-box", minWidth: 0, maxWidth: "100%", width: "100%", minHeight: 42, borderRadius: 14, padding: "10px 13px", border: "1px solid #eadbc8", background: "linear-gradient(180deg, #ffffff 0%, #fffaf2 100%)", color: "#655344", boxShadow: "0 2px 5px rgba(115, 87, 58, 0.06)", fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", fontSize: 13, fontWeight: 500, lineHeight: 1.55, letterSpacing: "0.1px", textAlign: "left", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word", overflow: "visible" }}
                      onClick={() => p.onKakaoChoice?.(p.thread, choice.text, "", "", "friend:" + friendStoryNode.id + ":" + choice.key)}>
                      <span style={{ display: "inline-block", marginRight: 7, color: "#c2a17c", fontSize: 11, fontWeight: 600 }}>{String(index + 1).padStart(2, "0")}</span>
                      {choice.text}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ width: "100%", textAlign: "center", color: "#777", padding: 8 }}>这一阶段已记录，后续消息会继续更新。</div>
              )}
            </div>
          ) : friendThread && !replyAlreadySent ? (
            <div className="kzinp" style={{ minHeight: 48, padding: "5px 10px" }}>
              {showChoices ? (
                <button type="button" className="go" style={{ display: "block", boxSizing: "border-box", minWidth: 0, width: "100%", borderRadius: 14, padding: "10px 13px", border: "1px solid #eadbc8", background: "linear-gradient(180deg, #ffffff 0%, #fff8ed 100%)", color: "#655344", boxShadow: "0 2px 7px rgba(115, 87, 58, 0.07)", fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif", fontSize: 13, fontWeight: 500, lineHeight: 1.55, textAlign: "left", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word" }}
                  onClick={() => { p.onKakaoChoice?.(p.thread, playerReply, "你先别紧张，他已经在和公司开会了"); setShowChoices(false); }}>
                  {playerReply}
                </button>
              ) : (
                <button type="button" aria-label="选择回复" onClick={() => setShowChoices(true)}
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", minHeight: 34, padding: "0 5px", color: "#777", textAlign: "left" }}>
                  <Smile size={22} /><span style={{ flex: 1 }}>Aa</span><Send size={20} />
                </button>
              )}
            </div>
          ) : null}
          {menu && (
            <div className="mymy-local-menu">
              <strong>{p.thread}</strong>
              <p>
                群成员：{[...new Set(messages.map((m) => m.sender))].join("、")}
              </p>
              <button onClick={() => setMenu(false)}>完成</button>
            </div>
          )}
        </>
      ) : (
        <div className="kzkk">
          <div className="kzhd">
            <header className="kzkh">
              <b className="kzti">
                {tab === "好友" ? p.owner || "好友" : "聊天"}
              </b>
              <span className="kzic">
                <button
                  aria-label="搜索聊天"
                  onClick={() => setQuery(query ? "" : " ")}
                >
                  <Search size={21} />
                </button>
                {p.creator && (
                  <button aria-label="新增内容" onClick={p.onAdd}>
                    <Plus />
                  </button>
                )}
                <button aria-label="KKT设置" onClick={() => setMenu(!menu)}>
                  <Settings size={21} />
                </button>
              </span>
            </header>
            <div className="kzkc2">
              {["好友", "聊天"].map((t) => (
                <button
                  key={t}
                  className={
                    "kzkpl " +
                    (t === tab || (t === "为你推荐" && tab === "推荐")
                      ? "on"
                      : "")
                  }
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {query !== "" && (
              <input
                className="mymy-search"
                aria-label="搜索KKT"
                value={query.trimStart()}
                onChange={(e) => setQuery(e.target.value || " ")}
                placeholder="搜索"
              />
            )}
          </div>
          <div className="kzkb">
            {tab === "好友" ? (
              <>
                <div className="kzksec">好友 {contacts.length}</div>
                {contacts
                  .filter((person) => person.name.includes(query.trim()))
                  .map((person) => (
                    <button
                      className="kzkr kzkcr"
                      key={person.name}
                      onClick={() => p.onThread(person.name)}
                    >
                      <span
                        className="catalog-avatar round"
                        style={{
                          width: 48,
                          height: 48,
                          flex: "0 0 48px",
                          overflow: "hidden",
                          borderRadius: "50%",
                          background: "#e9e5df",
                        }}
                      >
                        <img
                          src={person.avatar}
                          alt={person.name}
                          loading="eager"
                          decoding="sync"
                          style={kakaoAvatarImageStyle}
                        />
                      </span>
                      <span className="kzkn">
                        <b>{person.name}</b>
                      </span>
                    </button>
                  ))}
                {!contacts.filter((person) => person.name.includes(query.trim())).length && <Blank />}
              </>
            ) : (
              <>
                <div className="kzksec">全部聊天 {new Set(chatItems.map((item) => item.title)).size}</div>
                {chatItems.length ? (
                  [...new Set(chatItems.map((item) => item.title))].map((title) => {
                    const conversation = chatItems.filter((item) => item.title === title);
                    const latest = conversation.at(-1)!;
                    const unreadCount = conversation.filter((item) => !item.outgoing && !item.read).length;
                    return (
                      <button
                        className="kzkr"
                        key={title}
                        onClick={() => p.onThread(title)}
                      >
                        <span
                          className="catalog-avatar round"
                          style={{
                            width: 48,
                            height: 48,
                            flex: "0 0 48px",
                            overflow: "hidden",
                            borderRadius: "50%",
                            background: "#e9e5df",
                          }}
                        >
                          <img
                            src={memberAvatar(title, latest.avatar)}
                            alt={title}
                            loading="eager"
                            decoding="sync"
                            style={kakaoAvatarImageStyle}
                          />
                        </span>
                        <span className="kzkn">
                          <b>{title}</b>
                          <small>{latest.body}</small>
                        </span>
                        <span className="kzkr-meta">
                          <time>{latest.time.slice(-5)}</time>
                          {unreadCount > 0 && <i className="kz-unread-count">{unreadCount > 99 ? "99+" : unreadCount}</i>}
                        </span>
                      </button>
                    );
                  })
                ) : <Blank />}
              </>
            )}
          </div>
          <nav className="kzknv">
            {[Users, MessageCircle, Compass, Grid, MoreHorizontal].map(
              (Icon, i) => (
                <button
                  key={i}
                  aria-label={["好友", "聊天", "发现", "更多功能", "设置"][i]}
                  className={(tab === "好友" ? 0 : 1) === i ? "on" : ""}
                  onClick={() =>
                    i < 2 ? setTab(["好友", "聊天"][i]) : setMenu(true)
                  }
                >
                  <Icon />
                </button>
              ),
            )}
          </nav>
          {menu && (
            <div className="mymy-local-menu">
              <strong>KakaoTalk</strong>
              <p>作品内聊天</p>
              <button onClick={() => setMenu(false)}>完成</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export function MymyInstagram(p: SkinProps) {
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "主页"),
    [liked, setLiked] = useSkinState<string[]>(p, "mymyLiked", []),
    [saved, setSaved] = useSkinState<string[]>(p, "mymySaved", []),
    [replies, setReplies] = useSkinState<string[]>(p, "mymyReplies", []);
  const [sheet, setSheet] = useState<Item | null>(null),
    [selected, setSelected] = useState<Item | null>(null),
    [story, setStory] = useState(0),
    [draft, setDraft] = useState(""),
    [sentMessagesJson, setSentMessagesJson] = useSkinState<string>(p, "igSentMessages", "{}"),
    [pop, setPop] = useState(""),
    [dmQuery, setDmQuery] = useState(""),
    [dmTab, setDmTab] = useState<"一般" | "陌生讯息">("一般");
  const sentMessages: Record<string, string[]> = (() => {
    try {
      const parsed: unknown = JSON.parse(sentMessagesJson);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      return Object.fromEntries(
        Object.entries(parsed).filter(
          ([, value]) => Array.isArray(value) && value.every((message) => typeof message === "string"),
        ),
      ) as Record<string, string[]>;
    } catch {
      return {};
    }
  })();
  const posts = p.items.filter(
      (i) => i.folder !== "私信" && i.meta.story !== "true",
    ),
    stories = p.items.filter((i) => i.meta.story === "true"),
    dms = p.items.filter((i) => i.folder === "私信"),
    active = stories[story - 1],
    isBacklash = (i: Item) => i.id.startsWith("ig-backlash-"),
    filteredDms = [...dms].filter((i) => i.sender.toLowerCase().includes(dmQuery.toLowerCase())).sort((a, b) => Number(b.meta.sequence || 0) - Number(a.meta.sequence || 0)),
    generalDms = filteredDms.filter((i) => !isBacklash(i) || (sentMessages[i.id]?.length || 0) > 0),
    requestDms = filteredDms.filter((i) => isBacklash(i) && !(sentMessages[i.id]?.length || 0));
  const toggle = (id: string, values: string[], set: (v: string[]) => void) =>
    set(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(
      () => setStory((n) => (n < stories.length ? n + 1 : 0)),
      5000,
    );
    return () => clearTimeout(t);
  }, [active, stories.length]);
  useEffect(() => {
    const requestedId = p.ui?.["ig-open-id"];
    if (typeof requestedId !== "string" || !requestedId) return;
    const target = dms.find((item) => item.id === requestedId);
    if (target) {
      setTab("私信");
      setDmTab(isBacklash(target) ? "陌生讯息" : "一般");
      setSelected(target);
      read(p, target);
      p.onUi?.("ig-open-id", "");
    }
  }, [p.ui?.["ig-open-id"], p.items.length]);
  const openPost = (i: Item) => {
    if (p.creator || i.password) p.onItem(i);
    else {
      read(p, i);
      setSelected(i);
    }
  };
  const post = (i: Item) => (
    <article className="igp" key={i.id}>
      <header className="igph">
        <Avatar name={i.sender} src={i.avatar} />
        <div className="igpn">
          <button onClick={() => setTab("个人主页")}>
            <b>{i.sender}</b>
          </button>
          <small>{i.meta.location || i.time}</small>
        </div>
        <button aria-label="帖子详情" onClick={() => openPost(i)}>
          <MoreHorizontal />
        </button>
      </header>
      <div
        className="carw"
        onDoubleClick={() => {
          if (!liked.includes(i.id)) setLiked([...liked, i.id]);
          setPop(i.id);
        }}
      >
        <Media item={i} />
        {pop === i.id && (
          <Heart
            className="mymy-heart-pop"
            fill="white"
            onAnimationEnd={() => setPop("")}
          />
        )}
      </div>
      <div className="iga">
        <button
          aria-label={"点赞" + i.title}
          aria-pressed={liked.includes(i.id)}
          onClick={() => toggle(i.id, liked, setLiked)}
        >
          <Heart
            fill={liked.includes(i.id) ? "#ff3040" : "none"}
            color={liked.includes(i.id) ? "#ff3040" : "currentColor"}
          />
        </button>
        <button
          aria-label={"评论" + i.title}
          onClick={() => {
            read(p, i);
            setSheet(i);
          }}
        >
          <MessageCircle />
        </button>
        <button aria-label="分享帖子" onClick={() => setTab("私信")}>
          <Send />
        </button>
        <button
          className="mymy-save"
          aria-label={"收藏" + i.title}
          aria-pressed={saved.includes(i.id)}
          onClick={() => toggle(i.id, saved, setSaved)}
        >
          <Bookmark fill={saved.includes(i.id) ? "currentColor" : "none"} />
        </button>
      </div>
      <p className="lk2">{i.likes + (liked.includes(i.id) ? 1 : 0)} 次赞</p>
      <button
        className="igc"
        onClick={() => {
          openPost(i);
        }}
      >
        <b>{i.sender}</b> {i.body}
      </button>
      <button className="cmall" onClick={() => setSheet(i)}>
        查看评论{" "}
        {i.comments.length +
          replies.filter((r) => r.startsWith(i.id + "\t")).length}
      </button>
      <p className="igt">{i.time}</p>
    </article>
  );
  return (
    <div className="mymy-ui mymy-instagram" data-mymy="instagram">
      <div className="ig">
        {tab === "私信" && !selected ? (
          <header className="ig-inbox-header">
            <button aria-label={selected ? "返回收件匣" : "返回"} onClick={() => selected ? setSelected(null) : p.onBack()}><ArrowLeft size={25}/></button>
            <b>allyz_1101</b><ChevronDown size={16}/>
            <span/>
            <button aria-label="新增消息"><SquarePen size={23}/></button>
          </header>
        ) : selected?.folder === "私信" ? null : (
          <header className="igh">
            <button aria-label={selected ? "返回Instagram动态" : "关闭当前App"} onClick={() => (selected ? setSelected(null) : p.onBack())}><ArrowLeft /></button>
            <span className="igl2">{selected ? "帖子" : tab === "主页" ? "Instagram" : tab}</span>
            <button aria-label="打开私信" onClick={() => { setSelected(null); setTab("私信"); }}><Send /></button>
          </header>
        )}
        <div className="igb">
          {selected?.folder === "私信" ? (
            <section className="ig-dm-chat">
              <header className="ig-dm-person">
                <button aria-label="返回收件匣" onClick={() => setSelected(null)}><ArrowLeft size={23}/></button>
                <Avatar name={selected.sender} /><span><b>{selected.sender}</b><small>活跃状态不可用</small></span>
                <button aria-label="语音通话"><Phone size={21}/></button><button aria-label="视频通话"><Video size={21}/></button><button aria-label="对话信息"><Info size={21}/></button>
              </header>
              <div className="ig-dm-thread">
                <div className="ig-dm-date">今天 {selected.time.slice(-5)}</div>
                <div className="ig-dm-message"><Avatar name={selected.sender} /><p>{selected.body}</p></div>
                {(sentMessages[selected.id] || []).map((message, index) => (
                  <div className="ig-dm-message ig-dm-message-out" key={selected.id + "-reply-" + index}>
                    <p>{message}</p>
                  </div>
                ))}
              </div>
              <form className="ig-dm-compose" onSubmit={(e) => {
                e.preventDefault();
                const message = draft.trim();
                if (!message) return;
                setSentMessagesJson(JSON.stringify({
                  ...sentMessages,
                  [selected.id]: [...(sentMessages[selected.id] || []), message],
                }));
                if (isBacklash(selected)) p.onInstagramReply?.(selected, message);
                // A reply accepts the request and moves the conversation to General.
                if (isBacklash(selected)) setDmTab("一般");
                setDraft("");
              }}>
                <button type="button" aria-label="相机"><Camera size={21}/></button>
                <input aria-label="发送消息" placeholder="发送消息……" value={draft} onChange={(e) => setDraft(e.target.value)}/>
                {draft.trim() ? (
                  <button type="submit" aria-label="发送消息" className="ig-dm-send">发送</button>
                ) : (
                  <>
                    <button type="button" aria-label="语音消息"><Mic size={21}/></button><button type="button" aria-label="图片"><ImageIcon size={21}/></button><button type="button" aria-label="添加"><PlusCircle size={21}/></button>
                  </>
                )}
              </form>
            </section>
          ) : selected ? post(selected) : null}
          {!selected && tab === "主页" && (
            <section className="ig-official-profile">
              <div className="pf">
                <span className="catalog-avatar round" style={{ overflow: "hidden" }}><img src="/FoundPhone-Studio/ald1-avatar.jpg.png" alt="ALPHA DRIVE ONE" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /></span>
                <div className="ps">
                  <div><b>0</b><small>帖子</small></div>
                  <div><b>2.5M</b><small>粉丝</small></div>
                  <div><b>8</b><small>关注中</small></div>
                </div>
              </div>
              <p className="pn"><b>ALPHA DRIVE ONE (알파드라이브원)</b></p>
              <p style={{padding:"0 16px",fontSize:13,lineHeight:1.55,margin:"4px 0 12px"}}>
                𝐃𝐢𝐠𝐢𝐭𝐚𝐥 𝐒𝐢𝐧𝐠𝐥𝐞 '𝐓𝐚𝐥𝐤 𝐭𝐨 𝐦𝐞' OUT NOW
              </p>
              <div style={{display:"flex",gap:8,padding:"0 16px 16px"}}>
                <button style={{flex:1,border:0,borderRadius:7,padding:9,background:"#3797f0",color:"white",fontWeight:700}}>关注</button>
                <button style={{flex:1,border:0,borderRadius:7,padding:9,background:"#efefef",color:"#111",fontWeight:700}}>发消息</button>
              </div>
              <div className="ptab"><div className="on"><Grid /></div></div>
              <div className="pg2"><Blank /></div>
            </section>
          )}
          {!selected && tab === "个人主页" && (
            <>
              <div className="pf">
                <Avatar name="allyz_1101" />
                <div className="ps">
                  <div>
                    <b>{posts.length}</b>
                    <small>帖子</small>
                  </div>
                  <div>
                    <b>—</b>
                    <small>粉丝</small>
                  </div>
                  <div>
                    <b>—</b>
                    <small>关注</small>
                  </div>
                </div>
              </div>
              <p className="pn">allyz_1101</p>
              <div className="ptab">
                <div className="on">
                  <Grid />
                </div>
              </div>
              <div className="pg2">
                {posts.map((i) => (
                  <button key={i.id} onClick={() => openPost(i)}>
                    <Media item={i} />
                  </button>
                ))}
              </div>
            </>
          )}
          {!selected && tab === "私信" && (
            <section className="ig-inbox">
              <label className="ig-dm-search"><Search size={18}/><input aria-label="搜尋使用者名稱" placeholder="搜尋" value={dmQuery} onChange={(e) => setDmQuery(e.target.value)}/></label>
              <div className="ig-notes-strip">
                <div className="ig-note-own"><Avatar name="allyz_1101"/><small>你的便條</small></div>
                {stories.slice(0,5).map((storyItem) => <button key={storyItem.id} className="ig-note-person" onClick={() => openPost(storyItem)}><Avatar name={storyItem.sender} src={storyItem.avatar}/><small>{storyItem.sender}</small></button>)}
              </div>
              <div className="ig-dm-section-head">
                {dmTab === "一般" ? (
                  <>
                    <b>消息</b>
                    <button onClick={() => setDmTab("陌生讯息")}>陌生消息{requestDms.length > 0 && <i>{requestDms.length > 99 ? "99+" : requestDms.length}</i>}</button>
                  </>
                ) : (
                  <>
                    <button className="ig-dm-requests-back" onClick={() => setDmTab("一般")}><ArrowLeft size={17}/> 返回消息</button>
                    <b>陌生消息</b>
                    <span />
                  </>
                )}
              </div>
              <div className="ig-dm-list">
                {(dmTab === "一般" ? generalDms : requestDms).map((i) => {
                  const lastReply = sentMessages[i.id]?.slice(-1)[0];
                  return (
                    <button className="ig-dm-list-row" key={i.id} onClick={() => openPost(i)}>
                      <Avatar name={i.sender} src={i.avatar}/>
                      <span className="ig-dm-row-copy"><b>{i.sender}</b><small className={!i.read && !lastReply ? "unread" : ""}>{lastReply ? "你：" + lastReply : i.body}</small></span>
                      <span className="ig-dm-row-meta"><time>{i.time.slice(-5)}</time>{!i.read && !lastReply && <i aria-label="未讀訊息"/>}</span>
                    </button>
                  );
                })}
                {!(dmTab === "一般" ? generalDms : requestDms).length && <Blank/>}
              </div>
            </section>
          )}
          {!selected && tab === "搜索" && (
            <>
              <input
                className="mymy-search"
                aria-label="搜索Instagram"
                placeholder="搜索"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              {posts
                .filter((i) => (i.title + i.body + i.sender).includes(draft))
                .map(post)}
            </>
          )}
        </div>
        {!(selected?.folder === "私信") && <nav className="mymy-ig-nav">
          {[Home, Search, Send, User].map((Icon, n) => (
            <button
              key={n}
              aria-label={["主页", "搜索", "私信", "个人主页"][n]}
              aria-pressed={
                !selected && tab === ["主页", "搜索", "私信", "个人主页"][n]
              }
              onClick={() => {
                setSelected(null);
                setTab(["主页", "搜索", "私信", "个人主页"][n]);
              }}
            >
              <Icon />
            </button>
          ))}
        </nav>}
      </div>
      {sheet && (
        <div className="kzcs">
          <button
            className="kzbk"
            aria-label="关闭评论"
            onClick={() => setSheet(null)}
          />
          <section className="kzsh" role="dialog" aria-label="Instagram评论">
            <div className="mymy-sheet-handle" />
            <header>
              <b>评论</b>
              <button aria-label="关闭评论面板" onClick={() => setSheet(null)}>
                <X />
              </button>
            </header>
            <div className="mymy-comments">
              {[
                ...sheet.comments,
                ...replies
                  .filter((r) => r.startsWith(sheet.id + "\t"))
                  .map((r) => r.split("\t").slice(1).join("\t")),
              ].map((c, n) => (
                <p key={n}>
                  <Avatar name={c.split(":")[0]} />
                  {c}
                </p>
              ))}
            </div>
            <form
              className="cmb2"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) {
                  setReplies([...replies, sheet.id + "\t" + draft.trim()]);
                  setDraft("");
                }
              }}
            >
              <input
                aria-label="添加评论"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="添加评论"
                maxLength={500}
              />
              <button>发布</button>
            </form>
          </section>
        </div>
      )}
      {active && (
        <div
          className="mymy-story"
          onPointerDown={(e) => {
            const box = e.currentTarget.getBoundingClientRect();
            const next =
              e.clientX - box.left < box.width * 0.3 ? story - 1 : story + 1;
            setStory(next > stories.length ? 0 : Math.max(0, next));
          }}
        >
          <div className="mymy-story-bars">
            {stories.map((s, n) => (
              <i key={s.id} className={n < story ? "seen" : ""} />
            ))}
          </div>
          <header>
            <Avatar name={active.sender} src={active.avatar} />
            <b>{active.sender}</b>
            <button
              aria-label="关闭快拍"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setStory(0)}
            >
              <X />
            </button>
          </header>
          <Media item={active} />
          <p>{active.body}</p>
        </div>
      )}
    </div>
  );
}
export function MymyX(p: SkinProps) {
  const [dark, setDark] = useSkinState<boolean>(p, "x-dark", true);
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "推荐"),
    [likes, setLikes] = useSkinState<string[]>(p, "mymyXLikes", []),
    [reposts, setReposts] = useSkinState<string[]>(p, "mymyXReposts", []),
    [marks, setMarks] = useSkinState<string[]>(p, "mymyXMarks", []),
    [query, setQuery] = useState("");
  const isLiked = (id: string) =>
    typeof p.ui?.["liked-" + id] === "boolean"
      ? Boolean(p.ui["liked-" + id])
      : likes.includes(id);
  const isSaved = (id: string) =>
    typeof p.ui?.["saved-" + id] === "boolean"
      ? Boolean(p.ui["saved-" + id])
      : marks.includes(id);
  const toggle = (id: string, v: string[], set: (x: string[]) => void) =>
    set(v.includes(id) ? v.filter((x) => x !== id) : [...v, id]);
  return (
    <div
      className={"mymy-ui mymy-x " + (dark ? "x-reference-dark" : "")}
      data-mymy="twitter"
    >
      <div className="kzxw">
        <header className="kzxh">
          <button aria-label="关闭当前App" onClick={p.onBack}>
            <ArrowLeft />
          </button>
          <div className="kzxlg">𝕏</div>
          <button aria-label="切换X外观" onClick={() => setDark(!dark)}>
            <User />
          </button>
        </header>
        <div className="kzxtb">
          {["为你推荐", "正在关注", "添加 +", "时间"].map((t) => (
            <button
              className={t === tab ? "on" : ""}
              key={t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "搜索" && (
          <input
            className="mymy-search"
            aria-label="搜索X"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索"
          />
        )}
        <div className="kzxfd">
          {p.items
            .filter((i) => (i.title + i.body).includes(query))
            .map((i) => (
              <article className="kzxt" key={i.id}>
                <Avatar name={i.sender} src={i.avatar} />
                <div className="kzxb">
                  <div className="kzxn">
                    <b>{i.sender}</b>
                    <small>
                      @{i.meta.handle || "user"} · {i.time.slice(-5)}
                    </small>
                    <em>
                      <MoreHorizontal size={18} />
                    </em>
                  </div>
                  <button
                    className="kzxx"
                    onClick={() => {
                      read(p, i);
                      p.onItem(i);
                    }}
                  >
                    {i.body}
                  </button>
                  {i.media && (
                    <button
                      className="kzxv"
                      aria-label="打开媒体"
                      onClick={() => p.onItem(i)}
                    >
                      <Media item={i} />
                    </button>
                  )}
                  <div className="kzxac">
                    <button
                      aria-label={"评论" + i.title}
                      onClick={() => p.onItem(i)}
                    >
                      <MessageCircle />
                      {i.comments.length}
                    </button>
                    <button
                      aria-label={"转发" + i.title}
                      aria-pressed={reposts.includes(i.id)}
                      onClick={() => toggle(i.id, reposts, setReposts)}
                    >
                      <Repeat2 />
                      {reposts.includes(i.id) ? 1 : 0}
                    </button>
                    <button
                      aria-label={"点赞" + i.title}
                      aria-pressed={isLiked(i.id)}
                      onClick={() => {
                        toggle(i.id, likes, setLikes);
                        p.onUi?.("liked-" + i.id, !isLiked(i.id));
                      }}
                    >
                      <Heart fill={isLiked(i.id) ? "#f91880" : "none"} />
                      {i.likes + (isLiked(i.id) ? 1 : 0)}
                    </button>
                    <span>
                      <BarChart2 />
                      {i.meta.views || "—"}
                    </span>
                    <button
                      aria-label={"收藏" + i.title}
                      aria-pressed={isSaved(i.id)}
                      onClick={() => {
                        toggle(i.id, marks, setMarks);
                        p.onUi?.("saved-" + i.id, !isSaved(i.id));
                      }}
                    >
                      <Bookmark />
                    </button>
                    <button aria-label="分享" onClick={() => p.onItem(i)}>
                      <Share />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          {!p.items.length && <Blank />}
        </div>
        <nav className="kzxnav">
          {[Home, Search, Bell, MessageCircle].map((Icon, n) => (
            <button
              key={n}
              aria-label={["时间线", "搜索", "通知", "私信"][n]}
              onClick={() => n < 2 && setTab(n ? "搜索" : "推荐")}
              disabled={n > 1}
            >
              <Icon />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
