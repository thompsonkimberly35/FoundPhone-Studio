import { StatusGlyph } from "./ios/StatusGlyph";
import { SocialDetail, socialDetailApps } from "./skins/SocialDetails";
import { NativeCalculator } from "./ios/Calculator";
import { HomeLauncher } from "./launcher/HomeLauncher";
import { useDeviceLayout } from "./launcher/layout";
import "./launcher/launcher.css";
import { NativeDetail, nativeDetailApps } from "./ios/Details";
import "./ios/details.css";
import { SystemNotifications } from "./SystemNotifications";
import { GlobalNotificationBanner } from "./GlobalNotificationBanner";
import "./global-notifications.css";
import {
  readLauncherOrigin,
  AppWindow,
  screenOrigin,
} from "./vendor/ios-web/Launcher";
import {
  DeviceLock,
  ControlCenter,
  DeviceKeyboard,
  KeyboardContext,
  NativeSettings,
} from "./DeviceSystem";
import { AppArtwork, hasNativeArtwork } from "./AppArtwork";
import { getFields } from "./fields";
import { catalogSkins } from "./skins/catalog";
import "./skins/skins.css";
import "./ios18.css";
import "./device-system.css";
import "./ios/tokens.css";
import "./ios/reference.css";
import "./ios/status-bar.css";
import { WeChatSkin, WhatsAppSkin } from "./AppSkins";
import { RichText } from "./RichText";
import { getBoyfriendStage2Node, getBoyfriendStage2Choice, STAGE2_X001, STAGE2_X002, STAGE2_X003 } from "./kakaoBoyfriendStage2";
import {
  useEffect,
  useState,
  useRef,
  Suspense,
  type CSSProperties,
} from "react";
import { AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Plus,
  Search,
  LockKeyhole,
  Heart,
  MessageCircle,
  MoreHorizontal,
  ArrowUp,
  Folder,
  Phone as PhoneIcon,
  Instagram,
} from "lucide-react";
import { getApp, type AppPlugin } from "./registry";
import {
  initialRuntime,
  safeMedia,
  type Work,
  type Item,
  type Runtime,
  type UiValue,
} from "./schema";
import { makeItem } from "./schema";
import { dispatch, choose, visible, advance } from "./engine";
import { db } from "./persistence";
import { createInstagramBacklash } from "./instagramBacklash";
import { makeThreadsBacklash, type InstagramReplyEvidence, hasThreadsX002 } from "./threadsBacklash";
import { enqueueIncomingKakaoNotifications } from "./kakaoNotifications";
import { ensureJapanLotteryMail } from "./mail";
import { MailApp } from "./MailApp";
import { getKakaoStoryChoice, getKakaoStoryNode } from "./kakaoRomanceStory";
import { getFriendStoryChoice, getFriendStoryNode } from "./kakaoFriendStory";
import { getFriendPhase2Node, getFriendPhase2Opening } from "./kakaoFriendStoryPhase2";
import { ALD1_SECRET_ADMIRER_MEMBERS, chooseSecretAdmirer, getSecretAdmirerChoice, getSecretAdmirerNode, memberIdForName } from "./kakaoSecretAdmirer";
import { chooseTeamConflictMember, getTeamConflictChoice, getTeamConflictNode } from "./kakaoTeamConflictStory";
import { formatGameTime, migrateRuntimeGameClock, normalizeStoryItems, stampNewMessages } from "./gameClock";
const PLAYER_THREADS_ID = "allyz_1101";
const isTestContentItem = (item: Item) =>
  /测试|(?:^|[\s_-])(test|demo|sample)(?:$|[\s_-])/i.test(
    [item.id, item.title, item.sender, item.body, item.folder, ...Object.values(item.meta ?? {})].join(" "),
  );

const boyfriendAvatarPath = (name: string) => {
  const files: Record<string, string> = {
    "周安信": "周安信-kakao.png", "张家豪": "張家豪-kakao.png",
    "李理悟": "李理悟-kakao-v2.jpg", "李相沅": "李相沅-kakao.png",
    "贺鑫隆": "賀鑫隆-kakao.png", "郑相炫": "鄭相炫-kakao.png",
    "金俊抒": "金俊抒-kakao.png", "金虔佑": "金虔佑-kakao.png",
  };
  return files[name] ? import.meta.env.BASE_URL + "kakao/" + files[name] : "";
};

