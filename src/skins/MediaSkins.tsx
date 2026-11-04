import { AudioPlayer, useTrack } from "../audio";
import { useSkinState } from "../skinState";
import {
  Bookmark,
  Check,
  Compass,
  Heart,
  Home,
  MessageCircle,
  Music,
  Play,
  Plus,
  Search,
  SkipForward,
  User,
  Users,
  Video,
} from "lucide-react";
import { useState } from "react";
import { safeMedia, type Item } from "../schema";
import {
  Avatar,
  Empty,
  groupItems,
  Header,
  Media,
  meta,
  SearchBox,
  Tabs,
  useContent,
  type Props,
} from "./shared";
function TrackPlayer({
  item,
  p,
  onNext,
}: {
  item: Item;
  p: Props;
  onNext: () => void;
}) {
  return (
    <div className="track-player">
      <button onClick={() => p.onItem(item)}>
        <Music size={20} />
        <span>
          {item.title}
          <small>{item.sender}</small>
        </span>
      </button>
      {item.kind === "audio" && safeMedia(item.media) ? (
        <AudioPlayer p={p} item={item} />
      ) : (
        <button onClick={() => p.onItem(item)}>查看</button>
      )}
      <button aria-label="下一首" onClick={onNext}>
        <SkipForward size={19} />
      </button>
    </div>
  );
}
const SPOTIFY_BASE = import.meta.env.BASE_URL;
const ALD1_RELEASES = [
  {
    id: "talk-to-me",
    title: "Talk to me",
    date: "2026/10/22",
    kind: "單曲",
    cover: "",
    spotifyUrl: "",
    tracks: [
      ["Talk to me", "2:36"],
      ["Talk to me (Dance Break Ver.)", "2:51"],
      ["Talk to me (Instrumental)", "2:36"],
    ],
  },
  {
    id: "unbreakable",
    title: "UNBREAKABLE : 少年BEAST",
    date: "2026/08/24",
    kind: "迷你專輯",
    cover: "ald1-spotify/unbreakable.webp",
    spotifyUrl: "https://open.spotify.com/album/630xDApcVnwfx60F1s4Srn",
    tracks: [
      ["BORN DIRE", "2:42"],
      ["Diamond Hour", "2:49"],
      ["One More Time", "3:02"],
      ["Talk to me", "2:36"],
      ["OMG!", "2:24"],
      ["Good Life", "3:00"],
      ["WELCOME home", "2:29"],
    ],
  },
  {
    id: "agent-kim-ost",
    title: "Agent Kim Reactivated, Pt. 1 (Original Soundtrack)",
    date: "2026/06/26",
    kind: "原聲帶單曲",
    cover: "ald1-spotify/agent-kim-ost.webp",
    spotifyUrl: "https://open.spotify.com/album/1DDfQfHYYHQuLG23Z6EtdA",
    tracks: [
      ["GO! GO! (Agent Kim Reactivated : Original Television Soundtrack)", "3:05"],
      ["GO! GO! (Agent Kim Reactivated : Original Television Soundtrack) (Instrumental)", "3:05"],
    ],
  },
  {
    id: "no-school-tomorrow",
    title: "No School Tomorrow",
    date: "2026/05/26",
    kind: "單曲",
    cover: "ald1-spotify/no-school-tomorrow.webp",
    spotifyUrl: "https://open.spotify.com/album/65vrCYeYYfKhk6Q8e1rAvS",
    tracks: [
      ["OMG!", "2:24"],
      ["Good Life", "3:00"],
    ],
  },
  {
    id: "euphoria",
    title: "EUPHORIA",
    date: "2026/01/12",
    kind: "迷你專輯",
    cover: "ald1-spotify/euphoria.webp",
    spotifyUrl: "https://open.spotify.com/album/5nefAD1EsXbLksNfBJorPV",
    tracks: [
      ["FORMULA", "3:08"],
      ["FREAK ALARM", "3:08"],
      ["Raw Flame", "3:02"],
      ["Chains", "3:17"],
      ["Never Been 2 Heaven", "3:26"],
      ["Cinnamon Shake", "2:55"],
    ],
  },
  {
    id: "formula",
    title: "FORMULA",
    date: "2025/12/03",
    kind: "單曲",
    cover: "",
    spotifyUrl: "",
    tracks: [["FORMULA", "3:08"]],
  },
] as const;

