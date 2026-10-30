/* React/data adapters for dudwo5/Mymy UI templates: kt/ktn/KHD/bub,
 * igHome/igProfile/igDM/igSheet, xHome. See NOTICE.txt for permission.
 * Author content, DOM globals, timers and media dependencies are excluded. */
import { useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import type { SkinProps } from "../../AppSkins";
import { Avatar, Media } from "../../skins/shared";
import { useSkinState } from "../../skinState";
import type { Item } from "../../schema";
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
    [sent, setSent] = useSkinState<string[]>(p, "mymyKktSent", []),
    [query, setQuery] = useState(""),
    [showChoices, setShowChoices] = useState(false),
    [menu, setMenu] = useState(false);
  const contacts = [
    { name: "周安信", file: "周安信-kakao.png" },
    { name: "张家豪", file: "張家豪-kakao.png" },
    { name: "李理悟", file: "李理悟-kakao.jpg" },
    { name: "李相沅", file: "李相沅-kakao.png" },
    { name: "贺鑫隆", file: "賀鑫隆-kakao.png" },
    { name: "郑相炫", file: "鄭相炫-kakao.png" },
    { name: "金俊抒", file: "金俊抒-kakao.png" },
    { name: "金虔佑", file: "金虔佑-kakao.png" },
  ].map((person) => ({ ...person, avatar: import.meta.env.BASE_URL + "kakao/" + person.file })),
    isTestItem = (item: Item) => /测试|test/i.test([item.title, item.sender, item.body, item.folder, ...Object.values(item.meta ?? {})].join(" ")),
    chatItems = p.items.filter((item) => !isTestItem(item)),
    memberAvatar = (name: string, saved = "") => contacts.find((person) => person.name === name)?.avatar || saved,
    messages: Item[] = chatItems.filter((item) => item.title === p.thread),
    scroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = scroll.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [p.thread, messages.length]);
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
          <div className="msgs kk" ref={scroll} onClick={() => setShowChoices(true)}>
            {messages.map((m, i) => {
              const run = messageRun(messages, i);
              return (
                <div
                  key={m.id}
                  className={
                    "kzm " +
                    (m.outgoing ? "kzmy" : "kzot") +
                    (run.first ? " first" : "")
                  }
                >
                  {!m.outgoing && run.first && (
                    <>
                      <div className="kzmav">
                        <span
                          className="catalog-avatar kzka round"
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
                            src={memberAvatar(p.thread, memberAvatar(m.sender, m.avatar))}
                            alt={p.thread}
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              display: "block",
                              borderRadius: "50%",
                            }}
                          />
                        </span>
                      </div>
                      <div className="kzmn">{m.sender}</div>
                    </>
                  )}
                  {m.outgoing && run.last && (
                    <span className="kzt">
                      {m.meta.unread || ""}
                      <br />
                      {m.time.slice(-5)}
                    </span>
                  )}
                  <button
                    className={"kzbub" + (m.media ? " kzimg" : "")}
                    onClick={() => m.meta.local !== "true" && read(p, m)}
                  >
                    {m.media ? <Media item={m} /> : m.body}
                  </button>
                  {!m.outgoing && run.last && (
                    <span className="kzt">{m.time.slice(-5)}</span>
                  )}
                </div>
              );
            })}
            {!messages.length && <Blank />}
          </div>
          {((p.thread === p.selectedBoyfriend && p.selectedBoyfriend) || (p.thread === p.selectedFriend && p.selectedFriend)) && (
            <div className="kzinp" style={{ height: "auto", minHeight: 58, padding: "10px 14px", flexWrap: "wrap" }}>
              {showChoices ? (
                <button type="button" className="go" style={{ borderRadius: 18, padding: "10px 16px", width: "100%", whiteSpace: "normal" }}
                  onClick={() => {
                    const boyfriend = p.thread === p.selectedBoyfriend;
                    p.onKakaoChoice?.(p.thread, boyfriend ? "看到了，怎么办？" : "不好，我好害怕", boyfriend ? "你的身份好像已经被扒出来了" : "你先别紧张，他已经在和公司开会了");
                    setShowChoices(false);
                  }}>
                  {p.thread === p.selectedBoyfriend ? "看到了，怎么办？" : "不好，我好害怕"}
                </button>
              ) : (
                <button type="button" onClick={() => setShowChoices(true)} style={{ width: "100%", color: "inherit" }}>
                  <Smile size={22} /> 点击选择回复
                </button>
              )}
            </div>
          )}
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
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            display: "block",
                          }}
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
                    const latest = chatItems.filter((item) => item.title === title).at(-1)!;
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
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              display: "block",
                              borderRadius: "50%",
                            }}
                          />
                        </span>
                        <span className="kzkn">
                          <b>{title}</b>
                          <small>{latest.body}</small>
                        </span>
                        <time>{latest.time.slice(-5)}</time>
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
    [pop, setPop] = useState("");
  const posts = p.items.filter(
      (i) => i.folder !== "私信" && i.meta.story !== "true",
    ),
    stories = p.items.filter((i) => i.meta.story === "true"),
    dms = p.items.filter((i) => i.folder === "私信"),
    active = stories[story - 1];
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
        <header className="igh">
          <button
            aria-label={selected ? "返回Instagram动态" : "关闭当前App"}
            onClick={() => (selected ? setSelected(null) : p.onBack())}
          >
            <ArrowLeft />
          </button>
          <span className="igl2">
            {selected ? "帖子" : tab === "主页" ? "Instagram" : tab}
          </span>
          <button aria-label="打开私信" onClick={() => setTab("私信")}>
            <Send />
          </button>
        </header>
        <div className="igb">
          {selected && post(selected)}
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
            <>
              {dms.map((i) => (
                <button className="kzkr" key={i.id} onClick={() => openPost(i)}>
                  <Avatar name={i.sender} src={i.avatar} />
                  <span className="kzkn">
                    <b>{i.title}</b>
                    <small>{i.body}</small>
                  </span>
                </button>
              ))}
              {!dms.length && <Blank />}
            </>
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
        <nav className="mymy-ig-nav">
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
        </nav>
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