export function AppIcon({
  id,
  name,
  small = false,
  custom = "",
  date,
  time,
}: {
  id: string;
  name?: string;
  small?: boolean;
  custom?: string;
  date?: string;
  time?: string;
}) {
  const a = getApp(id);
  const Icon = a.icon;
  return (
    <span className={`app-icon-wrap ${small ? "small" : ""}`}>
      <span className="app-icon" style={{ background: a.color }}>
        {custom ? (
          safeMedia(custom) ? (
            <img src={safeMedia(custom)} alt="自定义图标" />
          ) : (
            <span>{custom.slice(0, 2)}</span>
          )
        ) : hasNativeArtwork(id) ? (
          <AppArtwork id={id} date={date} time={time} />
        ) : (
          <Icon size={small ? 21 : 28} strokeWidth={1.65} />
        )}
      </span>
      {name && <span className="app-name">{name}</span>}
    </span>
  );
}
type PhoneProps = Omit<Parameters<typeof PhoneRuntime>[0], "deviceLayout">;
export function Phone(props: PhoneProps) {
  const deviceLayout = useDeviceLayout(props.work, props.creator);
  return (
    <PhoneRuntime
      {...props}
      work={deviceLayout.work}
      deviceLayout={deviceLayout}
    />
  );
}
function PhoneRuntime({
  deviceLayout,
  work,
  creator = false,
  onEdit,
  onAdd,
  onSettings,
  onOpen,
  runtime: external,
  onRuntime,
  selectedBoyfriend = "",
  selectedFriend = "",
  onSaveProgress,
  onRestartGame,
  savedAt,
}: {
  deviceLayout: ReturnType<typeof useDeviceLayout>;
  work: Work;
  creator?: boolean;
  onEdit?: (app: string, item: Item) => void;
  onAdd?: (app: string) => void;
  onSettings?: () => void;
  onOpen?: (app: string) => void;
  runtime?: Runtime;
  onRuntime?: (s: Runtime) => void;
  selectedBoyfriend?: string;
  selectedFriend?: string;
  onSaveProgress?: (state: Runtime) => Promise<string>;
  onRestartGame?: () => Promise<void>;
  savedAt?: string;
}) {
  const [app, setApp] = useState("");
  const [homeRequest, setHomeRequest] = useState(0);
  const [locked, setLocked] = useState(!creator);
  const [pinOpen, setPinOpen] = useState(false);
  const [quickCamera, setQuickCamera] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const appSnapshots = useRef(new Map<string, HTMLElement>());
  const [globalNotificationItem, setGlobalNotificationItem] = useState<Item | null>(null);
  const [igQueue, setIgQueue] = useState<Item[]>([]);
  const [igBanner, setIgBanner] = useState<Item | null>(null);
  const [contextApp, setContextApp] = useState("");
  const [deviceScale, setDeviceScale] = useState(0.84);
  const shell = useRef<HTMLDivElement>(null);
  const gesture = useRef({ x: 0, y: 0, time: 0, zone: "" });
  const [launchOrigin, setLaunchOrigin] = useState(screenOrigin);

  const beginUnlock = () => {
    setPinError("");
    setQuickCamera(false);
    if (work.phone.passcode) setPinOpen(true);
    else unlock();
  };
  const pressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const gestureConsumed = useRef(false);
  const [pinError, setPinError] = useState("");
  const [folder, setFolder] = useState("");
  const [panel, setPanel] = useState("");
  const [own, setOwn] = useState(() => initialRuntime(work));
  const [ready, setReady] = useState(creator || !!external);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    const el = shell.current;
    if (!el) return;
    const fit = () => {
      setDeviceScale(
        Math.max(
          0.4,
          Math.min(
            1,
            (el.parentElement!.clientWidth - 24) / 407,
            (window.innerHeight - (creator ? 170 : external ? 150 : 40)) / 866,
          ),
        ),
      );
    };
    const observer = new ResizeObserver(fit);
    observer.observe(el.parentElement!);
    window.addEventListener("resize", fit);
    fit();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [creator, ready]);
  const s = external ?? own;
  const runtimeRef = useRef(s);
  runtimeRef.current = s;
  const globalNotificationQueue = String(s.ui?.kakao?.["global-notification-queue"] || "[]");
  let hasPendingKakaoNotification = false;
  try {
    hasPendingKakaoNotification = (JSON.parse(globalNotificationQueue) as Item[]).length > 0;
  } catch {
    hasPendingKakaoNotification = false;
  }
  const activeKakaoThread = useRef("");
  const previousApp = useRef(app);
  const [targetKakaoThread, setTargetKakaoThread] = useState("");
  const [targetXPostId, setTargetXPostId] = useState("");
  const [targetThreadsPostId, setTargetThreadsPostId] = useState("");
  const [targetThreadsReplyId, setTargetThreadsReplyId] = useState("");
  useEffect(() => {
    if (previousApp.current === "kakao" && app !== "kakao") activeKakaoThread.current = "";
    previousApp.current = app;
  }, [app]);
  const update = (next: Runtime) => {
    const previous = runtimeRef.current;
    let committed = stampNewMessages(previous, next);
    if (committed.gameClock) committed = { ...committed, gameClock: { ...committed.gameClock, lastRealTimestamp: Date.now() } };
    const x002Published = hasThreadsX002(committed.messages.twitter ?? []);
    const x002WasPublished = hasThreadsX002(previous.messages.twitter ?? []);
    if (x002Published && !x002WasPublished) {
      committed = {
        ...committed,
        messages: {
          ...committed.messages,
          threads: (committed.messages.threads ?? []).map((post) =>
            ["T029", "T030"].includes(String(post.meta?.postId))
              ? { ...post, hidden: false, unlock: "" }
              : post.meta?.postId === "T025" && x002Published
                ? { ...post, hidden: false, unlock: "" }
                : post,
          ),
        },
      };
    }
    if (!creator) {
      const previousThreadsUi = previous.ui?.threads ?? {};
      const nextThreadsUi = committed.ui?.threads ?? {};
      const parseReplies = (value: unknown): Array<{id:string;postId:string;handle:string;text:string;deliveredAt:number|null}> => {
        try { const parsed = JSON.parse(String(value || "[]")); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
      };
      const previousFanReplies = parseReplies(previousThreadsUi["threads-fan-replies-v1"]);
      const nextFanReplies = parseReplies(nextThreadsUi["threads-fan-replies-v1"]);
      const newlyDelivered = nextFanReplies.filter(reply =>
        reply.deliveredAt !== null && !previousFanReplies.some(old => old.id === reply.id && old.deliveredAt !== null)
      );
      if (newlyDelivered.length) {
        const kakaoUi = committed.ui?.kakao ?? {};
        let globalQueue: Item[] = [];
        try { globalQueue = JSON.parse(String(kakaoUi["global-notification-queue"] || "[]")); } catch { globalQueue = []; }
        const existingIds = new Set(globalQueue.map(item => item.id));
        const notices = newlyDelivered.map(reply => makeItem({
          id: "threads-fan-notice-" + reply.id,
          title: "Threads",
          sender: reply.handle,
          body: reply.text,
          time: formatGameTime(reply.deliveredAt || committed.gameClock?.currentGameTimestamp || Date.now(), committed.gameClock?.timezone || "Asia/Seoul"),
          meta: { notificationAppId: "threads", notificationPostId: reply.postId, notificationReplyId: reply.id },
        })).filter(item => !existingIds.has(item.id));
        if (notices.length) {
          committed = { ...committed, ui: { ...committed.ui, kakao: { ...kakaoUi, "global-notification-queue": JSON.stringify([...globalQueue, ...notices].slice(-100)) } } };
        }
      }
      const kakaoUi = committed.ui?.kakao ?? {};
      let seenIds: string[] = [];
      let queued: Item[] = [];
      try { seenIds = JSON.parse(String(kakaoUi["global-notification-seen-ids"] || "[]")); } catch { seenIds = []; }
      try { queued = JSON.parse(String(kakaoUi["global-notification-queue"] || "[]")); } catch { queued = []; }
      const result = enqueueIncomingKakaoNotifications(
        previous.messages.kakao ?? [],
        committed.messages.kakao ?? [],
        seenIds,
        queued,
        app === "kakao" ? activeKakaoThread.current : "",
        work.phone.notifications,
      );
      const notificationQueue = app === "kakao"
        ? result.queue.filter(item => String(item.meta?.notificationAppId || "kakao") !== "kakao")
        : result.queue;
      if (result.arrivals.length) {
        committed = {
          ...committed,
          ui: {
            ...committed.ui,
            kakao: {
              ...kakaoUi,
              "global-notification-seen-ids": JSON.stringify(result.seenIds),
              "global-notification-queue": JSON.stringify(notificationQueue),
            },
          },
        };
      }
    }
    runtimeRef.current = committed;
    setOwn(committed);
    onRuntime?.(committed);
  };
  useEffect(() => {
    if (creator || !ready) return;
    const current = runtimeRef.current;
    const seeded = ensureJapanLotteryMail(current);
    if (seeded !== current) update(seeded);
  }, [creator, ready, work.id, work.updatedAt, external]);
  useEffect(() => {
    if (creator || !ready) return;
    const current = runtimeRef.current;
    const cleanedMessages = Object.fromEntries(
      Object.entries(current.messages).map(([appId, list]) => [
        appId,
        (list ?? []).filter((item) => !isTestContentItem(item)),
      ]),
    ) as Runtime["messages"];
    const changed = Object.entries(current.messages).some(([appId, list]) =>
      (list ?? []).length !== (cleanedMessages[appId as keyof Runtime["messages"]] ?? []).length,
    );
    if (changed) update({ ...current, messages: cleanedMessages });
  }, [creator, ready, s.messages]);
  useEffect(() => {
    if (app !== "instagram" || !igQueue.length) return;
    const current = runtimeRef.current;
    const currentUi = current.ui?.kakao || {};
    update({ ...current, ui: { ...current.ui, kakao: { ...currentUi, "ig-backlash-notification-index": 60, "ig-backlash-notifications-finished-at": String(Date.now()) } } });
    setIgQueue([]);
    setIgBanner(null);
  }, [app, igQueue.length]);

  useEffect(() => {
    // Feed legacy Instagram story notices into the same persisted phone-wide queue.
    if (locked || igBanner || globalNotificationItem || hasPendingKakaoNotification || !igQueue.length) return;
    const timer = window.setTimeout(() => {
      const notice = igQueue[0];
      const current = runtimeRef.current;
      const currentUi = current.ui?.kakao || {};
      let queue: Item[] = [];
      try { queue = JSON.parse(String(currentUi["global-notification-queue"] || "[]")); } catch { queue = []; }
      const queuedNotice = { ...notice, meta: { ...notice.meta, notificationAppId: "instagram", notificationMessageId: notice.id } };
      const index = Number(notice.id.split("-").at(-1) || 0);
      update({
        ...current,
        ui: { ...current.ui, kakao: {
          ...currentUi,
          "global-notification-queue": JSON.stringify(queue.some(item => item.id === queuedNotice.id) ? queue : [...queue, queuedNotice]),
          "ig-backlash-notification-index": Math.max(index, Number(currentUi["ig-backlash-notification-index"] || 0)),
          "ig-backlash-notifications-started": true,
        } },
      });
      setIgQueue((items) => items.slice(1));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [igQueue, igBanner, locked, globalNotificationItem, hasPendingKakaoNotification]);
  useEffect(() => {
    if (!igBanner || locked) return;
    setIgBanner(null);
  }, [igBanner, locked]);
  useEffect(() => {
    let active = true;
    if (creator || external) return;
    void db.saves
      .get(work.id)
      .then((saved) => {
        if (!active) return;
        if (saved && saved.state.revision === work.updatedAt)
          setOwn(migrateRuntimeGameClock(saved.state, work));
        else {
          setOwn(migrateRuntimeGameClock(dispatch(work, initialRuntime(work), "start"), work));
          if (saved) setLoadError("作品已更新，已开始新的进度。");
        }
        setReady(true);
      })
      .catch(() => {
        setOwn(migrateRuntimeGameClock(dispatch(work, initialRuntime(work), "start"), work));
        setLoadError("无法读取本地存档。本次仍可游玩。");
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, [work.id, work.updatedAt, creator, external]);
  useEffect(() => {
    if (!creator && !external && ready)
      void db.saves
        .put({ id: work.id, state: own })
        .catch(() => setLoadError("存档失败，请检查浏览器存储权限。"));
  }, [own, creator, work.id, external, ready]);
  useEffect(() => {
    if (creator || !ready) return;
    const interval = setInterval(() => {
      const previous = runtimeRef.current;
      let next = advance(work, previous, 1000);
      const threadsUi = next.ui?.threads ?? {};
      let scheduledFanReplies: Array<{id:string;scheduledAt:number;deliveredAt:number|null}> = [];
      try { scheduledFanReplies = JSON.parse(String(threadsUi["threads-fan-replies-v1"] || "[]")); } catch { scheduledFanReplies = []; }
      // Fan comments are real-time phone events and must continue while Threads is not open.
      const realNow = Date.now();
      const dueFanReplies = scheduledFanReplies.some(reply => reply.deliveredAt == null && reply.scheduledAt <= realNow);
      if (dueFanReplies) {
        next = { ...next, ui: { ...next.ui, threads: { ...threadsUi, "threads-fan-replies-v1": JSON.stringify(scheduledFanReplies.map(reply => !reply.deliveredAt && reply.scheduledAt <= realNow ? { ...reply, deliveredAt: realNow } : reply)) } } };
      }
      const changed =
        next.time !== previous.time ||
        next.trace.join() !== previous.trace.join() ||
        (next.scheduled?.length ?? 0) !== (previous.scheduled?.length ?? 0) ||
        (next.scheduled?.length ?? 0) > 0 ||
        Math.floor((next.elapsedMs ?? 0) / 5000) !==
          Math.floor((previous.elapsedMs ?? 0) / 5000);
      if (dueFanReplies || changed || next.gameClock?.currentGameTimestamp !== previous.gameClock?.currentGameTimestamp || next.date !== previous.date) update(next);
    }, 1000);
    return () => clearInterval(interval);
  }, [creator, ready, work.id, work.updatedAt]);
  const event = (event: string, target: string) => {
    if (!creator) update(dispatch(work, runtimeRef.current, event, target));
  };
  const captureApp = () => {
    if (!app) return;
    const current = shell.current?.querySelector<HTMLElement>(".app-screen");
    if (!current) return;
    const snapshot = current.cloneNode(true) as HTMLElement;
    snapshot.style.transform = "none";
    snapshot.style.opacity = "1";
    snapshot.style.filter = "none";
    snapshot.style.borderRadius = "0";
    snapshot.querySelectorAll("audio").forEach((el) => el.remove());
    snapshot.querySelectorAll("video").forEach((el) => {
      el.removeAttribute("autoplay");
      el.removeAttribute("src");
    });
    snapshot.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    appSnapshots.current.set(app, snapshot);
    for (const id of appSnapshots.current.keys())
      if (!recent.includes(id) && id !== app) appSnapshots.current.delete(id);
  };
  const open = (id: string) => {
    if (!work.apps.some((a) => a.id === id && a.installed)) return;
    setApp(id);
    setKeyboard(false);
    setRecent((v) => [id, ...v.filter((a) => a !== id)].slice(0, 8));
    setFolder("");
    setPanel("");
    onOpen?.(id);
    event("openApp", id);
  };
  const installedApps = work.apps.filter((a) => a.installed);
  const apps = installedApps.filter((a) => a.visible);
  const unlock = (pin = "") => {
    if (!work.phone.passcode || pin === work.phone.passcode) {
      setLocked(false);
      setPinOpen(false);
      if (selectedBoyfriend || selectedFriend) {
        const current = runtimeRef.current;
        const existing = current.messages.kakao ?? [];
        const avatarFor = (name: string) => {
          const files: Record<string, string> = {
            "周安信": "周安信-kakao.png", "张家豪": "張家豪-kakao.png",
            "李理悟": "李理悟-kakao-v2.jpg", "李相沅": "李相沅-kakao.png",
            "贺鑫隆": "賀鑫隆-kakao.png", "郑相炫": "鄭相炫-kakao.png",
            "金俊抒": "金俊抒-kakao.png", "金虔佑": "金虔佑-kakao.png",
          };
          return files[name] ? import.meta.env.BASE_URL + "kakao/" + files[name] : "";
        };
        const incoming = [
          selectedBoyfriend ? makeItem({ id: "selection-boyfriend-first-message", title: selectedBoyfriend, sender: selectedBoyfriend, avatar: boyfriendAvatarPath(selectedBoyfriend), body: "你看到x了吗？", time: displayTime }) : null,
          selectedFriend ? makeItem({ id: "selection-friend-first-message", title: selectedFriend, sender: selectedFriend, avatar: avatarFor(selectedFriend), body: "你们还好吗？", time: displayTime }) : null,
        ].filter((item): item is NonNullable<typeof item> => item !== null);
        const xPosts = current.messages.twitter ?? [];
        const dispatchPost = makeItem({
          id: "permanent-dispatch-opening-post",
          title: "【Dispatch独家】恋爱传闻引发热议",
          sender: "KoreaDispatch",
          body: `【Dispatch独家】
ALPHA DRIVE ONE成员${selectedBoyfriend || "李理悟"}近日因恋爱传闻成为讨论焦点。
网传其结束工作行程后曾与一名圈外女性同行，相关说法目前尚未获得当事人或所属公司证实。
目前网络流传的时间线与相关照片仍有待核实，是否存在恋爱关系、双方是否认识，均不能仅凭网传内容下定论。
粉丝与网友对此意见不一，也有声音呼吁停止传播未经证实的私人信息，并等待正式回应。
相关讨论持续发酵，事件后续仍有待观察。`,
          time: displayTime,
          kind: "post",
          likes: 2864000,
          comments: [
            "@m0on_7x：团队到底有没有看到粉丝的担心？希望尽快给个清楚说法。",
            "@bluehour_092：行程和传闻都没说清楚，大家先别急着下结论。",
            "@haechan_zip：比起炒话题，我更想知道团队接下来怎么处理。",
            "@dive深夜：看到热搜真的很失望，希望本人正面回应。",
            "@orbit_441：粉丝一直支持到现在，至少应该认真对待大家的疑问。",
            "@cloudyday_88：未经证实的内容别继续扩散，但公司也不能一直沉默。",
            "@pinknoise_21：宣传期碰上这种话题，团队公关反应太慢了。",
            "@starry_031：希望不要把责任推给任何普通人，先把事实说清楚。",
            "@mintchoco_5：现在最需要的是可信的说明，不是模糊回应。",
            "@ddalki_404：对粉丝的信任感真的会被这种处理方式消耗。",
            "@nightwalk_77：请把注意力放回事实，不要围攻传闻里的当事人。",
            "@blue_fox_19：如果是假的就尽快澄清，如果是真的也请坦诚面对。",
            "@moodmaker_02：管理团队这次的危机处理让人很难满意。",
            "@soda_pop_615：别再让粉丝靠截图和猜测拼凑消息了。",
            "@winterlog_33：支持作品不代表不能提出质疑，回应呢？",
            "@luvdrive_108：现在各种说法满天飞，官方至少该说明已知情况。",
            "@cloudnine_6：请停止传播私人行踪，讨论也该有边界。",
            "@peachring_52：最失望的是到现在还没有清晰、负责的沟通。",
            "@daybreak_209：希望成员本人和团队都认真看待这次争议。",
            "@filmgrain_17：别拿粉丝的担心当流量，先把事情讲明白。",
            "@sunday_kk：没有证据就别把猜测说成事实，媒体也该谨慎。",
            "@violet_820：公关团队真的需要检讨，处理方式让讨论更混乱。",
            "@lemonade_04：希望大家批评事情本身，不要攻击女性或曝光隐私。",
            "@moonriver_71：粉丝想要的是尊重和坦诚，不是继续沉默。",
            "@daisychain_29：等正式回应。在那之前请不要把未经证实的内容当真。",
            "@echo_501：这次的沟通方式很难让人接受，希望之后别再发生。"
          ],
          meta: { handle: "Dicon_korea", verified: "true", reposts: "128.6万", views: "2860万" },
        });
        const isTestPost = (item: Item) =>
          /测试|test|demo|sample|测试用户|测试内容/i.test(
            [item.title, item.sender, item.body, item.folder, ...Object.values(item.meta ?? {})].join(" "),
          );
        const nextXPosts = [
          dispatchPost,
          ...xPosts.filter((item) => item.id !== dispatchPost.id && !isTestPost(item)),
        ];
        const xPostsChanged =
          xPosts.length !== nextXPosts.length ||
          xPosts[0]?.id !== dispatchPost.id ||
          xPosts.find((item) => item.id === dispatchPost.id)?.body !== dispatchPost.body;
        // Reconcile stale saved opening messages with the current character choices.
        const corrected = incoming.map((item) => {
          const saved = existing.find((entry) => entry.id === item.id);
          return saved ? { ...saved, title: item.title, sender: item.sender, avatar: item.avatar, body: item.body } : item;
        });
        const changed = corrected.some((item) => {
          const saved = existing.find((entry) => entry.id === item.id);
          return !saved || saved.title !== item.title || saved.sender !== item.sender || saved.avatar !== item.avatar || saved.body !== item.body;
        });
        if (changed) {
          const notices = corrected.map((item) => `KakaoTalk: ${item.title}：${item.body}`);
          const merged = [...existing.filter((item) => !corrected.some((next) => next.id === item.id)), ...corrected];
          update({
            ...current,
            messages: { ...current.messages, kakao: merged, twitter: nextXPosts },
            notifications: [...current.notifications, ...notices],
          });
        } else if (xPostsChanged) {
          update({ ...current, messages: { ...current.messages, twitter: nextXPosts } });
        }
      }
      event("password", pin);
    } else {
      setPinError("密码不正确");
      setPinOpen(true);
    }
  };
  useEffect(() => {
    if (app && !work.apps.some((a) => a.id === app && a.installed)) setApp("");
  }, [app, work.apps]);
  const displayTime = creator ? work.phone.time : s.gameClock ? formatGameTime(s.gameClock.currentGameTimestamp, s.gameClock.timezone) : s.time || work.phone.time;
  const plugin = getApp(app);
  const backlashNotificationsComplete = Number(s.ui?.kakao?.["ig-backlash-notifications-finished-at"] || 0) > 0;
  const friendStoryDueAt = s.ui?.kakao?.["friend-story-trigger-at"];
  const friendStoryTriggered = s.ui?.kakao?.["friend-story-triggered"] === true;
  const checkinDueAt = s.ui?.kakao?.["ig-backlash-checkin-due-at"];
  const checkinSent = s.ui?.kakao?.["ig-backlash-checkin-sent"] === true;
  const kakaoDeliveryQueue = s.ui?.kakao?.["delivery-queue"] || "[]";

  useEffect(() => {
    if (globalNotificationItem && String(globalNotificationItem.meta?.notificationAppId || "kakao") === app && app !== "threads") {
      setGlobalNotificationItem(null);
    }
  }, [app, globalNotificationItem]);

  useEffect(() => {
    // Let an already-visible Instagram banner finish, then KakaoTalk takes priority.
    if (locked || creator || !work.phone.notifications || globalNotificationItem || igBanner) return;
    let queued: Item[] = [];
    try { queued = JSON.parse(globalNotificationQueue); } catch { queued = []; }
    if (!queued.length) return;
    const timer = window.setTimeout(() => {
      const current = runtimeRef.current;
      let latest: Item[] = [];
      try { latest = JSON.parse(String(current.ui?.kakao?.["global-notification-queue"] || "[]")); } catch { latest = []; }
      if (!latest.length) return;
      const [next, ...remaining] = latest;
      const sourceAppId = String(next.meta?.notificationAppId || "kakao");
      const batch = [next];
      while (sourceAppId !== "instagram" && remaining.length && String(remaining[0].meta?.notificationAppId || "kakao") === sourceAppId) batch.push(remaining.shift()!);
      if (sourceAppId === app && sourceAppId !== "threads") {
        const dismissedPostIds = new Set(batch.map(item => String(item.meta?.notificationPostId || "")).filter(Boolean));
        let dismissedStoryEvents: Array<{postId:string;notificationDelivered:boolean;[key:string]:unknown}> = [];
        try { dismissedStoryEvents = JSON.parse(String(current.ui?.kakao?.["story-x-events"] || "[]")); } catch { dismissedStoryEvents = []; }
        const currentUi = current.ui?.kakao || {};
        const dismissedLastInstagramNotice = batch.some(item => item.id === "ig-backlash-60");
        update({
          ...current,
          ui: { ...current.ui, kakao: {
            ...currentUi,
            "global-notification-queue": JSON.stringify(remaining),
            ...(dismissedPostIds.size ? { "story-x-events": JSON.stringify(dismissedStoryEvents.map(event => dismissedPostIds.has(event.postId) ? { ...event, notificationDelivered: true } : event)) } : {}),
            ...(dismissedLastInstagramNotice && !currentUi["ig-backlash-notifications-finished-at"] ? { "ig-backlash-notifications-finished-at": String(Date.now()) } : {}),
          } },
        });
        return;
      }
      const bannerItem = batch.length > 1 ? makeItem({
        id: "notification-batch-" + sourceAppId + "-" + batch.map(item => item.id).join("-").slice(0, 120),
        title: next.title,
        sender: sourceAppId === "threads" ? "Threads" : sourceAppId === "twitter" ? "𝕏" : sourceAppId === "kakao" ? "KakaoTalk" : next.sender,
        body: sourceAppId === "threads" ? "你有 " + batch.length + " 則新留言" : sourceAppId === "twitter" ? "你有 " + batch.length + " 則新貼文通知" : "你有 " + batch.length + " 則新訊息",
        time: next.time,
        meta: { ...next.meta, notificationAppId: sourceAppId, notificationBatchCount: String(batch.length) },
      }) : next;
      let storyEvents: Array<{postId:string;notificationDelivered:boolean;[key:string]:unknown}> = [];
      try { storyEvents = JSON.parse(String(current.ui?.kakao?.["story-x-events"] || "[]")); } catch { storyEvents = []; }
      const notificationPostIds = new Set(batch.map(item => String(item.meta?.notificationPostId || "")).filter(Boolean));
      const updatedStoryEvents = notificationPostIds.size
        ? storyEvents.map(event => notificationPostIds.has(event.postId) ? { ...event, notificationDelivered: true } : event)
        : storyEvents;
      update({
        ...current,
        ui: {
          ...current.ui,
          kakao: {
            ...current.ui?.kakao,
            "global-notification-queue": JSON.stringify(remaining),
            ...(notificationPostIds.size ? { "story-x-events": JSON.stringify(updatedStoryEvents) } : {}),
          },
        },
      });
      setGlobalNotificationItem(bannerItem);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [globalNotificationQueue, globalNotificationItem, locked, creator, work.phone.notifications, igBanner, app]);
  useEffect(() => {
    if (!ready || igQueue.length > 0 || igBanner) return;
    const currentUi = s.ui?.kakao || {};
    const instagram = (s.messages.instagram ?? []).filter(item => /^ig-backlash-\\d+$/.test(item.id)).sort((a,b) => Number(a.id.split("-").at(-1)) - Number(b.id.split("-").at(-1)));
    if (instagram.length !== 60) return;
    if (currentUi["ig-backlash-notifications-started"] !== true) {
      const legacyDue = Number(currentUi["ig-backlash-checkin-due-at"] || 0);
      const now = Date.now();
      update({
        ...runtimeRef.current,
        ui: { ...runtimeRef.current.ui, kakao: {
          ...runtimeRef.current.ui?.kakao,
          "ig-backlash-notifications-started": true,
          "ig-backlash-notification-index": 60,
          "ig-backlash-notifications-finished-at": String(legacyDue > 0 ? legacyDue - 60_000 : now),
        } },
      });
      return;
    }
    const progress = Math.max(0, Math.min(60, Number(currentUi["ig-backlash-notification-index"] || 0)));
    if (progress >= 60) {
      if (!currentUi["ig-backlash-notifications-finished-at"]) {
        const current = runtimeRef.current;
        update({ ...current, ui: { ...current.ui, kakao: { ...current.ui?.kakao, "ig-backlash-notifications-finished-at": String(Date.now()) } } });
      }
      return;
    }
    setIgQueue(instagram.slice(progress));
  }, [ready, s.messages.instagram, s.ui?.kakao?.["ig-backlash-notifications-started"], s.ui?.kakao?.["ig-backlash-notification-index"], s.ui?.kakao?.["ig-backlash-notifications-finished-at"], igQueue.length, igBanner]);
  const kakaoPendingReadIds = (s.messages.kakao ?? [])
    .filter((item) => item.outgoing && item.meta.unread === "1" && item.meta.unreadUntilAt)
    .map((item) => ({ id: item.id, due: Number(item.meta.unreadUntilAt) }))
    .filter((item) => Number.isFinite(item.due));
  useEffect(() => {
    if (!kakaoPendingReadIds.length) return;
    const due = Math.min(...kakaoPendingReadIds.map((item) => item.due));
    const timer = window.setTimeout(() => {
      const current = runtimeRef.current;
      const now = Date.now();
      update({
        ...current,
        messages: {
          ...current.messages,
          kakao: (current.messages.kakao ?? []).map((item) =>
            item.outgoing && item.meta.unread === "1" && Number(item.meta.unreadUntilAt) <= now
              ? { ...item, meta: { ...item.meta, unread: "", readAt: String(now) } }
              : item
          ),
        },
      });
    }, Math.max(0, due - Date.now()));
    return () => window.clearTimeout(timer);
  }, [s.messages.kakao]);
  useEffect(() => {
    type QueuedKakaoMessage = { item: Item; typingAt: number; deliverAt: number };
    let queue: QueuedKakaoMessage[] = [];
    try { queue = JSON.parse(String(kakaoDeliveryQueue)); } catch { queue = []; }
    const now = Date.now();
    const current = runtimeRef.current;
    const currentUi = current.ui?.kakao || {};
    const active = queue.filter((entry) => entry.typingAt <= now && entry.deliverAt > now);
    const nextTypingState = Object.fromEntries(active.map((entry) => [entry.item.title, entry.deliverAt]));
    const due = queue.filter((entry) => entry.deliverAt <= now);
    const remaining = queue.filter((entry) => entry.deliverAt > now);
    const existing = current.messages.kakao ?? [];
    const delivered = due
      .filter((entry) => !existing.some((item) => item.id === entry.item.id))
      .map((entry) => ({ ...entry.item, read: false }));
    const startsBacklash = delivered.some((item) =>
      item.body === "你的身份好像已经被扒出来了"
      && !(current.messages.instagram ?? []).some((entry) => entry.id === "ig-backlash-1")
    );
    const oldTyping = String(currentUi["typing-state"] || "");
    const nextTyping = JSON.stringify(nextTypingState);
    if (due.length || oldTyping !== nextTyping) {
      update({
        ...current,
        messages: delivered.length
          ? { ...current.messages, kakao: [...existing, ...delivered] }
          : current.messages,
        ui: {
          ...current.ui,
          kakao: {
            ...currentUi,
            "delivery-queue": JSON.stringify(remaining),
            "typing-state": nextTyping,
          },
        },
      });
      if (startsBacklash) {
        const backlash = createInstagramBacklash(current.time || displayTime);
        const latest = runtimeRef.current;
        update({
          ...latest,
          messages: { ...latest.messages, instagram: [...(latest.messages.instagram ?? []), ...backlash] },
          ui: { ...latest.ui, kakao: { ...latest.ui?.kakao, "ig-backlash-notifications-started": true, "ig-backlash-notification-index": 0, "ig-backlash-notifications-finished-at": "" } },
        });
        setIgQueue(backlash);
      }
    }
    const nextEventAt = remaining
      .flatMap((entry) => [entry.typingAt, entry.deliverAt])
      .filter((time) => time > now)
      .sort((a, b) => a - b)[0];
    if (!nextEventAt) return;
    const timer = window.setTimeout(() => {
      const latest = runtimeRef.current;
      let latestQueue: QueuedKakaoMessage[] = [];
      try { latestQueue = JSON.parse(String(latest.ui?.kakao?.["delivery-queue"] || "[]")); } catch { latestQueue = []; }
      const tick = Date.now();
      const activeNow = latestQueue.filter((entry) => entry.typingAt <= tick && entry.deliverAt > tick);
      const dueNow = latestQueue.filter((entry) => entry.deliverAt <= tick);
      const remainingNow = latestQueue.filter((entry) => entry.deliverAt > tick);
      const latestExisting = latest.messages.kakao ?? [];
      const newMessages = dueNow
        .filter((entry) => !latestExisting.some((item) => item.id === entry.item.id))
        .map((entry) => ({ ...entry.item, read: false }));
      const latestTyping = JSON.stringify(Object.fromEntries(activeNow.map((entry) => [entry.item.title, entry.deliverAt])));
      const backlashStarts = newMessages.some((item) =>
        item.body === "你的身份好像已经被扒出来了"
        && !(latest.messages.instagram ?? []).some((entry) => entry.id === "ig-backlash-1")
      );
      update({
        ...latest,
        messages: newMessages.length
          ? { ...latest.messages, kakao: [...latestExisting, ...newMessages] }
          : latest.messages,
        ui: {
          ...latest.ui,
          kakao: {
            ...latest.ui?.kakao,
            "delivery-queue": JSON.stringify(remainingNow),
            "typing-state": latestTyping,
          },
        },
      });
      if (backlashStarts) {
        const backlash = createInstagramBacklash(latest.time || displayTime);
        const afterDelivery = runtimeRef.current;
        update({
          ...afterDelivery,
          messages: { ...afterDelivery.messages, instagram: [...(afterDelivery.messages.instagram ?? []), ...backlash] },
          ui: { ...afterDelivery.ui, kakao: { ...afterDelivery.ui?.kakao, "ig-backlash-notifications-started": true, "ig-backlash-notification-index": 0, "ig-backlash-notifications-finished-at": "" } },
        });
        setIgQueue(backlash);
      }
    }, Math.max(0, nextEventAt - now));
    return () => window.clearTimeout(timer);
  }, [kakaoDeliveryQueue, s.ui?.kakao?.["typing-state"]]);
  useEffect(() => {
    if (!ready) return;
    const kakao = s.messages.kakao ?? [];
    const hasBoyfriendTrigger = kakao.some((item) => item.body === "你的身份好像已经被扒出来了");
    const instagram = s.messages.instagram ?? [];
    const hasPrematureBacklash = instagram.some((item) => item.id.startsWith("ig-backlash-"));
    if (hasPrematureBacklash && !hasBoyfriendTrigger) {
      const current = runtimeRef.current;
      update({
        ...current,
        messages: {
          ...current.messages,
          instagram: (current.messages.instagram ?? []).filter((item) => !item.id.startsWith("ig-backlash-")),
        },
        ui: {
          ...current.ui,
          kakao: {
            ...current.ui?.kakao,
            "ig-backlash-checkin-due-at": "",
            "ig-backlash-checkin-sent": false,
            "ig-backlash-notifications-started": false,
            "ig-backlash-notification-index": 0,
            "ig-backlash-notifications-finished-at": "",
          },
        },
      });
      setIgQueue([]);
      setIgBanner(null);
    }
  }, [ready, selectedBoyfriend]);

  useEffect(() => {
    if (!backlashNotificationsComplete || igQueue.length > 0 || igBanner || !selectedBoyfriend || checkinSent) return;
    if (!checkinDueAt) {
      const current = runtimeRef.current;
      update({
        ...current,
        ui: {
          ...current.ui,
          kakao: {
            ...current.ui?.kakao,
            "ig-backlash-checkin-due-at": Date.now() + 60_000,
          },
        },
      });
      return;
    }
    const remaining = Math.max(0, Number(checkinDueAt) - Date.now());
    const timer = window.setTimeout(() => {
      const current = runtimeRef.current;
      if (current.ui?.kakao?.["ig-backlash-checkin-sent"] === true) return;
      const existing = current.messages.kakao ?? [];
      if (existing.some((item) => item.id === "boyfriend-backlash-checkin")) return;
      const files: Record<string, string> = {
        "周安信": "周安信-kakao.png", "张家豪": "張家豪-kakao.png",
        "李理悟": "李理悟-kakao-v2.jpg", "李相沅": "李相沅-kakao.png",
        "贺鑫隆": "賀鑫隆-kakao.png", "郑相炫": "鄭相炫-kakao.png",
        "金俊抒": "金俊抒-kakao.png", "金虔佑": "金虔佑-kakao.png",
      };
      const avatar = files[selectedBoyfriend] ? import.meta.env.BASE_URL + "kakao/" + files[selectedBoyfriend] : "";
      const body = "你有收到粉丝的消息吗？";
      const message = makeItem({
        id: "boyfriend-backlash-checkin",
        title: selectedBoyfriend,
        sender: selectedBoyfriend,
        avatar,
        body,
        time: current.time || displayTime,
        outgoing: false,
        read: false,
      });
      update({
        ...current,
        messages: { ...current.messages, kakao: [...existing, message] },
        ui: {
          ...current.ui,
          kakao: { ...current.ui?.kakao, "ig-backlash-checkin-sent": true, "romance-node": "K001" },
        },
      });
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [backlashNotificationsComplete, igQueue.length, igBanner, selectedBoyfriend, checkinSent, checkinDueAt]);
  useEffect(() => {
    if (!ready || !backlashNotificationsComplete || igQueue.length > 0 || igBanner || !selectedFriend || friendStoryTriggered) return;
    if (!friendStoryDueAt) {
      const current = runtimeRef.current;
      const existingDue = Number(current.ui?.kakao?.["ig-backlash-checkin-due-at"] || 0);
      const dueAt = Number.isFinite(existingDue) && existingDue > 0 ? existingDue : Date.now() + 60_000;
      update({ ...current, ui: { ...current.ui, kakao: { ...current.ui?.kakao, "friend-story-trigger-at": String(dueAt) } } });
      return;
    }
    const dueAt = Number(friendStoryDueAt);
    if (!Number.isFinite(dueAt)) return;
    const timer = window.setTimeout(() => {
      const current = runtimeRef.current;
      if (current.ui?.kakao?.["friend-story-triggered"] === true) return;
      const existing = current.messages.kakao ?? [];
      if (existing.some((item) => item.id === "friend-story-F001-0")) {
        update({ ...current, ui: { ...current.ui, kakao: { ...current.ui?.kakao, "friend-story-triggered": true, "friend-story-started": true, "friend-story-node": "F001" } } });
        return;
      }
      const files: Record<string, string> = {
        "周安信": "周安信-kakao.png", "张家豪": "張家豪-kakao.png",
        "李理悟": "李理悟-kakao-v2.jpg", "李相沅": "李相沅-kakao.png",
        "贺鑫隆": "賀鑫隆-kakao.png", "郑相炫": "鄭相炫-kakao.png",
        "金俊抒": "金俊抒-kakao.png", "金虔佑": "金虔佑-kakao.png",
      };
      const avatar = files[selectedFriend] ? import.meta.env.BASE_URL + "kakao/" + files[selectedFriend] : "";
      const first = makeItem({ id: "friend-story-F001-0", title: selectedFriend, sender: selectedFriend, avatar, body: "你现在方便回讯息吗？", time: current.time || displayTime, outgoing: false, read: false, meta: { friendStoryNode: "F001" } });
      const pending = ["我知道你今天应该收到很多不太好听的话。", "我本来不想在这个时候打扰你。", "可是有件事，我觉得你应该知道。"];
      const start = Date.now();
      const queue = pending.map((body, index) => {
        const item = makeItem({ id: "friend-story-F001-" + (index + 1), title: selectedFriend, sender: selectedFriend, avatar, body, time: current.time || displayTime, outgoing: false, read: false, meta: { friendStoryNode: "F001" } });
        const typingAt = start + index * 5000 + 2000;
        return { item, typingAt, deliverAt: typingAt + 3000 };
      });
      let existingQueue: Array<{item: Item; typingAt: number; deliverAt: number}> = [];
      try { existingQueue = JSON.parse(String(current.ui?.kakao?.["delivery-queue"] || "[]")); } catch { existingQueue = []; }
      update({
        ...current,
        messages: { ...current.messages, kakao: [...existing, first] },
        notifications: [...current.notifications, `KakaoTalk: ${selectedFriend}：${first.body}`],
        ui: { ...current.ui, kakao: { ...current.ui?.kakao, "friend-story-triggered": true, "friend-story-started": true, "friend-story-node": "F001", "friend-story-completed-nodes": "[]", "friend-story-history": "[]", "delivery-queue": JSON.stringify([...existingQueue, ...queue]) } },
      });
    }, Math.max(0, dueAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [ready, backlashNotificationsComplete, igQueue.length, igBanner, selectedFriend, friendStoryTriggered, friendStoryDueAt]);

  useEffect(() => {
    if (!ready || creator || !friendStoryTriggered || !selectedFriend) return;
    const current = runtimeRef.current;
    const ui = current.ui?.kakao || {};
    const outcome = String(ui["friend-story-outcome"] || "");
    if (!/^H(?:0[1-9]|1[0-2])$/.test(outcome) || ui["friend-story-phase2-started"] === true) return;
    let dueAt = Number(ui["friend-story-phase2-trigger-at"] || 0);
    if (!dueAt) {
      const delay = outcome === "H04" ? 24 * 60 * 60 * 1000 : outcome === "H09" ? 15 * 60 * 1000 : 30 * 60 * 1000;
      dueAt = Date.now() + delay;
      update({ ...current, ui: { ...current.ui, kakao: { ...ui, "friend-story-phase2-trigger-at": String(dueAt) } } });
      return;
    }
    if (!Number.isFinite(dueAt)) return;
    const timer = window.setTimeout(() => {
      const latest = runtimeRef.current;
      const latestUi = latest.ui?.kakao || {};
      if (latestUi["friend-story-phase2-started"] === true) return;
      const messages = latest.messages.kakao || [];
      if (messages.some(item => item.id === "friend-phase2-F2_070-0")) return;
      let queue: Array<{ item: Item; typingAt: number; deliverAt: number }> = [];
      let globalQueue: Item[] = [];
      try { queue = JSON.parse(String(latestUi["delivery-queue"] || "[]")); } catch { queue = []; }
      try { globalQueue = JSON.parse(String(latestUi["global-notification-queue"] || "[]")); } catch { globalQueue = []; }
      if (queue.some(entry => entry.item?.title === selectedFriend && entry.deliverAt > Date.now())) return;
      const files: Record<string, string> = {
        "周安信": "周安信-kakao.png", "张家豪": "張家豪-kakao.png",
        "李理悟": "李理悟-kakao-v2.jpg", "李相沅": "李相沅-kakao.png",
        "贺鑫隆": "賀鑫隆-kakao.png", "郑相炫": "鄭相炫-kakao.png",
        "金俊抒": "金俊抒-kakao.png", "金虔佑": "金虔佑-kakao.png",
      };
      const avatar = files[selectedFriend] ? import.meta.env.BASE_URL + "kakao/" + files[selectedFriend] : "";
      const opening = getFriendPhase2Opening(outcome);
      const first = makeItem({ id: "friend-phase2-F2_070-0", title: selectedFriend, sender: selectedFriend, avatar, body: opening[0], time: latest.time || displayTime, outgoing: false, read: false, meta: { friendPhase2Node: "F2_070" } });
      const now = Date.now();
      const pending = opening.slice(1).map((body, index) => {
        const item = makeItem({ id: "friend-phase2-F2_070-" + (index + 1), title: selectedFriend, sender: selectedFriend, avatar, body, time: latest.time || displayTime, outgoing: false, read: false, meta: { friendPhase2Node: "F2_070" } });
        const typingAt = now + index * 5000 + 2000;
        return { item, typingAt, deliverAt: typingAt + 3000 };
      });
      const trustByOutcome: Record<string, number> = {
        H01: 2, H02: 1, H03: 1, H04: -2, H05: 2, H06: -1,
        H07: 1, H08: -2, H09: 1, H10: -1, H11: -1, H12: 2,
      };
      const notice = { ...first, meta: { ...first.meta, notificationAppId: "kakao" } };
      update({
        ...latest,
        messages: { ...latest.messages, kakao: [...messages, first] },
        ui: { ...latest.ui, kakao: {
          ...latestUi,
          "friend-story-phase2-started": true,
          "friend-story-phase2-node": "F2_070",
          "friend-story-phase2-history": "[]",
          "friend-story-phase2-completed-nodes": "[]",
          "friend-story-phase2-trust": trustByOutcome[outcome] ?? 0,
          "friend-story-phase2-suspicion": 0,
          "friend-story-phase2-concealment": 0,
          "friend-story-phase2-evidence-compared": false,
          "friend-story-phase2-source-identified": false,
          "friend-story-phase2-investigation-paused": false,
          "friend-story-phase2-bf-informed": false,
          "delivery-queue": JSON.stringify([...queue, ...pending]),
          "global-notification-queue": JSON.stringify([...globalQueue, notice]),
        } },
      });
    }, Math.max(0, dueAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [ready, creator, friendStoryTriggered, selectedFriend, s.ui?.kakao?.["friend-story-outcome"], s.ui?.kakao?.["friend-story-phase2-trigger-at"], s.ui?.kakao?.["friend-story-phase2-started"], s.ui?.kakao?.["delivery-queue"]]);

  useEffect(() => {
    if (!ready || creator || !selectedBoyfriend || !selectedFriend) return;
    const current = runtimeRef.current;
    const currentUi = current.ui?.kakao || {};
    const boyfriendDone = /^E0[1-8]$/.test(String(currentUi["romance-result"] || ""));
    const friendDone = /^H(0[1-9]|1[0-2])$/.test(String(currentUi["friend-story-outcome"] || ""));
    if (!boyfriendDone || !friendDone || currentUi["secret-admirer-selected-at"] || currentUi["secret-admirer-selection-error"]) return;
    const boyfriendId = memberIdForName(selectedBoyfriend);
    const friendId = memberIdForName(selectedFriend);
    if (!boyfriendId || !friendId || boyfriendId === friendId) {
      update({ ...current, ui: { ...current.ui, kakao: { ...currentUi, "secret-admirer-selection-error": "无法从已选择的角色资料中确认男友或好友 ID，秘密单恋剧情已安全停止。" } } });
      return;
    }
    const picked = chooseSecretAdmirer(boyfriendId, friendId);
    if (!picked) {
      update({ ...current, ui: { ...current.ui, kakao: { ...currentUi, "secret-admirer-selection-error": "排除男友与好友后没有符合成年条件的候选成员，秘密单恋剧情已安全停止。" } } });
      return;
    }
    const teamConflict = chooseTeamConflictMember(boyfriendId, friendId, picked.id);
    const selectedAt = Date.now();
    update({
      ...current,
      ui: { ...current.ui, kakao: {
        ...currentUi,
        "secret-admirer-member-id": picked.id,
        "team-conflict-member-id": teamConflict?.id || "",
        "team-conflict-selection-error": teamConflict ? "" : "排除男友、好友及A后没有符合成年条件的候选成员，B剧情已安全停止。",
        "team-conflict-trigger-at": teamConflict ? String(selectedAt + 60_000) : "",
        "team-conflict-story-started": false,
        "team-conflict-story-node": "",
        "team-conflict-story-outcome": "",
        "team-conflict-completed-nodes": "[]",
        "team-conflict-history": "[]",
        "secret-admirer-selected-at": String(selectedAt),
        "secret-admirer-trigger-at": String(selectedAt + 60_000),
        "secret-admirer-story-started": false,
        "secret-admirer-story-node": "",
        "secret-admirer-story-outcome": "",
        "secret-admirer-completed-nodes": "[]",
        "secret-admirer-history": "[]",
        "secret-admirer-affection": 0,
        "secret-admirer-boundary": "open",
        "secret-admirer-jealousy": 0,
        "secret-admirer-confession-known": false,
        "secret-admirer-player-interest": "unknown",
      } },
    });
  }, [ready, creator, selectedBoyfriend, selectedFriend, s.ui?.kakao?.["romance-result"], s.ui?.kakao?.["friend-story-outcome"], s.ui?.kakao?.["secret-admirer-selected-at"], s.ui?.kakao?.["secret-admirer-selection-error"], s.ui?.kakao?.["delivery-queue"], s.ui?.kakao?.["typing-state"]]);

  useEffect(() => {
    if (!ready || creator) return;
    const deliveredNodes = new Set((s.messages.kakao || [])
      .map(item => String(item.meta?.boyfriendStage2Node || ""))
      .filter(Boolean));
    const current = runtimeRef.current;
    const ui = current.ui?.kakao || {};
    const posts = [...(current.messages.twitter || [])];
    let queue: Item[] = [];
    let events: Array<{eventId:string;triggeredByNode:string;postId:string;deliveredAt:number;notificationDelivered:boolean}> = [];
    try { queue = JSON.parse(String(ui["global-notification-queue"] || "[]")); } catch { queue = []; }
    try { events = JSON.parse(String(ui["story-x-events"] || "[]")); } catch { events = []; }
    const definitions = [
      { ...STAGE2_X001, triggeredByNodes: STAGE2_X001.triggeredByNodes },
      { ...STAGE2_X002, triggeredByNodes: STAGE2_X002.triggeredByNodes },
      { ...STAGE2_X003, triggeredByNodes: ["K117"] },
    ];
    const added: typeof events = [];
    for (const event of definitions) {
      if (!event.triggeredByNodes.some(node => deliveredNodes.has(node))) continue;
      if (events.some(saved => saved.eventId === event.eventId) || posts.some(post => post.id === event.postId)) continue;
      const postBody = event.eventId === "X001" ? event.body.replace("{{boyfriend}}", selectedBoyfriend) : event.body;
      const post = makeItem({
        id: event.postId, title: event.title, sender: event.account, body: postBody,
        richText: postBody, time: event.time, kind: "post",
        likes: event.likes, comments: event.comments,
        meta: {
          handle: event.handle, verified: "true", reposts: String(event.reposts),
          views: event.eventId === "X001" ? "68.4万" : event.eventId === "X002" ? "326万" : "248万",
          translation: event.translation, storyEventId: event.eventId,
        }
      });
      posts.push(post);
      queue.push({ ...post, meta: { ...post.meta, notificationAppId: "twitter", notificationPostId: post.id } });
      added.push({
        eventId: event.eventId,
        triggeredByNode: event.triggeredByNodes.find(node => deliveredNodes.has(node)) || event.triggeredByNodes[0],
        postId: event.postId, deliveredAt: Date.now(), notificationDelivered: false,
      });
    }
    if (!added.length) return;
    update({
      ...current,
      messages: { ...current.messages, twitter: posts },
      ui: { ...current.ui, kakao: {
        ...ui,
        ...Object.fromEntries(added.map(event => ["x-event-" + event.eventId + "-created", true])),
        "story-x-events": JSON.stringify([...events, ...added]),
        "global-notification-queue": JSON.stringify(queue),
      } }
    });
  }, [ready, creator, s.messages.kakao, s.ui?.kakao?.["story-x-events"], s.ui?.kakao?.["global-notification-queue"]]);

  useEffect(() => {
    if (!ready || creator || !selectedBoyfriend) return;
    const current = runtimeRef.current;
    const ui = current.ui?.kakao || {};
    if (!/^E0[1-8]$/.test(String(ui["romance-result"] || "")) || !/_END$/.test(String(ui["romance-node"] || "")) || ui["boyfriend-stage2-started"] === true) return;
    let pending: Array<{item?: Item; deliverAt?: number}> = [];
    try { pending = JSON.parse(String(ui["delivery-queue"] || "[]")); } catch { pending = []; }
    if (pending.some(entry => entry.item?.title === selectedBoyfriend)) return;
    const due = Number(ui["boyfriend-stage2-trigger-at"] || 0);
    if (!due) {
      update({ ...current, ui: { ...current.ui, kakao: { ...ui, "boyfriend-stage2-trigger-at": String(Date.now() + 90_000) } } });
      return;
    }
    const timer = window.setTimeout(() => {
      const latest = runtimeRef.current;
      const latestUi = latest.ui?.kakao || {};
      if (latestUi["boyfriend-stage2-started"] === true) return;
      const existing = latest.messages.kakao ?? [];
      if (existing.some(item => item.id === "boyfriend-stage2-K046-0")) return;
      const node = getBoyfriendStage2Node("K046");
      if (!node) return;
      const result = String(latestUi["romance-result"] || "");
      const openings: Record<string, string[]> = {
        E03: ["我知道我们前几天说好先给彼此一点空间。","这几天我没有想用沉默逼你做决定。","今天有新的消息，我想先问你愿不愿意听我说。","如果你现在还不想谈，我也会尊重。"],
        E04: ["我和团员谈过了。","有些问题还没有答案，但至少大家开始把担心说出来。","我想把今天的进展告诉你。","你现在方便听我说吗？"],
        E05: ["我知道之前的隐瞒还没有过去。","我不会假装只要事情有新进展，你就应该立刻相信我。","但今天发生了一些变化，我想如实告诉你。","你可以按自己的节奏回应。"],
        E06: ["我记得我们说过要重新想一想未来。","我没有把这段时间当成你必须等我的理由。","只是有新的事情需要让你知道。","如果你还没有准备好，我们也可以慢慢来。"],
        E07: ["那天的见面最后还是改了安排。","我有点遗憾，但很庆幸我们没有为了见面冒险。","今天工作上又有了新的变化。","我想先和你确认再继续说。"],
        E08: ["我把之前没有告诉你的线索重新整理了一遍。","这次我不想再让你从别人那里听到消息。","今天团队和公司的情况也有了变化。","我会把我知道的部分讲清楚。"],
      };
      const openingLines = openings[result] || node.lines;
      const first = makeItem({ id: "boyfriend-stage2-K046-0", title: selectedBoyfriend, sender: selectedBoyfriend, avatar: boyfriendAvatarPath(selectedBoyfriend), body: openingLines[0], time: latest.time || displayTime, outgoing: false, read: false, meta: { boyfriendStage2Node: "K046" } });
      const start = Date.now();
      const queued = openingLines.slice(1).map((body, index) => {
        const item = makeItem({ id: "boyfriend-stage2-K046-" + (index + 1), title: selectedBoyfriend, sender: selectedBoyfriend, avatar: boyfriendAvatarPath(selectedBoyfriend), body, time: latest.time || displayTime, outgoing: false, read: false, meta: { boyfriendStage2Node: "K046" } });
        const typingAt = start + index * 5000 + 2000;
        return { item, typingAt, deliverAt: typingAt + 3000 };
      });
      let queue: Array<{item: Item; typingAt: number; deliverAt: number}> = [];
      try { queue = JSON.parse(String(latestUi["delivery-queue"] || "[]")); } catch { queue = []; }
      update({ ...latest, messages: { ...latest.messages, kakao: [...existing, first] },
        notifications: app === "kakao" ? latest.notifications : [...latest.notifications, `KakaoTalk: ${selectedBoyfriend}：${first.body}`],
        ui: { ...latest.ui, kakao: { ...latestUi, "boyfriend-stage2-started": true, "boyfriend-stage2-node": "K046", "boyfriend-stage2-history": "[]", "boyfriend-stage2-trigger-at": "", "delivery-queue": JSON.stringify([...queue, ...queued]) } }
      });
    }, Math.max(0, due - Date.now()));
    return () => window.clearTimeout(timer);
  }, [ready, creator, selectedBoyfriend, app, s.ui?.kakao?.["romance-result"], s.ui?.kakao?.["romance-node"], s.ui?.kakao?.["boyfriend-stage2-started"], s.ui?.kakao?.["boyfriend-stage2-trigger-at"], s.ui?.kakao?.["delivery-queue"]]);

  useEffect(() => {
    if (!ready || creator) return;
    const currentUi = runtimeRef.current.ui?.kakao || {};
    const memberId = String(currentUi["secret-admirer-member-id"] || "");
    const triggerAt = Number(currentUi["secret-admirer-trigger-at"] || 0);
    if (!memberId || !triggerAt || currentUi["secret-admirer-story-started"] === true) return;
    const member = ALD1_SECRET_ADMIRER_MEMBERS.find((entry) => entry.id === memberId);
    if (!member) return;
    const remaining = Math.max(0, triggerAt - Date.now());
    const timer = window.setTimeout(() => {
      const latest = runtimeRef.current;
      const latestUi = latest.ui?.kakao || {};
      if (latestUi["secret-admirer-story-started"] === true) return;
      const messages = latest.messages.kakao ?? [];
      const existingOpening = messages.some((item) => item.id === "secret-admirer-A001-0");
      if (existingOpening) {
        update({ ...latest, ui: { ...latest.ui, kakao: { ...latestUi, "secret-admirer-story-started": true, "secret-admirer-story-node": "A001" } } });
        return;
      }
      const node = getSecretAdmirerNode("A001");
      if (!node) return;
      const avatar = import.meta.env.BASE_URL + "kakao/" + member.avatarFile;
      const teamConflictMemberId = String(latestUi["team-conflict-member-id"] || "");
      const teamConflictMember = ALD1_SECRET_ADMIRER_MEMBERS.find((entry) => entry.id === teamConflictMemberId);
      const teamConflictOpening = teamConflictMember && !messages.some((item) => item.id === "team-conflict-B001-0")
        ? getTeamConflictNode("B001")
        : undefined;
      const teamConflictFirst = teamConflictMember && teamConflictOpening ? makeItem({
        id: "team-conflict-B001-0",
        title: teamConflictMember.name,
        sender: teamConflictMember.name,
        avatar: import.meta.env.BASE_URL + "kakao/" + teamConflictMember.avatarFile,
        body: teamConflictOpening.lines[0],
        time: latest.time || displayTime,
        outgoing: false,
        read: false,
        meta: { teamConflictNode: "B001" },
      }) : undefined;
      const first = makeItem({
        id: "secret-admirer-A001-0",
        title: member.name,
        sender: member.name,
        avatar,
        body: node.lines[0],
        time: latest.time || displayTime,
        outgoing: false,
        read: false,
        meta: { secretAdmirerNode: "A001" },
      });
      const start = Date.now();
      const queued = node.lines.slice(1).map((body, index) => {
        const item = makeItem({
          id: "secret-admirer-A001-" + (index + 1),
          title: member.name,
          sender: member.name,
          avatar,
          body,
          time: latest.time || displayTime,
          outgoing: false,
          read: false,
          meta: { secretAdmirerNode: "A001" },
        });
        const typingAt = start + index * 5_000 + 2_000;
        return { item, typingAt, deliverAt: typingAt + 3_000 };
      });
      let existingQueue: Array<{ item: Item; typingAt: number; deliverAt: number }> = [];
      try { existingQueue = JSON.parse(String(latestUi["delivery-queue"] || "[]")); } catch { existingQueue = []; }
      update({
        ...latest,
        messages: { ...latest.messages, kakao: [...messages, first, ...(teamConflictFirst ? [teamConflictFirst] : [])] },
        notifications: app === "kakao" ? latest.notifications : [
          ...latest.notifications,
          `KakaoTalk: ${member.name}：${first.body}`,
          ...(teamConflictFirst ? [`KakaoTalk: ${teamConflictMember?.name}：${teamConflictFirst.body}`] : []),
        ],
        ui: { ...latest.ui, kakao: {
          ...latestUi,
          "secret-admirer-story-started": true,
          "secret-admirer-story-node": "A001",
          "secret-admirer-completed-nodes": "[]",
          ...(teamConflictFirst ? {
            "team-conflict-story-started": true,
            "team-conflict-story-node": "B001",
            "team-conflict-completed-nodes": "[]",
            "team-conflict-history": "[]",
          } : {}),
          "delivery-queue": JSON.stringify([...existingQueue, ...queued]),
        } },
      });
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [ready, creator, app, s.ui?.kakao?.["secret-admirer-member-id"], s.ui?.kakao?.["secret-admirer-trigger-at"], s.ui?.kakao?.["secret-admirer-story-started"]]);

  useEffect(() => {
    if (!ready || !friendStoryTriggered || !selectedFriend) return;
    const outcome = String(s.ui?.kakao?.["friend-story-outcome"] || "");
    const isCare = outcome === "H09" && s.ui?.kakao?.["friend-story-care-sent"] !== true;
    const isReconnect = outcome === "H04" && s.ui?.kakao?.["friend-story-reconnect-sent"] !== true;
    if (!isCare && !isReconnect) return;
    const dueAt = Number(isCare ? s.ui?.kakao?.["friend-story-care-due-at"] : s.ui?.kakao?.["friend-story-reconnect-due-at"]);
    if (!Number.isFinite(dueAt) || dueAt <= 0) return;
    const timer = window.setTimeout(() => {
      const current = runtimeRef.current;
      const currentUi = current.ui?.kakao || {};
      const care = outcome === "H09";
      const sentKey = care ? "friend-story-care-sent" : "friend-story-reconnect-sent";
      if (currentUi[sentKey] === true) return;
      const prefix = care ? "friend-story-followup-H09-" : "friend-story-followup-H04-";
      const existing = current.messages.kakao ?? [];
      if (existing.some(item => item.id === prefix + "0")) return;
      const files: Record<string, string> = {
        "周安信": "周安信-kakao.png", "张家豪": "張家豪-kakao.png",
        "李理悟": "李理悟-kakao-v2.jpg", "李相沅": "李相沅-kakao.png",
        "贺鑫隆": "賀鑫隆-kakao.png", "郑相炫": "鄭相炫-kakao.png",
        "金俊抒": "金俊抒-kakao.png", "金虔佑": "金虔佑-kakao.png",
      };
      const avatar = files[selectedFriend] ? import.meta.env.BASE_URL + "kakao/" + files[selectedFriend] : "";
      const lines = care
        ? ["我刚刚去看过他了。", "他现在比刚才冷静一点。", "但他问我，你是不是还在生他的气。"]
        : ["昨天的事，我想了很久。", "我不想因为一次争执就失去你这个朋友。", "如果你愿意，我们可以重新把话说开。"];
      const first = makeItem({ id: prefix + "0", title: selectedFriend, sender: selectedFriend, avatar, body: lines[0], time: current.time || displayTime, outgoing: false, read: false });
      const now = Date.now();
      const queue = lines.slice(1).map((body, index) => {
        const item = makeItem({ id: prefix + (index + 1), title: selectedFriend, sender: selectedFriend, avatar, body, time: current.time || displayTime, outgoing: false, read: false });
        const typingAt = now + index * 5000 + 2000;
        return { item, typingAt, deliverAt: typingAt + 3000 };
      });
      let currentQueue: Array<{item: Item; typingAt: number; deliverAt: number}> = [];
      try { currentQueue = JSON.parse(String(currentUi["delivery-queue"] || "[]")); } catch { currentQueue = []; }
      update({
        ...current,
        messages: { ...current.messages, kakao: [...existing, first] },
        notifications: [...current.notifications, `KakaoTalk: ${selectedFriend}：${first.body}`],
        ui: { ...current.ui, kakao: { ...currentUi, [sentKey]: true, "friend-story-node": care ? "F070" : "F071", "delivery-queue": JSON.stringify([...currentQueue, ...queue]) } },
      });
    }, Math.max(0, dueAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [ready, friendStoryTriggered, selectedFriend, s.ui?.kakao?.["friend-story-outcome"], s.ui?.kakao?.["friend-story-care-due-at"], s.ui?.kakao?.["friend-story-reconnect-due-at"], s.ui?.kakao?.["friend-story-care-sent"], s.ui?.kakao?.["friend-story-reconnect-sent"]]);
  useEffect(() => {
    if (!ready || creator || s.ui?.kakao?.["friend-story-phase2-x-posted"] === true) return;
    const dueAt = Number(s.ui?.kakao?.["friend-story-phase2-x-due-at"] || 0);
    if (!Number.isFinite(dueAt) || dueAt <= 0) return;
    const timer = window.setTimeout(() => {
      const latest = runtimeRef.current;
      const ui = latest.ui?.kakao || {};
      if (ui["friend-story-phase2-x-posted"] === true) return;
      const posts = [...(latest.messages.twitter || [])];
      if (posts.some(post => post.id === "friend-phase2-X001")) return;
      const comments = [
        "@bluehour_8m：如果是真的，希望先把完整对话放出来，不要继续断章取义。",
        "@orbitallyz_4q：不喜欢这段恋情也不代表可以公开别人的私人聊天。",
        "@nightletter_2p：她是不是说过这句话？我想看前后文。",
        "@teamfirst_7v：现在连其他成员也被牵扯进来，真的够了。",
        "@softpetal_3n：请停止转发未经证实的截图。",
        "@duskarchive_6r：如果有证据就交给公司和法律渠道，不要人肉。",
        "@silverorbit_9k：我很生气，但不支持去骚扰任何当事人。",
        "@moonfilm_5x：希望 Wake One 能说明如何保护当事人的隐私。",
      ];
      const post = makeItem({
        id: "friend-phase2-X001",
        title: "独家后续：私人对话或有更多内容",
        sender: "@inside_line_27",
        body: "独家后续：ALD1 成员女友与友人的私人对话曝光，知情人士称还有更多内容。",
        time: latest.time || displayTime,
        kind: "post",
        folder: "主页",
        likes: 18600,
        comments,
        meta: { handle: "inside_line_27", verified: "false", reposts: "2840", views: "52.8万", storyEventId: "FRIEND_PHASE2_X001" },
      });
      const friend = selectedFriend || "";
      const files: Record<string, string> = {
        "周安信": "周安信-kakao.png", "张家豪": "張家豪-kakao.png",
        "李理悟": "李理悟-kakao-v2.jpg", "李相沅": "李相沅-kakao.png",
        "贺鑫隆": "賀鑫隆-kakao.png", "郑相炫": "鄭相炫-kakao.png",
        "金俊抒": "金俊抒-kakao.png", "金虔佑": "金虔佑-kakao.png",
      };
      const avatar = files[friend] ? import.meta.env.BASE_URL + "kakao/" + files[friend] : "";
      const node = getFriendPhase2Node("F2_075");
      if (!node) return;
      const existing = latest.messages.kakao || [];
      const firstLine = node.lines[0];
      const first = makeItem({ id: "friend-phase2-F2_075-0", title: friend, sender: friend, avatar, body: firstLine, time: latest.time || displayTime, outgoing: false, read: false, meta: { friendPhase2Node: "F2_075" } });
      const now = Date.now();
      const queued = node.lines.slice(1).map((body, index) => {
        const item = makeItem({ id: "friend-phase2-F2_075-" + (index + 1), title: friend, sender: friend, avatar, body, time: latest.time || displayTime, outgoing: false, read: false, meta: { friendPhase2Node: "F2_075" } });
        const typingAt = now + index * 5000 + 2000;
        return { item, typingAt, deliverAt: typingAt + 3000 };
      });
      let delivery: Array<{ item: Item; typingAt: number; deliverAt: number }> = [];
      let globalQueue: Item[] = [];
      try { delivery = JSON.parse(String(ui["delivery-queue"] || "[]")); } catch { delivery = []; }
      try { globalQueue = JSON.parse(String(ui["global-notification-queue"] || "[]")); } catch { globalQueue = []; }
      const notice = { ...post, meta: { ...post.meta, notificationAppId: "twitter", notificationPostId: post.id } };
      update({
        ...latest,
        messages: { ...latest.messages, twitter: [...posts, post], kakao: [...existing, first] },
        ui: { ...latest.ui, kakao: {
          ...ui,
          "friend-story-phase2-x-posted": true,
          "friend-story-phase2-node": "F2_075",
          "delivery-queue": JSON.stringify([...delivery, ...queued]),
          "global-notification-queue": JSON.stringify([...globalQueue, notice]),
        } },
      });
    }, Math.max(0, dueAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [ready, creator, selectedFriend, s.ui?.kakao?.["friend-story-phase2-x-due-at"], s.ui?.kakao?.["friend-story-phase2-x-posted"]]);

  const dismissNotice = (index: number) =>
    update({
      ...runtimeRef.current,
      notifications: runtimeRef.current.notifications.filter(
        (_, i) => i !== index,
      ),
    });
  if (!ready) return <div className="phone-loading">正在恢复进度…</div>;
  return (
    <div
      ref={shell}
      style={{ "--phone-scale": deviceScale } as CSSProperties}
      className={`phone-shell ios18 ${work.phone.theme === "dark" ? "dark-phone" : ""}`}
    >
      <KeyboardContext.Provider value={setKeyboard}>
        <div
          className={`phone-screen wallpaper-${work.phone.wallpaper} ${locked ? "is-locked" : ""} ${app ? "in-app" : ""} ${keyboard ? "keyboard-open" : ""}`}
          style={{
            "--custom-wallpaper": `url("${import.meta.env.BASE_URL}lockscreen-wallpaper.jpg.jpg")`,
            backgroundImage: `url("${import.meta.env.BASE_URL}home-screen-wallpaper.jpg.jpg?v=20261030-3")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#d9cfc5",
          } as CSSProperties}
          data-app={app}
          onDragStart={(e) => e.preventDefault()}
          onPointerDown={(e) => {
            gestureConsumed.current = false;
            const button = (e.target as HTMLElement).closest<HTMLElement>(
              "[data-app-id]",
            );
            if (button) {
              pressTimer.current = setTimeout(() => {
                gestureConsumed.current = true;
                setContextApp(button.dataset.appId || "");
              }, 550);
            }
            const box = e.currentTarget.getBoundingClientRect(),
              x = (e.clientX - box.left) / deviceScale,
              y = (e.clientY - box.top) / deviceScale;
            gesture.current = {
              x,
              y,
              time: Date.now(),
              zone: y < 58 ? "top" : y > 818 ? "bottom" : locked ? "lock" : "",
            };
          }}
          onPointerMove={(e) => {
            if (Math.abs(e.movementX) > 5 || Math.abs(e.movementY) > 5)
              clearTimeout(pressTimer.current);
          }}
          onPointerCancel={() => clearTimeout(pressTimer.current)}
          onPointerUp={(e) => {
            clearTimeout(pressTimer.current);
            const box = e.currentTarget.getBoundingClientRect(),
              y = (e.clientY - box.top) / deviceScale,
              g = gesture.current;
            const dy = y - g.y;
            if (g.zone === "top" && dy > 65)
              setPanel(g.x > 230 ? "control" : "notification");
            else if ((g.zone === "bottom" || g.zone === "lock") && dy < -55) {
              gestureConsumed.current = true;
              if (!locked) captureApp();
              setKeyboard(false);
              if (panel) {
                setPanel("");
              } else if (locked) {
                beginUnlock();
              } else if (g.zone === "bottom" && Date.now() - g.time > 450) {
                captureApp();
                setPanel("switcher");
              } else {
                setApp("");
                setPanel("");
                setFolder("");
              }
            }
          }}
          onClickCapture={(e) => {
            const target = (e.target as HTMLElement).closest(
              ".home-app-grid button,.dock button",
            );
            if (target) {
              setLaunchOrigin(
                readLauncherOrigin(target as HTMLElement, e.currentTarget),
              );
            }
          }}
        >
          <div className="wallpaper-orb orb-one" />
          <div className="wallpaper-orb orb-two" />
          <div className="status-bar">
            <button
              onClick={() =>
                setPanel(panel === "notification" ? "" : "notification")
              }
              className="status-time"
              aria-label="通知中心"
            >
              {displayTime}
              <StatusGlyph kind="silent" />
            </button>
            <div className="dynamic-island" />
            <button
              className="signals"
              onClick={() => setPanel(panel === "control" ? "" : "control")}
              aria-label="控制中心"
            >
              <StatusGlyph kind="cellular" />
              <StatusGlyph kind="wifi" />
              <span
                className={`ios-battery${work.phone.battery <= 20 ? " low-battery" : ""}`}
              >
                <span style={{ width: `${work.phone.battery}%` }} />
                <b>{work.phone.battery}</b>
              </span>
            </button>
          </div>
          <GlobalNotificationBanner
            item={globalNotificationItem}
            onDismiss={() => {
              const dismissed = globalNotificationItem;
              setGlobalNotificationItem(null);
              if (dismissed?.id === "ig-backlash-60") {
                const current = runtimeRef.current;
                const currentUi = current.ui?.kakao || {};
                if (!currentUi["ig-backlash-notifications-finished-at"]) update({ ...current, ui: { ...current.ui, kakao: { ...currentUi, "ig-backlash-notifications-finished-at": String(Date.now()) } } });
              }
            }}
            onOpen={(item) => {
              setGlobalNotificationItem(null);
              if (item.meta?.notificationAppId === "instagram") {
                const current = runtimeRef.current;
                update({ ...current, ui: { ...current.ui, instagram: { ...current.ui?.instagram, "ig-open-id": String(item.meta.notificationMessageId || item.id), mymyTab: "私信" } } });
                open("instagram");
                return;
              }
              if (item.meta?.notificationAppId === "threads") {
                setTargetThreadsPostId(String(item.meta.notificationPostId || ""));
                setTargetThreadsReplyId(String(item.meta.notificationReplyId || ""));
                open("threads");
                return;
              }
              if (item.meta?.notificationAppId === "twitter") {
                setTargetXPostId(String(item.meta.notificationPostId || item.id));
                open("twitter");
                return;
              }
              activeKakaoThread.current = item.title;
              setTargetKakaoThread(item.title);
              open("kakao");
            }}
          />
          <AnimatePresence mode="wait">
            {locked && !(quickCamera && app === "camera") ? (
              <DeviceLock
                work={
                  s.date
                    ? { ...work, phone: { ...work.phone, date: s.date } }
                    : work
                }
                time={displayTime}
                notices={locked ? [] : s.notifications}
                onDismiss={dismissNotice}
                pinOpen={pinOpen}
                setPinOpen={setPinOpen}
                error={pinError}
                onUnlock={unlock}
                onLight={() => setPanel("light")}
                onCamera={() => {
                  setQuickCamera(true);
                  open("camera");
                }}
              />
            ) : app && app !== "appstore" ? (
              <AppWindow
                key={app}
                className={`app-screen engine-${plugin.engine} skin-${app}`}
                creator={creator}
                origin={launchOrigin}
              >
                <AppContent
                  app={plugin}
                  name={
                    work.apps.find((a) => a.id === app)?.name ?? plugin.name
                  }
                  items={[
                    ...normalizeStoryItems(work.data[app] ?? [], work.phone.date || "2026-10-25", s.gameClock?.timezone || "Asia/Seoul"),
                    ...(s.messages[app] ?? []),
                  ]}
                  creator={creator}
                  state={s}
                  onRead={(id) => {
                    const current = runtimeRef.current;
                    if (!(current.messages.mail ?? []).some((item) => item.id === id))
                      event("read", id);
                    if ((current.messages.instagram ?? []).some((item) => item.id === id)) {
                      update({ ...current, messages: { ...current.messages, instagram: (current.messages.instagram ?? []).map((item) => item.id === id ? { ...item, read: true } : item) } });
                    } else if ((current.messages.kakao ?? []).some((item) => item.id === id)) {
                      update({ ...current, messages: { ...current.messages, kakao: (current.messages.kakao ?? []).map((item) => item.id === id ? { ...item, read: true } : item) } });
                    } else if ((current.messages.mail ?? []).some((item) => item.id === id)) {
                      update({ ...current, messages: { ...current.messages, mail: (current.messages.mail ?? []).map((item) => item.id === id ? { ...item, read: true } : item) } });
                    }
                  }}
                  onEdit={(item) => onEdit?.(app, item)}
                  onAdd={() => onAdd?.(app)}
                  onBack={() => setApp("")}
                  onSettings={onSettings}
                  onSaveProgress={onSaveProgress}
                  onRestartGame={onRestartGame}
                  savedAt={savedAt}
                  onUi={(key, value) => {
                    const current = runtimeRef.current;
                    update(
                      dispatch(
                        work,
                        {
                          ...current,
                          ui: {
                            ...current.ui,
                            [app]: { ...current.ui?.[app], [key]: value },
                          },
                        },
                        "variable",
                        `ui:${app}:${key}`,
                      ),
                    );
                  }}
                  work={work}
                  selectedBoyfriend={selectedBoyfriend}
                  selectedFriend={selectedFriend}
                  initialKakaoThread={targetKakaoThread}
                  targetXPostId={targetXPostId}
                  onTargetXPostHandled={() => setTargetXPostId("")}
                  targetThreadsPostId={targetThreadsPostId}
                  targetThreadsReplyId={targetThreadsReplyId}
                  onTargetThreadsPostHandled={() => { setTargetThreadsPostId(""); setTargetThreadsReplyId(""); }}
                  onInstagramReply={(conversation, replyText) => {
                    const current = runtimeRef.current;
                    const threadsUi = current.ui?.threads || {};
                    if (threadsUi["threads-backlash-event-id"] === "threads-backlash-after-first-ig-reply") return;
                    const replyMessage = makeItem({
                      id: "ig-player-reply-" + Date.now(),
                      title: conversation.title,
                      sender: "allyz_1101",
                      body: replyText,
                      time: current.time || displayTime,
                      outgoing: true,
                      read: true,
                      meta: { conversationId: conversation.id, platform: "instagram" },
                    });
                    const evidence: InstagramReplyEvidence = {
                      conversationId: conversation.id,
                      attackerUserId: conversation.meta?.userId || conversation.id,
                      attackerHandle: conversation.sender,
                      attackerMessageId: conversation.id,
                      playerReplyMessageId: replyMessage.id,
                      attackerText: conversation.body,
                      playerReplyText: replyText,
                      capturedAt: Date.now(),
                    };
                    const x002 = hasThreadsX002(current.messages.twitter || []);
                    const posts = makeThreadsBacklash(selectedBoyfriend || "ALPHA DRIVE ONE", evidence, current.time || displayTime, x002);
                    const notice = makeItem({
                      id: "threads-backlash-notification",
                      title: "Threads",
                      sender: "Threads",
                      body: "Threads上出现了大量关于" + (selectedBoyfriend || "ALPHA DRIVE ONE") + "恋情的讨论。",
                      time: current.time || displayTime,
                      meta: { notificationAppId: "threads", eventId: "threads-backlash-after-first-ig-reply" },
                    });
                    const kakaoUi = current.ui?.kakao || {};
                    let pendingNotifications: Item[] = [];
                    try { pendingNotifications = JSON.parse(String(kakaoUi["global-notification-queue"] || "[]")); } catch { pendingNotifications = []; }
                    if (!pendingNotifications.some((item) => item.id === notice.id)) pendingNotifications.push(notice);
                    update({
                      ...current,
                      messages: {
                        ...current.messages,
                        instagram: [...(current.messages.instagram || []), replyMessage],
                        threads: [...(current.messages.threads || []), ...posts],
                      },
                      ui: {
                        ...current.ui,
                        kakao: { ...kakaoUi, "global-notification-queue": JSON.stringify(pendingNotifications.slice(-40)) },
                        threads: {
                          ...threadsUi,
                          "threads-backlash-event-id": "threads-backlash-after-first-ig-reply",
                          "threads-backlash-evidence": JSON.stringify(evidence),
                          "threads-backlash-initialized-at": String(evidence.capturedAt),
                        },
                      },
                    });
                  }}
                  onKakaoThreadChange={(thread) => { activeKakaoThread.current = thread; if (targetKakaoThread) setTargetKakaoThread(""); }}
                  onKakaoChoice={(character, playerText, reply, followUpReply, choiceId) => {
                    const current = runtimeRef.current;
                    const currentMessages = current.messages as Runtime["messages"];
                    const existing = currentMessages.kakao ?? [];
                    const currentUi = current.ui?.kakao ?? {};
                    const time = current.time || displayTime;
                    const stamp = Date.now();
                    const files: Record<string, string> = {
                      "周安信": "周安信-kakao.png", "张家豪": "張家豪-kakao.png",
                      "李理悟": "李理悟-kakao-v2.jpg", "李相沅": "李相沅-kakao.png",
                      "贺鑫隆": "賀鑫隆-kakao.png", "郑相炫": "鄭相炫-kakao.png",
                      "金俊抒": "金俊抒-kakao.png", "金虔佑": "金虔佑-kakao.png",
                    };
                    const avatar = files[character] ? import.meta.env.BASE_URL + "kakao/" + files[character] : "";
                    const readQueue = () => {
                      try { return JSON.parse(String(currentUi["delivery-queue"] || "[]")) as Array<{ item: Item; typingAt: number; deliverAt: number }>; }
                      catch { return []; }
                    };
                    const currentQueue = readQueue();
                    const queueLines = (bodies: string[], prefix: string, afterQueue = currentQueue) => {
                      const sameThreadQueue = afterQueue.filter((entry) => entry.item.title === character);
                      let cursor = Math.max(stamp, ...sameThreadQueue.map((entry) => entry.deliverAt));
                      return bodies.map((body, index) => {
                        const item = makeItem({
                          id: prefix + "-" + index,
                          title: character,
                          sender: character,
                          avatar,
                          body,
                          time,
                          outgoing: false,
                          read: false,
                        });
                        const typingAt = cursor + 2000;
                        const deliverAt = cursor + 5000;
                        cursor = deliverAt;
                        return { item, typingAt, deliverAt };
                      });
                    };
                    if (choiceId?.startsWith("boyfriend-stage2:")) {
                      const [, nodeId, choiceKey] = choiceId.split(":");
                      const activeNodeId = String(currentUi["boyfriend-stage2-node"] || "");
                      if (character !== selectedBoyfriend || nodeId !== activeNodeId) return;
                      const choice = getBoyfriendStage2Choice(nodeId, choiceKey);
                      if (!choice) return;
                      let history: string[] = [];
                      try { history = JSON.parse(String(currentUi["boyfriend-stage2-history"] || "[]")); } catch { history = []; }
                      const historyKey = nodeId + ":" + choiceKey;
                      if (history.includes(historyKey)) return;
                      const nextNode = getBoyfriendStage2Node(choice.next);
                      if (!nextNode) return;
                      const outgoing = makeItem({ id: "boyfriend-stage2-player-" + nodeId + "-" + choiceKey + "-" + stamp, title: character, sender: "我", body: choice.text, time, outgoing: true, read: true });
                      outgoing.meta = { ...outgoing.meta, unread: "1", unreadUntilAt: String(stamp + 2000), boyfriendStage2Node: nodeId, boyfriendStage2Choice: choiceKey };
                      const queued = queueLines(nextNode.lines, "boyfriend-stage2-" + nodeId + "-" + choiceKey).map(entry => ({ ...entry, item: { ...entry.item, meta: { ...entry.item.meta, boyfriendStage2Node: nextNode.id } } }));
                      const nextUi = { ...currentUi, "boyfriend-stage2-node": nextNode.id, "boyfriend-stage2-history": JSON.stringify([...history, historyKey]), "boyfriend-stage2-result": nextNode.result || String(currentUi["boyfriend-stage2-result"] || ""), "delivery-queue": JSON.stringify([...currentQueue, ...queued]) };
                      update({ ...current, messages: { ...currentMessages, kakao: [...existing, outgoing] }, ui: { ...current.ui, kakao: nextUi } });
                      return;
                    }
                    if (choiceId?.startsWith("team-conflict:")) {
                      const [, nodeId, choiceKey] = choiceId.split(":");
                      const activeNodeId = String(currentUi["team-conflict-story-node"] || "");
                      const memberId = String(currentUi["team-conflict-member-id"] || "");
                      const member = ALD1_SECRET_ADMIRER_MEMBERS.find((entry) => entry.id === memberId);
                      if (!member || character !== member.name || nodeId !== activeNodeId) return;
                      const storyChoice = getTeamConflictChoice(nodeId, choiceKey);
                      if (!storyChoice) return;
                      let history: string[] = [];
                      let completed: string[] = [];
                      try { history = JSON.parse(String(currentUi["team-conflict-history"] || "[]")); } catch { history = []; }
                      try { completed = JSON.parse(String(currentUi["team-conflict-completed-nodes"] || "[]")); } catch { completed = []; }
                      const historyKey = nodeId + ":" + choiceKey;
                      if (history.includes(historyKey)) return;
                      const nextNode = getTeamConflictNode(storyChoice.next);
                      if (!nextNode) return;
                      const outgoing = makeItem({ id: "team-conflict-player-" + nodeId + "-" + choiceKey + "-" + stamp, title: character, sender: "我", body: storyChoice.text, time, outgoing: true, read: true });
                      outgoing.meta = { ...outgoing.meta, unread: "1", unreadUntilAt: String(stamp + 2000), teamConflictNode: nodeId, teamConflictChoice: choiceKey };
                      const queued = queueLines(nextNode.lines, "team-conflict-" + nodeId + "-" + choiceKey);
                      update({
                        ...current,
                        messages: { ...currentMessages, kakao: [...existing, outgoing] },
                        ui: { ...current.ui, kakao: {
                          ...currentUi,
                          "team-conflict-story-node": nextNode.id,
                          "team-conflict-history": JSON.stringify([...history, historyKey]),
                          "team-conflict-completed-nodes": JSON.stringify([...new Set([...completed, nodeId])]),
                          "team-conflict-story-outcome": nextNode.result || String(currentUi["team-conflict-story-outcome"] || ""),
                          "delivery-queue": JSON.stringify([...currentQueue, ...queued]),
                        } },
                      });
                      return;
                    }
                    if (choiceId === "admirer:reconnect") {
                      const boundary = String(currentUi["secret-admirer-boundary"] || "");
                      const reconnectAt = Number(currentUi["secret-admirer-boundary-until-at"] || 0);
                      if (!["distance", "rejected"].includes(boundary) || !reconnectAt || stamp < reconnectAt) return;
                      const outgoing = makeItem({
                        id: "secret-admirer-reconnect-player-" + stamp,
                        title: character,
                        sender: "我",
                        body: "我想重新联系你。",
                        time,
                        outgoing: true,
                        read: true,
                      });
                      outgoing.meta = { ...outgoing.meta, unread: "1", unreadUntilAt: String(stamp + 2000), secretAdmirerReconnect: "true" };
                      const queued = queueLines(["……我没想到你会主动联系我。", "谢谢你愿意再给我一次自然相处的机会。", "我不会把这次重新联系，当成你已经答应了什么。"], "secret-admirer-reconnect-" + stamp);
                      update({
                        ...current,
                        messages: { ...currentMessages, kakao: [...existing, outgoing] },
                        ui: { ...current.ui, kakao: {
                          ...currentUi,
                          "secret-admirer-story-node": "A068",
                          "secret-admirer-story-outcome": "",
                          "secret-admirer-boundary": "open",
                          "secret-admirer-boundary-until-at": "",
                          "secret-admirer-player-interest": "reopened-by-player",
                          "secret-admirer-history": JSON.stringify([...(() => { try { return JSON.parse(String(currentUi["secret-admirer-history"] || "[]")) as string[]; } catch { return []; } })(), "reconnect:" + stamp]),
                          "delivery-queue": JSON.stringify([...currentQueue, ...queued]),
                        } },
                      });
                      return;
                    }
                    if (choiceId?.startsWith("admirer:")) {
                      const [, nodeId, choiceKey] = choiceId.split(":");
                      const activeNodeId = String(currentUi["secret-admirer-story-node"] || "");
                      if (nodeId !== activeNodeId || currentUi["secret-admirer-boundary"] === "distance" || currentUi["secret-admirer-boundary"] === "rejected") return;
                      const storyChoice = getSecretAdmirerChoice(nodeId, choiceKey);
                      if (!storyChoice) return;
                      let history: string[] = [];
                      let completed: string[] = [];
                      try { history = JSON.parse(String(currentUi["secret-admirer-history"] || "[]")); } catch { history = []; }
                      try { completed = JSON.parse(String(currentUi["secret-admirer-completed-nodes"] || "[]")); } catch { completed = []; }
                      const historyKey = nodeId + ":" + choiceKey;
                      if (history.includes(historyKey)) return;
                      const nextNode = getSecretAdmirerNode(storyChoice.next);
                      if (!nextNode) return;
                      const outgoing = makeItem({
                        id: "secret-admirer-player-" + nodeId + "-" + choiceKey + "-" + stamp,
                        title: character,
                        sender: "我",
                        body: storyChoice.text,
                        time,
                        outgoing: true,
                        read: true,
                      });
                      outgoing.meta = { ...outgoing.meta, unread: "1", unreadUntilAt: String(stamp + 2000), secretAdmirerNode: nodeId, secretAdmirerChoice: choiceKey };
                      const queued = queueLines(nextNode.lines, "secret-admirer-" + nodeId + "-" + choiceKey);
                      const outcome = nextNode.result || "";
                      const boundaryByOutcome: Record<string, string> = {
                        R01: "friends", R02: "comfort", R03: "distance", R04: "rejected",
                        R05: "pause", R06: "uncertain", R07: "protect-current",
                        R08: "mutual-interest", R09: "future-possibility", R10: "meeting-consideration",
                      };
                      const interestByOutcome: Record<string, string> = {
                        R01: "friendship", R02: "comfort", R03: "distance", R04: "no",
                        R05: "unknown", R06: "uncertain", R07: "protect-current",
                        R08: "yes", R09: "future", R10: "considering",
                      };
                      const affectionDelta = ["A009","A014","A025","A031","A034","A046","A050","A051","A053","A062","A064","A066","A068"].includes(nextNode.id) ? 1 : 0;
                      const jealousyDelta = ["A023","A024","A035","A041","A055","A059","A069"].includes(nextNode.id) ? 1 : 0;
                      const confessionKnown = currentUi["secret-admirer-confession-known"] === true || nextNode.id === "A032" || ["A033","A034","A035","A039","A048","A050","A052","A057","A063","A066","A069"].includes(nodeId);
                      update({
                        ...current,
                        messages: { ...currentMessages, kakao: [...existing, outgoing] },
                        ui: { ...current.ui, kakao: {
                          ...currentUi,
                          "secret-admirer-story-node": nextNode.id,
                          "secret-admirer-history": JSON.stringify([...history, historyKey]),
                          "secret-admirer-completed-nodes": JSON.stringify([...new Set([...completed, nodeId])]),
                          "secret-admirer-story-outcome": outcome || String(currentUi["secret-admirer-story-outcome"] || ""),
                          "secret-admirer-boundary": boundaryByOutcome[outcome] || String(currentUi["secret-admirer-boundary"] || "open"),
                          "secret-admirer-boundary-until-at": outcome === "R03" ? String(stamp + 7 * 24 * 60 * 60 * 1000) : outcome === "R04" ? String(stamp + 30 * 24 * 60 * 60 * 1000) : String(currentUi["secret-admirer-boundary-until-at"] || ""),
                          "secret-admirer-affection": Number(currentUi["secret-admirer-affection"] || 0) + affectionDelta,
                          "secret-admirer-jealousy": Number(currentUi["secret-admirer-jealousy"] || 0) + jealousyDelta,
                          "secret-admirer-confession-known": confessionKnown,
                          "secret-admirer-player-interest": interestByOutcome[outcome] || String(currentUi["secret-admirer-player-interest"] || "unknown"),
                          "delivery-queue": JSON.stringify([...currentQueue, ...queued]),
                        } },
                      });
                      return;
                    }
                    if (choiceId?.startsWith("friend-link:")) {
                      const [, linkType, linkKey] = choiceId.split(":");
                      const nodeId = String(currentUi["romance-node"] || "");
                      const usedKey = "friend-link-used-" + nodeId + "-" + linkType;
                      if (currentUi[usedKey] === true) return;
                      const responses: Record<string, Record<string, string[]>> = {
                        handoff: {
                          A: ["好，我们谈谈。", "我不想再让你从别人那里拼凑真相。"],
                          B: ["我会亲口告诉你。", "这次我不会再把你排除在外。"],
                          C: ["谢谢你愿意给我时间。", "我会整理好，再认真跟你说。"],
                        },
                        warning: {
                          A: ["……你已经知道了。", "是，几个星期前公司就提醒过我。", "我当时以为只要更小心，就不会影响到你。"],
                          B: ["我不是故意要瞒你。", "还有一些会议内容我没有整理好，但我会把和你有关的部分说清楚。"],
                          C: ["好。", "我不想再用沉默让你猜。", "等我把事情理清楚，我们好好谈。"],
                        },
                        sacrifice: {
                          A: ["你怎么会知道这件事？", "我确实问过经纪人，但那只是我在压力下提出的问题，还没有做决定。"],
                          B: ["我知道。", "我不想放弃舞台，也不想让你觉得自己成了我的负担。", "我们应该一起找办法。"],
                          C: ["你说得对。", "这件事会影响大家，我应该先听听团员怎么想。"],
                        },
                      };
                      const answer = responses[linkType]?.[linkKey];
                      if (!answer) return;
                      const outgoing = makeItem({ id: "kakao-friend-link-player-" + nodeId + "-" + linkType + "-" + linkKey + "-" + stamp, title: character, sender: "我", body: playerText, time, outgoing: true, read: true });
                      outgoing.meta = { ...outgoing.meta, unread: "1", unreadUntilAt: String(stamp + 2000), friendStoryLink: linkType };
                      const queued = queueLines(answer, "kakao-friend-link-reply-" + nodeId + "-" + linkType + "-" + linkKey);
                      let linkHistory: string[] = [];
                      try { linkHistory = JSON.parse(String(currentUi["friend-story-link-history"] || "[]")); } catch { linkHistory = []; }
                      update({ ...current, messages: { ...currentMessages, kakao: [...existing, outgoing] }, ui: { ...current.ui, kakao: { ...currentUi, [usedKey]: true, "friend-story-link-history": JSON.stringify([...linkHistory, nodeId + ":" + linkType + ":" + linkKey]), "delivery-queue": JSON.stringify([...currentQueue, ...queued]) } } });
                      return;
                    }
                    if (choiceId?.startsWith("friend-phase2:")) {
                      const [, nodeId, choiceKey] = choiceId.split(":");
                      const activeNodeId = String(currentUi["friend-story-phase2-node"] || "");
                      if (nodeId !== activeNodeId) return;
                      const node = getFriendPhase2Node(nodeId);
                      const choice = node?.choices.find(entry => entry.key === choiceKey);
                      if (!node || !choice) return;
                      let history: string[] = [];
                      let completed: string[] = [];
                      try { history = JSON.parse(String(currentUi["friend-story-phase2-history"] || "[]")); } catch { history = []; }
                      try { completed = JSON.parse(String(currentUi["friend-story-phase2-completed-nodes"] || "[]")); } catch { completed = []; }
                      const historyKey = nodeId + ":" + choiceKey;
                      if (history.includes(historyKey)) return;
                      let nextNode = getFriendPhase2Node(choice.next);
                      if (!nextNode) return;
                      let trust = Number(currentUi["friend-story-phase2-trust"] || 0);
                      let suspicion = Number(currentUi["friend-story-phase2-suspicion"] || 0);
                      let concealment = Number(currentUi["friend-story-phase2-concealment"] || 0);
                      if (nodeId === "F2_071" && choiceKey === "B") suspicion += 1;
                      if (nodeId === "F2_073" && choiceKey === "A") trust += 1;
                      if (nodeId === "F2_073" && choiceKey === "B") trust -= 1;
                      if (nodeId === "F2_073" && choiceKey === "C") trust -= 1;
                      if (nodeId === "F2_076" && choiceKey === "A") trust += 1;
                      if (nodeId === "F2_076" && choiceKey === "B") trust -= 1;
                      if (nodeId === "F2_076" && choiceKey === "C") concealment += 1;
                      if (nodeId === "F2_075" && choiceKey === "C") concealment += 1;
                      if (nodeId === "F2_080" && choiceKey === "B" && (trust <= -1 || suspicion >= 1 || concealment >= 1)) {
                        nextNode = getFriendPhase2Node("F2_087");
                      }
                      if (!nextNode) return;
                      const outgoing = makeItem({ id: "friend-phase2-player-" + nodeId + "-" + choiceKey + "-" + stamp, title: character, sender: "我", body: choice.text, time, outgoing: true, read: true });
                      outgoing.meta = { ...outgoing.meta, unread: "1", unreadUntilAt: String(stamp + 2000), friendPhase2Node: nodeId, friendPhase2Choice: choiceKey };
                      const renderedLines = nextNode.lines.map(line => line.replace(/\\{\\{BOYFRIEND_NAME\\}\\}/g, selectedBoyfriend || "他"));
                      const queued = nextNode.id === "F2_074" ? [] : queueLines(renderedLines, "friend-phase2-" + nodeId + "-" + choiceKey).map(entry => ({
                        ...entry,
                        item: { ...entry.item, meta: { ...entry.item.meta, friendPhase2Node: nextNode!.id } },
                      }));
                      const nextHistory = [...history, historyKey];
                      const nextCompleted = [...new Set([...completed, nodeId])];
                      const outcome = nextNode.result || String(currentUi["friend-story-phase2-outcome"] || "");
                      const nextUi: Record<string, unknown> = {
                        ...currentUi,
                        "friend-story-phase2-node": nextNode.id,
                        "friend-story-phase2-history": JSON.stringify(nextHistory),
                        "friend-story-phase2-completed-nodes": JSON.stringify(nextCompleted),
                        "friend-story-phase2-trust": trust,
                        "friend-story-phase2-suspicion": suspicion,
                        "friend-story-phase2-concealment": concealment,
                        "friend-story-phase2-outcome": outcome,
                        "friend-story-phase2-x-due-at": nextNode.id === "F2_074" ? String(stamp + 30 * 60 * 1000) : String(currentUi["friend-story-phase2-x-due-at"] || ""),
                        "friend-story-phase2-evidence-compared": nextNode.effect === "evidence-compared" || currentUi["friend-story-phase2-evidence-compared"] === true,
                        "friend-story-phase2-source-identified": nextNode.effect === "source-identified" || currentUi["friend-story-phase2-source-identified"] === true,
                        "friend-story-phase2-investigation-paused": nextNode.effect === "investigation-paused" || currentUi["friend-story-phase2-investigation-paused"] === true,
                        "friend-story-phase2-bf-informed": nodeId === "F2_080" && choiceKey === "C" ? true : currentUi["friend-story-phase2-bf-informed"] === true,
                        "friend-story-phase2-truth": outcome === "H20" ? "D" : currentUi["friend-story-phase2-evidence-compared"] === true || nextNode.effect === "evidence-compared" ? "B" : currentUi["friend-story-phase2-source-identified"] === true || nextNode.effect === "source-identified" ? "A" : currentUi["friend-story-phase2-investigation-paused"] === true || nextNode.effect === "investigation-paused" ? "C" : String(currentUi["friend-story-phase2-truth"] || "C"),
                        "friend-story-phase2-ended": Boolean(outcome),
                        "delivery-queue": JSON.stringify([...currentQueue, ...queued]),
                      };
                      let nextMessages = [...existing, outgoing];
                      if (nodeId === "F2_080" && choiceKey === "C" && selectedBoyfriend) {
                        const boyfriendText = "我想告诉你一件事：我的知心好友曾经为了帮我，向韩知恩求助并分享过一小部分私人聊天截图。现在网上流传的版本还有被加工的痕迹，我想和你一起确认事实。";
                        const informed = makeItem({ id: "friend-phase2-boyfriend-informed", title: selectedBoyfriend, sender: "我", body: boyfriendText, time, outgoing: true, read: true });
                        informed.meta = { ...informed.meta, friendPhase2Sync: "true" };
                        const alreadyInformed = (currentMessages.kakao || []).some(item => item.id === informed.id);
                        if (!alreadyInformed) nextMessages = [...nextMessages, informed];
                      }
                      let nextTwitter = [...(current.messages.twitter || [])];
                      let globalQueue: Item[] = [];
                      try { globalQueue = JSON.parse(String(currentUi["global-notification-queue"] || "[]")); } catch { globalQueue = []; }
                      if (nextNode.id === "F2_084" && !nextTwitter.some(post => post.id === "friend-phase2-X002")) {
                        const secondPost = makeItem({
                          id: "friend-phase2-X002", title: "友人承认曾向第三方提供私人对话资料",
                          sender: "@timeline_watch_09",
                          body: "ALD1 成员女友身边的友人承认，曾向第三方提供私人对话资料。相关截图仍有部分来源与传播过程未明。",
                          time, kind: "post", folder: "主页", likes: 9200,
                          comments: [
                            "@bluehour_8m：承认提供资料不等于承认公开爆料，先把事实分清楚。",
                            "@orbitallyz_4q：请不要去攻击任何一方的私人账号。",
                            "@nightletter_2p：现在最重要的是停止继续传播截图。",
                            "@teamfirst_7v：希望 Wake One 能处理隐私保护问题。",
                            "@softpetal_3n：没有完整证据前不要替任何人定罪。",
                            "@duskarchive_6r：朋友做错了也不代表可以网暴她。",
                            "@silverorbit_9k：请把焦点放在资料如何外流。",
                            "@moonfilm_5x：当事人有权利要求停止散播私人对话。",
                          ],
                          meta: { handle: "timeline_watch_09", verified: "false", reposts: "1360", views: "31.6万", storyEventId: "FRIEND_PHASE2_X002" },
                        });
                        nextTwitter = [...nextTwitter, secondPost];
                        globalQueue = [...globalQueue, { ...secondPost, meta: { ...secondPost.meta, notificationAppId: "twitter", notificationPostId: secondPost.id } }];
                      }
                      if (nodeId === "F2_080" && choiceKey === "C") {
                        nextUi["friend-story-phase2-boyfriend-notice-at"] = String(stamp);
                      }
                      update({
                        ...current,
                        messages: { ...currentMessages, kakao: nextMessages, twitter: nextTwitter },
                        ui: { ...current.ui, kakao: { ...nextUi, "global-notification-queue": JSON.stringify(globalQueue) } },
                      });
                      return;
                    }
                    if (choiceId?.startsWith("friend:")) {
                      const [, friendNodeId, friendChoiceKey] = choiceId.split(":");
                      const activeNodeId = String(currentUi["friend-story-node"] || "");
                      if (friendNodeId !== activeNodeId) return;
                      const friendChoice = getFriendStoryChoice(friendNodeId, friendChoiceKey);
                      if (!friendChoice) return;
                      let history: string[] = [];
                      let completed: string[] = [];
                      try { history = JSON.parse(String(currentUi["friend-story-history"] || "[]")); } catch { history = []; }
                      try { completed = JSON.parse(String(currentUi["friend-story-completed-nodes"] || "[]")); } catch { completed = []; }
                      const historyKey = friendNodeId + ":" + friendChoiceKey;
                      if (history.includes(historyKey)) return;
                      const nextNode = getFriendStoryNode(friendChoice.next);
                      if (!nextNode) return;
                      const outgoing = makeItem({ id: "kakao-friend-player-" + friendNodeId + "-" + friendChoiceKey + "-" + stamp, title: character, sender: "我", body: friendChoice.text, time, outgoing: true, read: true });
                      outgoing.meta = { ...outgoing.meta, unread: "1", unreadUntilAt: String(stamp + 2000), friendStoryNode: friendNodeId, friendStoryChoice: friendChoiceKey };
                      const queued = queueLines(nextNode.lines, "kakao-friend-" + friendNodeId + "-" + friendChoiceKey);
                      const outcome = nextNode.result || String(currentUi["friend-story-outcome"] || "");
                      const friendState = {
                        trust: Number(currentUi["friend-story-trust"] || 0) + (["F036","F046","F051","H01"].includes(nextNode.id) ? 1 : 0),
                        conflict: nextNode.id === "H04" || nextNode.id === "H10" || nextNode.id === "H06" ? true : currentUi["friend-story-conflict"] === true,
                        teamConcern: ["F006","F014","F019","F020","F037","F040","F042","H02","H05"].includes(nextNode.id) || currentUi["friend-story-team-concern"] === true,
                        secretLevel: ["F009","F026","F027","F028","F031","F056","F057","F058","F060","F069"].includes(nextNode.id) ? Math.max(1, Number(currentUi["friend-story-secret-level"] || 0)) : Number(currentUi["friend-story-secret-level"] || 0),
                      };
                      const nextUi = {
                        ...currentUi,
                        "friend-story-node": nextNode.id,
                        "friend-story-history": JSON.stringify([...history, historyKey]),
                        "friend-story-completed-nodes": JSON.stringify([...new Set([...completed, friendNodeId])]),
                        "friend-story-last-choice": historyKey,
                        "friend-story-outcome": outcome,
                        "friend-story-care-due-at": nextNode.id === "H09" ? String(stamp + 5 * 60 * 1000) : String(currentUi["friend-story-care-due-at"] || ""),
                        "friend-story-reconnect-due-at": nextNode.id === "H04" ? String(stamp + 24 * 60 * 60 * 1000) : String(currentUi["friend-story-reconnect-due-at"] || ""),
                        "friend-story-trust": friendState.trust,
                        "friend-story-conflict": friendState.conflict,
                        "friend-story-team-concern": friendState.teamConcern,
                        "friend-story-secret-level": friendState.secretLevel,
                        "friend-story-knows-warning": ["F009","F026","F027","F031"].includes(nextNode.id) || currentUi["friend-story-knows-warning"] === true,
                        "friend-story-knows-sacrifice": ["F028","F060","H11"].includes(nextNode.id) || currentUi["friend-story-knows-sacrifice"] === true,
                        "friend-story-promised-secrecy": nextNode.id === "H10" ? true : currentUi["friend-story-promised-secrecy"] === true,
                        "friend-story-knows-player-intent": ["H07","H08","H12"].includes(nextNode.id) ? nextNode.id : String(currentUi["friend-story-knows-player-intent"] || ""),
                        "friend-story-handoff": ["H07","H09","H11","H12"].includes(nextNode.id) ? nextNode.id : String(currentUi["friend-story-handoff"] || ""),
                        "delivery-queue": JSON.stringify([...currentQueue, ...queued]),
                      };
                      update({ ...current, messages: { ...currentMessages, kakao: [...existing, outgoing] }, ui: { ...current.ui, kakao: nextUi } });
                      return;
                    }
                    if (choiceId === "__migrate__") {
                      const checkinIndex = existing.findIndex((item) => item.id === "boyfriend-backlash-checkin");
                      const cleaned = existing.filter((item, index) =>
                        checkinIndex < 0 || index <= checkinIndex ||
                        !(item.id.startsWith("kakao-choice-") || item.id.startsWith("kakao-reply-") || item.meta.storyCheckinChoice),
                      ).map((item) => item.id === "boyfriend-backlash-checkin" ? { ...item, body: "你有收到粉丝的消息吗？" } : item);
                      const queue = currentQueue.filter((entry) =>
                        !(entry.item.id.startsWith("kakao-choice-") || entry.item.id.startsWith("kakao-reply-")),
                      );
                      update({
                        ...current,
                        messages: { ...currentMessages, kakao: cleaned },
                        ui: { ...current.ui, kakao: { ...currentUi, "romance-node": "K001", "romance-history": "[]", "romance-pending-node": "", "delivery-queue": JSON.stringify(queue) } },
                      });
                      return;
                    }
                    if (choiceId === "__resume__" && currentUi["romance-node"] === "K014" && currentUi["romance-pending-node"] === "K030") {
                      const nextNode = getKakaoStoryNode("K030");
                      const queued = queueLines(nextNode?.lines ?? [], "kakao-romance-K014-resume");
                      update({
                        ...current,
                        ui: { ...current.ui, kakao: { ...currentUi, "romance-node": "K030", "romance-pending-node": "", "romance-pause-at": "", "delivery-queue": JSON.stringify([...currentQueue, ...queued]) } },
                      });
                      return;
                    }
                    const nodeId = String(currentUi["romance-node"] || "");
                    const storyChoice = choiceId ? getKakaoStoryChoice(nodeId, choiceId) : undefined;
                    if (storyChoice) {
                      let history: string[] = [];
                      try { history = JSON.parse(String(currentUi["romance-history"] || "[]")); } catch { history = []; }
                      const historyKey = nodeId + ":" + choiceId;
                      if (history.includes(historyKey)) return;
                      const nextNode = getKakaoStoryNode(storyChoice.next);
                      if (!nextNode) return;
                      const outgoing = makeItem({
                        id: "kakao-romance-player-" + nodeId + "-" + choiceId + "-" + stamp,
                        title: character,
                        sender: "我",
                        body: storyChoice.text,
                        time,
                        outgoing: true,
                        read: true,
                      });
                      outgoing.meta = { ...outgoing.meta, unread: "1", unreadUntilAt: String(stamp + 2000), romanceNode: nodeId, romanceChoice: String(choiceId) };
                      const replyLines = [...nextNode.lines];
                      if (nodeId === "K044" && choiceId === "C") replyLines.push("你刚刚说会跟着哭，我现在真的有点舍不得挂断。");
                      const queued = queueLines(replyLines, "kakao-romance-" + nodeId + "-" + choiceId);
                      const nextMessages = [...existing, outgoing];
                      const result = nextNode.result || (nextNode.id.startsWith("E0") ? nextNode.id : "");
                      let state: Record<string, number | boolean> = {};
                      try { state = JSON.parse(String(currentUi["romance-state"] || "{}")); } catch { state = {}; }
                      const deltas: Record<string, Record<string, number | boolean>> = {
                        E01: { trust: 2, companyPressure: 2, denialResistance: 1 },
                        E02: { relationship: 1, companyPressure: 1 },
                        E03: { intimacy: -2, contactPaused: true },
                        E04: { teamPressure: 2, responsibilityConflict: true },
                        E05: { trust: -1, repairInProgress: true },
                        E06: { uncertainty: true },
                        E07: { intimacy: 2, exposureRisk: 2 },
                        E08: { intimacy: 2, emotionalStability: 1 },
                      };
                      const delta = result ? deltas[result] ?? {} : {};
                      const nextState = { ...state, ...delta };
                      const variables = { ...current.variables };
                      for (const [key, value] of Object.entries(delta)) {
                        if (typeof value === "number") variables["kakao-romance-" + key] = Number(variables["kakao-romance-" + key] || 0) + value;
                        else variables["kakao-romance-" + key] = value;
                      }
                      const nextUi = {
                        ...currentUi,
                        "romance-node": nextNode.id,
                        "romance-history": JSON.stringify([...history, historyKey]),
                        "romance-last-choice": historyKey,
                        "romance-state": JSON.stringify(nextState),
                        "romance-result": result || String(currentUi["romance-result"] || ""),
                        "romance-pending-node": nextNode.pauseTo || "",
                        "romance-pause-at": nextNode.pauseTo ? String(stamp + 30 * 60 * 1000) : "",
                        "delivery-queue": JSON.stringify([...currentQueue, ...queued]),
                      };
                      update({
                        ...current,
                        variables,
                        messages: { ...currentMessages, kakao: nextMessages },
                        ui: { ...current.ui, kakao: nextUi },
                      });
                      return;
                    }
                    const outgoing = makeItem({ id: "kakao-choice-" + character + "-" + stamp, title: character, sender: "我", body: playerText, time, outgoing: true, read: true });
                    outgoing.meta = { ...outgoing.meta, unread: "1", unreadUntilAt: String(stamp + 2000), ...(choiceId ? { storyCheckinChoice: choiceId } : {}) };
                    const nextMessages = [...existing, outgoing];
                    const messages: Runtime["messages"] = { ...currentMessages, kakao: nextMessages };
                    const queuedReply = queueLines([reply], "kakao-reply-" + character + "-" + stamp);
                    const queueAfterReply = [...currentQueue, ...queuedReply];
                    const queuedFollowUp = followUpReply ? queueLines([followUpReply], "kakao-reply-followup-" + character + "-" + stamp, queueAfterReply) : [];
                    const nextQueue = [...queueAfterReply, ...queuedFollowUp];
                    update({
                      ...current,
                      messages,
                      ui: { ...current.ui, kakao: { ...currentUi, "delivery-queue": JSON.stringify(nextQueue) } },
                    });
                  }}
                />
              </AppWindow>
            ) : (
              <HomeLauncher
                key={
                  "home-" + homeRequest + (app === "appstore" ? "store" : "")
                }
                storeOpen={app === "appstore"}
                closeStore={() => setApp("")}
                work={work}
                layout={deviceLayout.layout}
                change={deviceLayout.change}
                importLayout={deviceLayout.importLayout}
                error={deviceLayout.error}
                open={open}
                onFolder={setFolder}
                search={() => setPanel("search")}
                time={displayTime}
                icon={(a, small) => (
                  <AppIcon
                    key={a.id}
                    id={a.id}
                    name={small ? undefined : a.name}
                    small={small}
                    custom={a.icon}
                    date={s.date || work.phone.date}
                    time={s.time}
                  />
                )}
                clearApp={(id) =>
                  update({
                    ...runtimeRef.current,
                    messages: Object.fromEntries(
                      Object.entries(runtimeRef.current.messages).filter(
                        ([app]) => app !== id,
                      ),
                    ),
                  })
                }
              />
            )}
          </AnimatePresence>
          {folder && (
            <div className="folder-overlay" onClick={() => setFolder("")}>
              <h2>{folder}</h2>
              <div className="folder-apps" onClick={(e) => e.stopPropagation()}>
                {apps
                  .filter((a) => a.folder === folder)
                  .map((a) => (
                    <button key={a.id} onClick={() => open(a.id)}>
                      <AppIcon id={a.id} name={a.name} custom={a.icon} />
                    </button>
                  ))}
              </div>
              <button className="glass-btn" onClick={() => setFolder("")}>
                关闭文件夹
              </button>
            </div>
          )}
          {panel === "control" && (
            <ControlCenter
              battery={work.phone.battery}
              network={work.phone.network}
              close={() => setPanel("")}
            />
          )}
          {panel && panel !== "control" && panel !== "switcher" && (
            <div
              className={`system-panel ${panel === "light" ? "flash-on" : ""}`}
            >
              <button className="panel-close" onClick={() => setPanel("")}>
                关闭 <ChevronLeft size={14} />
              </button>
              {panel === "notification" ? (
                <>
                  <h2>通知中心</h2>
                  {work.phone.notifications && s.notifications.length ? (
                    <SystemNotifications
                      notices={s.notifications}
                      apps={work.apps}
                      onOpen={(appId) => {
                        setPanel("");
                        if (locked) {
                          beginUnlock();
                          return;
                        }
                        if (installedApps.some((a) => a.id === appId))
                          open(appId);
                      }}
                      onDismiss={dismissNotice}
                    />
                  ) : (
                    <p>没有新通知</p>
                  )}
                </>
              ) : panel === "search" ? (
                <>
                  <h2>搜索 App</h2>
                  <AppSearch apps={installedApps} open={open} />
                </>
              ) : (
                <h2>手电筒已打开</h2>
              )}
            </div>
          )}
          {!creator && s.choices.length > 0 && !locked && (
            <div className="story-overlay">
              <span className="eyebrow">故事来到一个岔路口</span>
              <h3>你会如何选择？</h3>
              {s.choices.map((c) => (
                <button
                  key={c.target}
                  onClick={() => update(choose(work, s, c.target))}
                >
                  {c.label}
                  <ArrowUp size={15} />
                </button>
              ))}
            </div>
          )}
          {!creator && s.endings.length > 0 && !locked && (
            <div className="story-overlay ending">
              <span className="eyebrow">ENDING · {s.endings.length}</span>
              <h2>故事在这里停泊。</h2>
              <p>{s.endings[s.endings.length - 1]}</p>
              <button
                onClick={() => {
                  update(dispatch(work, initialRuntime(work), "start"));
                  setApp("");
                  setLocked(true);
                }}
              >
                重新开始
              </button>
            </div>
          )}
          {!creator && s.incomingCall && (
            <div className="incoming-call-screen">
              <small>
                {s.incomingCall.status === "ringing" ? "来电" : "通话中"} ·
                作品内模拟
              </small>
              <div className="incoming-avatar">
                {s.incomingCall.caller.slice(0, 1)}
              </div>
              <h2>{s.incomingCall.caller}</h2>
              {s.incomingCall.status === "answered" &&
                (() => {
                  const record = work.data.phone?.find(
                    (i) => i.id === s.incomingCall?.target,
                  );
                  return record?.kind === "audio" && safeMedia(record.media) ? (
                    <audio controls src={safeMedia(record.media)} />
                  ) : (
                    <p>这是一通虚构来电。</p>
                  );
                })()}
              <div className="incoming-actions">
                <button
                  className="decline-call"
                  onClick={() => {
                    const call = runtimeRef.current.incomingCall;
                    if (call)
                      update(
                        dispatch(
                          work,
                          { ...runtimeRef.current, incomingCall: null },
                          call.status === "ringing"
                            ? "callDeclined"
                            : "callEnded",
                          call.target || call.caller,
                        ),
                      );
                  }}
                >
                  <PhoneIcon size={25} />
                  <span>
                    {s.incomingCall.status === "ringing" ? "拒接" : "挂断"}
                  </span>
                </button>
                {s.incomingCall.status === "ringing" && (
                  <button
                    className="accept-call"
                    onClick={() => {
                      const call = runtimeRef.current.incomingCall;
                      if (call)
                        update(
                          dispatch(
                            work,
                            {
                              ...runtimeRef.current,
                              incomingCall: { ...call, status: "answered" },
                            },
                            "callAnswered",
                            call.target || call.caller,
                          ),
                        );
                    }}
                  >
                    <PhoneIcon size={25} />
                    <span>接听</span>
                  </button>
                )}
              </div>
            </div>
          )}
          {igBanner && !locked && (
            <button className="device-banner ig-backlash-banner" type="button" role="status" aria-live="polite" onClick={() => { const current = runtimeRef.current; update({ ...current, ui: { ...current.ui, instagram: { ...current.ui?.instagram, "ig-open-id": igBanner.id, mymyTab: "私信" } } }); setIgBanner(null); setApp("instagram"); }}>
              <span className="ig-notice-icon" aria-hidden="true"><Instagram size={19} /></span>
              <span className="ig-notice-copy"><strong>{igBanner.sender}</strong><span>{igBanner.body}</span></span>
              <time>现在</time>
            </button>
          )}
          {panel === "switcher" && (
            <div className="device-switcher">
              <div className="switcher-cards">
                {recent
                  .filter(
                    (id) =>
                      installedApps.some((a) => a.id === id) &&
                      appSnapshots.current.has(id),
                  )
                  .map((id) => (
                    <button
                      className="recent-app-card"
                      key={id}
                      onClick={() => open(id)}
                    >
                      <span className="recent-app-label">
                        <AppIcon id={id} small />
                        <strong>
                          {work.apps.find((a) => a.id === id)?.name}
                        </strong>
                      </span>
                      <span className="recent-app-window">
                        <span
                          className="recent-app-snapshot"
                          aria-hidden="true"
                          inert
                          ref={(el) => {
                            const snapshot = appSnapshots.current.get(id);
                            if (el && snapshot)
                              el.replaceChildren(snapshot.cloneNode(true));
                          }}
                        />
                      </span>
                    </button>
                  ))}
              </div>
              <button className="switcher-done" onClick={() => setPanel("")}>
                完成
              </button>
            </div>
          )}
          {contextApp && (
            <div
              className="home-context-shade"
              onClick={() => setContextApp("")}
            >
              <div className="home-context-menu">
                <AppIcon id={contextApp} />
                <strong>
                  {work.apps.find((a) => a.id === contextApp)?.name}
                </strong>
                <button
                  onClick={() => {
                    open(contextApp);
                    setContextApp("");
                  }}
                >
                  打开 App
                </button>
                <button
                  onClick={() => {
                    setContextApp("");
                    setPanel("search");
                  }}
                >
                  在 App 库中查看
                </button>
                <button onClick={() => setContextApp("")}>取消</button>
              </div>
            </div>
          )}
          {keyboard && <DeviceKeyboard close={() => setKeyboard(false)} />}
          {loadError && (
            <button className="runtime-error" onClick={() => setLoadError("")}>
              {loadError}
            </button>
          )}
          <button
            className="home-indicator"
            aria-label="返回桌面"
            onClick={() => {
              if (gestureConsumed.current) return;
              if (locked) {
                beginUnlock();
                return;
              }
              captureApp();
              setHomeRequest((n) => n + 1);
              setKeyboard(false);
              setApp("");
              setFolder("");
              setPanel("");
            }}
          />
          <div className="screen-dimmer" />
          <div className="hardware-reflection" />
        </div>
      </KeyboardContext.Provider>
    </div>
  );
}
function AppSearch({
  apps,
  open,
}: {
  apps: Work["apps"];
  open: (id: string) => void;
}) {
  const [q, set] = useState("");
  return (
    <>
      <input
        autoFocus
        value={q}
        placeholder="App 名称"
        onChange={(e) => set(e.target.value)}
      />
      {apps
        .filter((a) => a.name.toLowerCase().includes(q.toLowerCase()))
        .map((a) => (
          <button
            className="search-result"
            key={a.id}
            onClick={() => open(a.id)}
          >
            <AppIcon id={a.id} small />
            {a.name}
          </button>
        ))}
    </>
  );
}
function Media({ item }: { item: Item }) {
  const src = safeMedia(item.media);
  return src ? (
    item.kind === "audio" ? (
      <audio controls src={src} />
    ) : item.kind === "video" ? (
      <video controls playsInline src={src} />
    ) : (
      <img loading="lazy" src={src} alt={item.title} />
    )
  ) : (
    <div
      className={`original-art art-${item.id.includes("ticket") ? "ticket" : "rain"}`}
    >
      <span>
        {item.id.includes("ticket") ? "城南 / SOUTHBOUND" : "after the rain"}
      </span>
      <strong>{item.id.includes("ticket") ? "09 · 01" : "雨 后"}</strong>
      <small>
        {item.id.includes("ticket")
          ? "16:30 · 一张未完成的约定"
          : "a little moment of quiet"}
      </small>
    </div>
  );
}
function AppContent({
  app,
  name,
  items,
  creator,
  state,
  onRead,
  onEdit,
  onAdd,
  onBack,
  onSettings,
  onSaveProgress,
  onRestartGame,
  savedAt,
  onUi,
  work,
  selectedBoyfriend,
  selectedFriend,
  initialKakaoThread,
  onKakaoThreadChange,
  onKakaoChoice,
  onInstagramReply,
  targetXPostId,
  onTargetXPostHandled,
  targetThreadsPostId,
  targetThreadsReplyId,
  onTargetThreadsPostHandled,
}: {
  app: AppPlugin;
  name: string;
  items: Item[];
  creator: boolean;
  state: Runtime;
  onRead: (id: string) => void;
  onEdit: (item: Item) => void;
  onAdd: () => void;
  onBack: () => void;
  onSettings?: () => void;
  onSaveProgress?: (state: Runtime) => Promise<string>;
  onRestartGame?: () => Promise<void>;
  savedAt?: string;
  onUi?: (key: string, value: UiValue) => void;
  work: Work;
  selectedBoyfriend?: string;
  selectedFriend?: string;
  initialKakaoThread?: string;
  onKakaoThreadChange?: (thread: string) => void;
  onKakaoChoice?: (character: string, playerText: string, reply: string, followUpReply?: string, choiceId?: string) => void;
  onInstagramReply?: (conversation: Item, replyText: string) => void;
  targetXPostId?: string;
  onTargetXPostHandled?: () => void;
  targetThreadsPostId?: string;
  targetThreadsReplyId?: string;
  onTargetThreadsPostHandled?: () => void;
}) {
  const [detail, setDetail] = useState<Item | null>(null);
  useEffect(() => {
    if (app.id !== "twitter" || !targetXPostId) return;
    const target = items.find(item => item.id === targetXPostId);
    if (target) setDetail(target);
    onTargetXPostHandled?.();
  }, [app.id, targetXPostId, items, onTargetXPostHandled]);
  const [thread, setThread] = useState(initialKakaoThread || "");
  useEffect(() => {
    if (app.id === "kakao" && initialKakaoThread) {
      setThread(initialKakaoThread);
      onKakaoThreadChange?.(initialKakaoThread);
    }
  }, [app.id, initialKakaoThread, onKakaoThreadChange]);
  const [tab, setTab] = useState(app.tabs[0]);
  const [q, setQ] = useState("");
  const [pw, setPw] = useState("");
  const [unlocks, setUnlocks] = useState<string[]>([]);
  const [pwError, setPwError] = useState("");
  const [likes, setLikes] = useState<string[]>([]);
  const shown = items
    .filter((i) =>
      creator ||
      visible(i, state) ||
      (app.id === "threads" && ["T029", "T030"].includes(String(i.meta?.postId))),
    )
    .filter((i) => !isTestContentItem(i))
    .filter((i) =>
      (i.title + i.body + i.sender).toLowerCase().includes(q.toLowerCase()),
    );
  const filtered =
    tab === "收藏"
      ? shown.filter((i) => i.favorite)
      : tab === app.tabs[0]
        ? shown
        : shown.filter((i) => i.folder === tab);
  const read = (i: Item) => {
    if (creator) {
      onEdit(i);
      return;
    }
    setDetail(i);
    if (!i.password || unlocks.includes(i.id)) onRead(i.id);
  };
  const chats = [...new Set(shown.map((i) => i.title))];
  const back = () => {
    if (detail) setDetail(null);
    else if (thread) setThread("");
    else onBack();
  };
  if (app.id === "mail")
    return <MailApp items={shown} onRead={onRead} onBack={onBack} />;
  const Skin =
    app.id === "wechat"
      ? WeChatSkin
      : app.id === "whatsapp"
        ? WhatsAppSkin
        : (catalogSkins[app.id as keyof typeof catalogSkins] ?? null);
  const detailView = detail ? (
    <div className="phone-content detail-content">
      {detail.password && !creator && !unlocks.includes(detail.id) ? (
        <div className="locked-note">
          <LockKeyhole size={36} />
          <h3>这条内容已锁定</h3>
          <input
            type="password"
            placeholder="内容密码"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <button
            onClick={() => {
              if (pw === detail.password) {
                setUnlocks([...unlocks, detail.id]);
                onRead(detail.id);
                setPwError("");
              } else setPwError("密码不正确");
            }}
          >
            解锁内容
          </button>
          <small>{pwError}</small>
        </div>
      ) : (
        <>
          <small className="detail-meta">
            {detail.time} · {detail.sender}
          </small>
          <h2>{detail.title}</h2>
          {(detail.media || ["media", "social"].includes(app.engine)) && (
            <Media item={detail} />
          )}
          <RichText value={detail.richText} fallback={detail.body} />
          <dl className="item-metadata">
            {getFields(app.id)
              .filter((f) => detail.meta?.[f.key])
              .map((f) => (
                <div key={f.key}>
                  <dt>{f.label}</dt>
                  <dd>{detail.meta[f.key]}</dd>
                </div>
              ))}
          </dl>
          {detail.folder && (
            <span className="folder-label">
              <Folder size={12} />
              {detail.folder}
            </span>
          )}
          {detail.comments.map((c, i) => (
            <p key={i} className="comment">
              {c}
            </p>
          ))}
        </>
      )}
    </div>
  ) : null;
  if (Skin)
    return (
      <>
        <div className="catalog-slot" hidden={!!detail}>
          <Suspense fallback={<div className="catalog-loading">正在打开…</div>}>
            <Skin
              appId={app.id}
              owner={PLAYER_THREADS_ID}
              virtualTime={state.time}
              virtualTimestamp={state.gameClock?.currentGameTimestamp}
              ui={state.ui?.[app.id]}
              onUi={creator ? undefined : onUi}
              name={name}
              items={shown}
              creator={creator}
              onRead={onRead}
              onItem={read}
              onAdd={onAdd}
              onBack={onBack}
              thread={thread}
              onThread={(value) => {
                setThread(value);
                onKakaoThreadChange?.(app.id === "kakao" ? value : "");
              }}
              selectedBoyfriend={selectedBoyfriend}
              selectedFriend={selectedFriend}
              onKakaoChoice={onKakaoChoice}
              onInstagramReply={onInstagramReply}
              storyContext={[...(work.data.twitter ?? []), ...(state.messages.twitter ?? [])].slice(-3).map(item => item.sender + "：" + item.body).join("\n")}
              targetPostId={targetThreadsPostId}
              targetReplyId={targetThreadsReplyId}
              onTargetPostHandled={onTargetThreadsPostHandled}
            />
          </Suspense>
        </div>
        {detail &&
          (socialDetailApps.has(app.id) &&
          (!detail.password || unlocks.includes(detail.id)) ? (
            <SocialDetail
              app={app.id}
              item={detail}
              back={back}
              owner={PLAYER_THREADS_ID}
              ui={state.ui?.[app.id]}
              onUi={onUi}
            />
          ) : nativeDetailApps.has(app.id) &&
            (!detail.password || unlocks.includes(detail.id)) ? (
            <NativeDetail app={app.id} item={detail} back={back} />
          ) : (
            <>
              <div className="app-nav">
                <button aria-label="返回" onClick={back}>
                  <ChevronLeft size={23} />
                </button>
                <strong>{detail.title}</strong>
                <span />
              </div>
              {detailView}
            </>
          ))}
      </>
    );
  return (
    <>
      <div className="app-nav">
        <button onClick={back} aria-label="返回">
          <ChevronLeft size={23} />
          {detail || thread ? "返回" : ""}
        </button>
        <strong>{thread || name}</strong>
        <button
          onClick={
            creator
              ? onAdd
              : () =>
                  document
                    .querySelector<HTMLInputElement>(
                      ".app-screen .phone-search input",
                    )
                    ?.focus()
          }
          aria-label={creator ? "新增内容" : "搜索内容"}
        >
          {creator ? <Plus size={22} /> : <Search size={20} />}
        </button>
      </div>
      {app.id === "settings" && !detail ? (
        <NativeSettings
          work={work}
          items={items}
          creator={creator}
          onItem={read}
          onSettings={onSettings}
          onSaveProgress={onSaveProgress ? () => onSaveProgress(state) : undefined}
          onRestartGame={onRestartGame}
          savedAt={savedAt}
        />
      ) : app.id === "calculator" && !detail ? (
        <NativeCalculator
          items={shown}
          onRead={read}
          ui={state.ui?.[app.id]}
          onUi={onUi}
        />
      ) : detail ? (
        detailView
      ) : app.engine === "messaging" && thread ? (
        <div className="chat-content">
          <div className="chat-time">2026 年 9 月 1 日</div>
          {shown
            .filter((i) => i.title === thread)
            .map((i) => (
              <button
                key={i.id}
                className={`message-row ${i.outgoing ? "outgoing" : ""}`}
                onClick={() => (creator ? onEdit(i) : onRead(i.id))}
              >
                <span className="avatar">{i.sender.slice(0, 1)}</span>
                <span className="bubble">
                  {i.kind === "image" ||
                  i.kind === "audio" ||
                  i.kind === "video" ? (
                    <Media item={i} />
                  ) : i.kind === "transfer" ? (
                    <span className="transfer">
                      ¥ {i.body}
                      <small>虚构转账记录</small>
                    </span>
                  ) : (
                    i.body
                  )}
                  <small>
                    {i.time.slice(-5)} {i.read ? "✓✓" : ""}
                  </small>
                  {creator && (i.hidden || i.unlock) && (
                    <LockKeyhole size={12} />
                  )}
                </span>
              </button>
            ))}
          {creator ? (
            <button className="chat-compose" onClick={onAdd}>
              ＋ 添加一条消息
            </button>
          ) : (
            <div className="chat-compose muted">
              根据剧情推进，互动回复将在这里出现。
            </div>
          )}
        </div>
      ) : (
        <div
          className={`phone-content ${app.engine === "social" ? "feed-content" : ""}`}
        >
          {app.engine !== "media" && (
            <div className="phone-search">
              <Search size={15} />
              <input
                placeholder={`搜索${name}`}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          )}
          {app.engine === "messaging" ? (
            chats.map((t) => {
              const list = shown.filter((i) => i.title === t),
                last = list[list.length - 1];
              return (
                <button
                  className="contact-row"
                  key={t}
                  onClick={() => {
                    setThread(t);
                    onRead(t);
                  }}
                >
                  <span className="avatar" style={{ background: app.color }}>
                    {t.slice(0, 1)}
                  </span>
                  <span>
                    <strong>{t}</strong>
                    <p>{last.body}</p>
                  </span>
                  <small>{last.time.slice(-5)}</small>
                </button>
              );
            })
          ) : app.engine === "media" ? (
            <>
              <div className="media-heading">
                <h1>{tab}</h1>
                <p>{filtered.length} 个故事片段</p>
              </div>
              <div className="media-grid">
                {filtered.map((i) => (
                  <button key={i.id} onClick={() => read(i)}>
                    <Media item={i} />
                    <span>
                      {i.title} {creator && i.hidden ? "· 隐藏" : ""}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : app.engine === "social" ? (
            filtered.map((i) => (
              <article className="social-post" key={i.id}>
                <div className="post-author">
                  <span className="avatar" style={{ background: app.color }}>
                    {i.sender.slice(0, 1)}
                  </span>
                  <div>
                    <strong>{i.sender}</strong>
                    {i.meta?.handle && (
                      <small>
                        @{i.meta.handle} {i.meta.verified === "true" ? <span aria-label="已认证" style={{ display: "inline-flex", width: 14, height: 14, marginLeft: 3, borderRadius: "50%", alignItems: "center", justifyContent: "center", background: "#1d9bf0", color: "#fff", fontSize: 10, lineHeight: 1 }}>✓</span> : null}
                      </small>
                    )}
                    <small>{i.time}</small>
                  </div>
                  <button aria-label="查看帖子详情" onClick={() => read(i)}>
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <button className="post-image" onClick={() => read(i)}>
                  <Media item={i} />
                </button>
                <div className="post-actions">
                  <button
                    aria-label="虚构点赞"
                    onClick={() =>
                      setLikes(
                        likes.includes(i.id)
                          ? likes.filter((id) => id !== i.id)
                          : [...likes, i.id],
                      )
                    }
                  >
                    <Heart
                      size={22}
                      fill={likes.includes(i.id) ? "#d67670" : "none"}
                    />
                  </button>
                  <button aria-label="查看评论" onClick={() => read(i)}>
                    <MessageCircle size={22} />
                  </button>
                  <small>
                    {i.likes + (likes.includes(i.id) ? 1 : 0)} 次喜欢
                  </small>
                  {i.meta?.reposts && <small>转发 {i.meta.reposts}</small>}
                  {i.meta?.views && <small>浏览 {i.meta.views}</small>}
                </div>
                <button className="post-text" onClick={() => read(i)}>
                  <strong>{i.title}</strong>
                  <p>{i.body}</p>
                  {i.id === "permanent-dispatch-opening-post" && (
                    <small style={{ display: "block", marginTop: 8, color: "#888", fontSize: 10, lineHeight: 1.4 }}>
                      游戏剧情虚构，非真实新闻。
                    </small>
                  )}
                </button>
              </article>
            ))
          ) : (
            filtered.map((i) => (
              <button
                key={i.id}
                className={`record-row ${app.engine === "document" ? "document-row" : ""}`}
                onClick={() => read(i)}
              >
                <div className="record-symbol">
                  {app.engine === "records" ? (
                    <app.icon size={20} />
                  ) : (
                    <span>{i.title.slice(0, 1)}</span>
                  )}
                </div>
                <div>
                  <strong>{i.title}</strong>
                  <p>{i.body.split("\n")[0]}</p>
                  <small>
                    {i.time} {i.folder && `· ${i.folder}`}
                  </small>
                </div>
                {i.password || i.hidden ? (
                  <LockKeyhole size={14} />
                ) : (
                  <ChevronLeft className="chevron-right" size={16} />
                )}
              </button>
            ))
          )}
          {!filtered.length && app.engine !== "messaging" && (
            <div className="empty-app">
              <app.icon size={36} />
              <h3>这一页还很安静</h3>
              <p>
                {creator
                  ? "添加属于这个 App 的故事内容。"
                  : "暂时没有可浏览的内容。"}
              </p>
            </div>
          )}
          {creator && (
            <button className="phone-add" onClick={onAdd}>
              <Plus size={15} />
              添加
              {app.engine === "messaging"
                ? "聊天"
                : app.engine === "social"
                  ? "帖子"
                  : app.engine === "media"
                    ? "素材"
                    : "内容"}
            </button>
          )}
        </div>
      )}
      {!detail &&
        !thread &&
        app.id !== "calculator" &&
        app.id !== "settings" && (
          <div className="app-tabs">
            {app.tabs.map((t, i) => (
              <button
                key={t}
                className={tab === t ? "selected" : ""}
                onClick={() => setTab(t)}
              >
                {i === 0 ? (
                  <MessageCircle size={17} />
                ) : i === 1 ? (
                  <Search size={17} />
                ) : (
                  <UsersIcon />
                )}
                <span>{t}</span>
              </button>
            ))}
          </div>
        )}
    </>
  );
}
function UsersIcon() {
  return <PhoneIcon size={17} />;
}