export function SpotifySkin(p: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const selected = ALD1_RELEASES.find((release) => release.id === selectedId);
  const releases = ALD1_RELEASES.filter((release) =>
    release.title.toLowerCase().includes(query.toLowerCase()) ||
    release.tracks.some(([title]) => title.toLowerCase().includes(query.toLowerCase())),
  );
  const coverUrl = (path: string) =>
    path ? `${SPOTIFY_BASE}${path}` : `${SPOTIFY_BASE}spotify-default-cover.svg`;

  return (
    <div className="catalog-skin spotify-ui ald1-spotify">
      <Header p={p} />
      <div className="catalog-scroll ald1-spotify-scroll">
        {selected ? (
          <>
            <button className="ald1-spotify-back" onClick={() => { setSelectedId(null); setSelectedTrack(null); }}>
              <span aria-hidden="true">‹</span> 返回 ALPHA DRIVE ONE
            </button>
            <div className="ald1-spotify-album-hero">
              <img src={coverUrl(selected.cover)} alt={selected.title + " 專輯封面"} />
              <div>
                <small>{selected.kind}</small>
                <h1>{selected.title}</h1>
                <strong>ALPHA DRIVE ONE</strong>
                <small>{selected.date.replaceAll("/", ".")} · {selected.tracks.length} 首歌曲</small>
              </div>
            </div>
            <div className="ald1-spotify-album-actions">
              <span>專輯</span>
              <button type="button" aria-label="播放按鈕（僅介面示意，不播放音樂）" onClick={() => setSelectedTrack(selectedTrack === "all" ? null : "all")}>
                {selectedTrack === "all" ? "Ⅱ" : "▶"}
              </button>
            </div>
            <div className="ald1-spotify-track-list">
              {selected.tracks.map(([title, duration], index) => (
                <div className="ald1-spotify-track" key={title}>
                  <button className="ald1-spotify-track-info" type="button" onClick={() => setSelectedTrack(selectedTrack === title ? null : title)}>
                    <span className="ald1-spotify-track-index">{selectedTrack === title ? "Ⅱ" : index + 1}</span>
                    <span><strong>{title}</strong><small>ALPHA DRIVE ONE</small></span>
                  </button>
                  <small>{duration}</small>
                  <button className="ald1-spotify-track-play" type="button" aria-label={title + " 播放按鈕（無聲）"} onClick={() => setSelectedTrack(selectedTrack === title ? null : title)}>▶</button>
                </div>
              ))}
            </div>
            <p className="ald1-spotify-footnote">播放控制僅供介面展示，不會載入或播放音訊。</p>
            {selected.spotifyUrl && <a className="ald1-spotify-external" href={selected.spotifyUrl} target="_blank" rel="noreferrer">在 Spotify 查看此發行作品 ↗</a>}
          </>
        ) : (
          <>
            <div className="ald1-spotify-artist-hero">
              <img src={`${SPOTIFY_BASE}ald1-avatar.jpg`} alt="ALPHA DRIVE ONE 團體照片" />
              <div className="ald1-spotify-artist-overlay">
                <small>藝人</small>
                <h1>ALPHA DRIVE ONE</h1>
                <span>ALD1 · 2026</span>
              </div>
            </div>
            <div className="ald1-spotify-artist-summary">
              <div><strong>ALPHA DRIVE ONE</strong><small>官方音樂作品</small></div>
              <button type="button" aria-label="播放按鈕（僅介面示意）" onClick={() => setSelectedTrack(selectedTrack === "artist" ? null : "artist")}>{selectedTrack === "artist" ? "Ⅱ" : "▶"}</button>
            </div>
            <div className="ald1-spotify-section-heading"><h2>發行作品</h2><span>按發行日期排序</span></div>
            <label className="ald1-spotify-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋專輯或歌曲" /></label>
            <div className="ald1-spotify-release-list">
              {releases.map((release) => (
                <button className="ald1-spotify-release" key={release.id} onClick={() => { setSelectedId(release.id); setSelectedTrack(null); }}>
                  <img src={coverUrl(release.cover)} alt={release.title + " 專輯封面"} />
                  <span><strong>{release.title}</strong><small>{release.date.replaceAll("/", ".")} · {release.kind} · {release.tracks.length} 首歌曲</small></span>
                  <span className="ald1-spotify-release-chevron">›</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="ald1-spotify-bottom-nav"><span className={!selected ? "active" : ""}>⌂<small>首頁</small></span><span>⌕<small>搜尋</small></span><span>▤<small>音樂庫</small></span></div>
    </div>
  );
}

export function NeteaseSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "发现");
  const [folder, setFolder] = useState(""),
    [track, setTrack] = useTrack(p, items);
  const list = folder
    ? items.filter((i) => (i.folder || "我的歌单") === folder)
    : items;
  return (
    <div className="catalog-skin netease-ui">
      <Header p={p} />
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {tab === "发现" ? (
          <>
            <div className="netease-feature">
              <Music size={44} />
              <h2>推荐歌单</h2>
            </div>
            <div className="netease-shelves">
              {groupItems(items, "我的歌单").map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setFolder(g);
                    setTab("我的");
                  }}
                >
                  <Music size={33} />
                  <strong>{g}</strong>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="netease-profile">
              <Avatar name={p.owner ?? "我"} />
              <h2>{p.owner ?? "我的音乐"}</h2>
            </div>
            <h3>{folder || "我的歌单"}</h3>
          </>
        )}
        {list.map((i, n) => (
          <div className="netease-track" key={i.id}>
            <button
              onClick={() => {
                setTrack(i);
              }}
            >
              <span>{n + 1}</span>
              <div>
                <strong>{i.title}</strong>
                <small>
                  {i.sender} · {meta(i, "album")}
                </small>
              </div>
            </button>
            <button
              aria-label={`歌曲详情${i.title}`}
              onClick={() => p.onItem(i)}
            >
              <MessageCircle size={18} />
            </button>
          </div>
        ))}
        <Empty items={list} />
      </div>
      {track && (
        <TrackPlayer
          item={track}
          p={p}
          onNext={() =>
            setTrack(
              items[
                (items.findIndex((i) => i.id === track.id) + 1) % items.length
              ],
            )
          }
        />
      )}
      <Tabs
        tabs={["发现", "我的"]}
        value={tab}
        set={(t) => {
          setTab(t);
          setFolder("");
        }}
        icons={[<Compass />, <Music />]}
      />
    </div>
  );
}
export function YouTubeSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "首页");
  const [category, setCategory] = useState("全部");
  const list = items.filter((i) =>
    tab === "Shorts"
      ? i.folder === "Shorts"
      : tab === "订阅"
        ? i.folder === "订阅"
        : tab === "播放列表"
          ? i.favorite || i.folder === "播放列表"
          : category === "全部" || i.folder === category,
  );
  return (
    <div className="catalog-skin youtube-ui">
      <Header p={p} />
      <SearchBox value={q} set={setQ} />
      <div className="youtube-chips">
        {["全部", ...groupItems(items).filter((g) => g !== "未分类")].map(
          (g) => (
            <button
              className={category === g ? "selected" : ""}
              key={g}
              onClick={() => setCategory(g)}
            >
              {g}
            </button>
          ),
        )}
      </div>
      <div className="catalog-scroll">
        <div className={tab === "Shorts" ? "youtube-shorts" : "youtube-videos"}>
          {list.map((i) => (
            <article key={i.id}>
              <button className="youtube-thumb" onClick={() => p.onItem(i)}>
                <Media item={i} />
                {meta(i, "duration") && <time>{meta(i, "duration")}</time>}
              </button>
              <button className="youtube-byline" onClick={() => p.onItem(i)}>
                <Avatar name={i.sender} />
                <div>
                  <strong>{i.title}</strong>
                  <small>
                    {i.sender} · {meta(i, "views", "—")} 次播放
                  </small>
                </div>
              </button>
            </article>
          ))}
        </div>
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["首页", "Shorts", "订阅", "播放列表"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Video />, <Users />, <User />]}
      />
    </div>
  );
}
export function BilibiliSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "首页");
  const [category, setCategory] = useState("推荐");
  const list =
    tab === "历史"
      ? items.filter((i) => i.folder === "历史")
      : tab === "动态"
        ? items.filter((i) => i.folder === "动态")
        : category === "推荐"
          ? items
          : items.filter((i) => i.folder === category);
  return (
    <div className="catalog-skin bilibili-ui">
      <Header p={p} />
      <div className="bili-search">
        <Avatar name={p.owner ?? "我"} />
        <SearchBox value={q} set={setQ} />
      </div>
      <div className="bili-categories">
        {["推荐", "动画", "音乐", "生活"].map((c) => (
          <button
            key={c}
            className={category === c ? "selected" : ""}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="catalog-scroll">
        <div className="bili-grid">
          {list.map((i) => (
            <button key={i.id} onClick={() => p.onItem(i)}>
              <div>
                <Media item={i} />
                <small>
                  <Play size={10} />
                  {meta(i, "views", "—")}
                  <time>{meta(i, "duration")}</time>
                </small>
              </div>
              <strong>{i.title}</strong>
              <span>UP · {i.sender}</span>
            </button>
          ))}
        </div>
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["首页", "动态", "历史"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <MessageCircle />, <User />]}
      />
    </div>
  );
}
function VerticalVideo({ p, item }: { p: Props; item: Item }) {
  const [liked, setLiked] = useSkinState<boolean>(p, `liked-${item.id}`, false),
    [saved, setSaved] = useSkinState<boolean>(p, `saved-${item.id}`, false);
  return (
    <article className="vertical-video">
      <Media item={item} />
      <div className="vertical-actions">
        <button
          aria-label={`作者${item.sender}`}
          onClick={() => p.onItem(item)}
        >
          <Avatar name={item.sender} />
        </button>
        <button
          aria-label={`喜欢${item.title}`}
          onClick={() => setLiked(!liked)}
        >
          <Heart size={29} fill={liked ? "#f44368" : "white"} />
          <small>{item.likes + (liked ? 1 : 0)}</small>
        </button>
        <button aria-label={`评论${item.title}`} onClick={() => p.onItem(item)}>
          <MessageCircle size={29} />
          <small>{item.comments.length}</small>
        </button>
        <button
          aria-label={`收藏${item.title}`}
          onClick={() => setSaved(!saved)}
        >
          <Bookmark size={27} fill={saved ? "#f8cc55" : "none"} />
        </button>
      </div>
      <button className="vertical-caption" onClick={() => p.onItem(item)}>
        <strong>@{item.sender}</strong>
        <p>{item.body}</p>
        <small>
          <Music size={11} />
          {item.title}
        </small>
      </button>
    </article>
  );
}
export function DouyinSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "推荐");
  const list = tab === "推荐" ? items : items.filter((i) => i.folder === tab);
  return (
    <div className="catalog-skin douyin-ui">
      <Header p={p} />
      <div className="douyin-top">
        {["同城", "关注", "推荐"].map((t) => (
          <button
            className={tab === t ? "selected" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="vertical-feed">
        {list.map((i) => (
          <VerticalVideo key={i.id} p={p} item={i} />
        ))}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["推荐", "关注", "我"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />, <User />]}
      />
    </div>
  );
}
export function TikTokSkin(p: Props) {
  const { tab, setTab, items } = useContent(p, "For You");
  const list =
    tab === "For You"
      ? items
      : tab === "Following"
        ? items.filter((i) => i.folder === "关注" || i.folder === "Following")
        : items.filter((i) => i.folder === "个人主页");
  return (
    <div className="catalog-skin tiktok-ui">
      <Header p={p} />
      <div className="tiktok-top">
        <button
          className={tab === "Following" ? "selected" : ""}
          onClick={() => setTab("Following")}
        >
          Following
        </button>
        <button
          className={tab === "For You" ? "selected" : ""}
          onClick={() => setTab("For You")}
        >
          For You
        </button>
      </div>
      <div className="vertical-feed">
        {list.map((i) => (
          <VerticalVideo key={i.id} p={p} item={i} />
        ))}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["For You", "Following", "Profile"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Users />, <User />]}
      />
    </div>
  );
}
export function NetflixSkin(p: Props) {
  const { tab, setTab, q, setQ, items } = useContent(p, "首页");
  const [saved, setSaved] = useSkinState<string[]>(p, "saved", []);
  const list =
    tab === "我的片单"
      ? items.filter((i) => i.favorite || saved.includes(i.id))
      : items;
  const featured = list[0];
  return (
    <div className="catalog-skin netflix-ui">
      <Header p={p} />
      <div className="catalog-scroll">
        <SearchBox value={q} set={setQ} />
        {featured && tab === "首页" && (
          <div className="netflix-feature">
            <Media item={featured} />
            <div>
              <strong>{featured.title}</strong>
              <small>
                {meta(featured, "year")} · {meta(featured, "genre")} ·{" "}
                {meta(featured, "duration")}
              </small>
              <button onClick={() => p.onItem(featured)}>
                <Play size={16} />
                播放 / 详情
              </button>
              <button
                onClick={() =>
                  setSaved(
                    saved.includes(featured.id)
                      ? saved.filter((id) => id !== featured.id)
                      : [...saved, featured.id],
                  )
                }
              >
                {saved.includes(featured.id) ? (
                  <Check size={16} />
                ) : (
                  <Plus size={16} />
                )}
                我的片单
              </button>
            </div>
          </div>
        )}
        {groupItems(list, "影片").map((g) => (
          <section className="netflix-shelf" key={g}>
            <h3>{g}</h3>
            <div>
              {list
                .filter((i) => (i.folder || "影片") === g)
                .map((i) => (
                  <button key={i.id} onClick={() => p.onItem(i)}>
                    <Media item={i} />
                    <strong>{i.title}</strong>
                  </button>
                ))}
            </div>
          </section>
        ))}
        <Empty items={list} />
      </div>
      <Tabs
        tabs={["首页", "我的片单"]}
        value={tab}
        set={setTab}
        icons={[<Home />, <Bookmark />]}
      />
    </div>
  );
}

