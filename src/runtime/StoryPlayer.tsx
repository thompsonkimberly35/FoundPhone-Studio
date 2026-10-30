import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Phone } from "../Phone";
import { validateWork, type Work } from "../schema";
import "../styles.css";
import "./player.css";

const MEMBERS = ["李相沅", "周安信", "贺鑫隆", "金虔佑", "张家豪", "李理悟", "郑相炫", "金俊抒"];

function CharacterSelection({ onComplete }: { onComplete: (boyfriend: string, friend: string) => void }) {
  const [step, setStep] = useState<"boyfriend" | "friend">("boyfriend");
  const [boyfriend, setBoyfriend] = useState("");
  const [friend, setFriend] = useState("");
  const isBoyfriend = step === "boyfriend";
  const selected = isBoyfriend ? boyfriend : friend;
  const options = isBoyfriend ? MEMBERS : MEMBERS.filter((name) => name !== boyfriend);

  const next = () => {
    if (!selected) return;
    if (isBoyfriend) setStep("friend");
    else onComplete(boyfriend, friend);
  };

  return (
    <section className="ald1-selection">
      <div className="ald1-card">
        <div className="ald1-brand">ALD1 <span>·</span> STORY</div>
        <div className="ald1-progress"><i className="active" /><i className={!isBoyfriend ? "active" : ""} /></div>
        <p className="ald1-step">{isBoyfriend ? "STEP 01 / 02" : "STEP 02 / 02"}</p>
        <h1>{isBoyfriend ? "请选择妳在ALD1的男友" : "请选择你的知心好友"}</h1>
        <p className="ald1-copy">{isBoyfriend ? "选择一位男友，开启属于你们的故事。" : "再选择一位知心好友，陪伴你的日常。"}</p>
        <label htmlFor="ald1-person">{isBoyfriend ? "男友" : "知心好友"}</label>
        <select id="ald1-person" value={selected} onChange={(e) => isBoyfriend ? setBoyfriend(e.target.value) : setFriend(e.target.value)}>
          <option value="" disabled>请选择一位成员</option>
          {options.map((name) => <option value={name} key={name}>{name}</option>)}
        </select>
        {!isBoyfriend && <p className="ald1-hint">男友「{boyfriend}」不会出现在好友名单中。</p>}
        <button className="ald1-next" disabled={!selected} onClick={next}>{isBoyfriend ? "下一步" : "进入手机"} <span>→</span></button>
        {!isBoyfriend && <button className="ald1-back" onClick={() => setStep("boyfriend")}>返回上一步</button>}
      </div>
      <p className="ald1-footer">每一次选择，都是故事的开始</p>
    </section>
  );
}

function StoryPlayer() {
  const [work, setWork] = useState<Work | null>(null),
    [error, setError] = useState("");
  const [selectionComplete, setSelectionComplete] = useState(false);
  const [selectedBoyfriend, setSelectedBoyfriend] = useState("");
  const [selectedFriend, setSelectedFriend] = useState("");
  const musicRef = useRef<HTMLAudioElement>(null);
  const musicIndex = useRef(1);
  const [musicNeedsTap, setMusicNeedsTap] = useState(false);

  const playMusic = (index: number) => {
    const audio = musicRef.current;
    if (!audio) return;
    musicIndex.current = index;
    audio.src = import.meta.env.BASE_URL + "music/song" + index + ".mp3";
    void audio.play().then(() => setMusicNeedsTap(false)).catch(() => setMusicNeedsTap(true));
  };

  const advanceMusic = () => {
    const next = musicIndex.current >= 8 ? 1 : musicIndex.current + 1;
    playMusic(next);
  };
  useEffect(() => {
    const abort = new AbortController();
    fetch(
      new URLSearchParams(location.search).get("preview") === "test"
        ? "./test-work.json"
        : new URLSearchParams(location.search).get("template") === "blank"
          ? "./blank-work.json"
          : "./work.json",
      { signal: abort.signal },
    )
      .then((r) => {
        if (!r.ok) throw Error("缺少作品文件，请运行 npm run story:build");
        return r.json();
      })
      .then((x) => {
        const w = validateWork(x);
        document.title = w.title === "捡手机" ? "捡手机" : w.title + " · 捡手机";
        setWork(w);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(String(e));
      });
    return () => abort.abort();
  }, []);
  return (
    <main className="story-runtime">
      <audio ref={musicRef} preload="auto" onEnded={advanceMusic} onError={advanceMusic} aria-hidden="true" />
      {work ? selectionComplete ? <Phone work={work} selectedBoyfriend={selectedBoyfriend} selectedFriend={selectedFriend} /> : <CharacterSelection onComplete={(boyfriend, friend) => {
        setSelectedBoyfriend(boyfriend);
        setSelectedFriend(friend);
        playMusic(1);
        setSelectionComplete(true);
      }} /> : <p role="status">{error || "正在打开手机…"}</p>}
      {selectionComplete && musicNeedsTap && (
        <button type="button" onClick={() => playMusic(musicIndex.current)}
          style={{ position: "fixed", right: 16, bottom: 16, zIndex: 9999, padding: "10px 14px", borderRadius: 999, border: 0, background: "#222", color: "#fff" }}>
          点击开启背景音乐
        </button>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<StoryPlayer />);
