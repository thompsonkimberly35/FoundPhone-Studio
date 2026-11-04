export type ThreadsPlayerPost = { id: string; text: string; createdAt: number; boyfriend: string; media?: string; contextText?: string };
export type ThreadsFanReply = { id: string; postId: string; authorId: string; handle: string; displayName: string; avatar: string; text: string; category: Mood; personality: string; scheduledAt: number; deliveredAt: number | null; readAt: number | null };
type Mood = "claim" | "explain" | "attack" | "sad" | "apology" | "daily" | "support" | "mention";

const pools: Record<Mood, string[]> = {
  claim: ["妳飒什么？？？","卧槽，正主真的出来回应了。","@leowon_99 我去，你看是 {{BOYFRIEND_NAME}} 他女友。","谁给妳的底气啊？","妳谈恋爱是妳的事，别来刺激粉丝好吗？","这篇到底是道歉还是挑衅？","她现在说什么都会被骂吧。"],
  explain: ["不是，谈恋爱而已，你们到底在崩溃什么？","她讲话是有点呛，但你们私讯骂人也很离谱吧。","我不支持这段恋情，但也不赞成网暴。","拜托，他是人，不是粉丝的私有财产。","她只是发个文也要被骂？有完没完？","不是吧，她只是说自己很累而已。"],
  attack: ["她真的完全不在乎 ALLYZ 的感受欸。","我本来还想替妳说话，现在不了。","救命，这发言我真的看傻。","现在知道委屈了？粉丝的委屈谁管？","妳是不是嫌事情闹得还不够大？","我真的替其他成员感到不值。"],
  sad: ["妳知道多少粉丝因为这件事哭了吗？","我们在演唱会只能远远看着他，妳倒是很幸福。","我今天真的要脱粉了。","ALLYZ 今天又要吵到天亮。","这留言区比恋爱新闻还精彩。","我真的不懂为什么有人觉得粉丝没有资格难过。"],
  apology: ["卧槽，正主真的出来回应了。","我现在只想知道 Wake One 要怎么处理。","她现在说什么都会被骂吧。","我不支持这段恋情，但也不赞成网暴。","她只是发个文也要被骂？有完没完？"],
  daily: ["留友看傻逼。","不是姐，妳认真的？","我今天真的要脱粉了。","这留言区比恋爱新闻还精彩。","ALLYZ 今天又要吵到天亮。","不是吧，她只是说自己很累而已。"],
  support: ["她只是发个文也要被骂？有完没完？","拜托，他是人，不是粉丝的私有财产。","我不支持这段恋情，但也不赞成网暴。","有些粉丝真的管太宽了吧。","我只希望 ALD1 能好好活动。","她讲话是有点呛，但你们私讯骂人也很离谱吧。"],
  mention: ["@cloudy_7r 快来看这篇，真的离谱。","@orbitgirl_7p 快来吃瓜。","@starry_8m 妳快看，我真的不知道说什么。","我去，你看这件事又有新进展了。","有人整理时间线吗？","快来看，留言区真的太精彩了。"]
};
const handles = ["moonfilm_7qx","allyzblue_4n","petalorbit_8v","framearchive_2k","nightletter_6r","hushorbit_7q","starfall_3vx","cloudfilm_9m","moonpage_4rk","petalblue_8n","brokenstar_2w","orbittear_5x","silverday_9t","duskletter_7m","tinyfilm_4q","starlane_8v","bluepetal_2k","afterlight_6r","orbitsoft_9p","lilacmoon_5t","filmarchive_3n","quietallyz_8x","sunrise_4m","lostencore_7v","silverorbit_2q","peachorbit_8q","cloudyday_7r","orbitnote_5p","velvetstar_6m","daydream_9x","softorbit_3k","lunarpage_8q"];
const displayNames = ["月光收件人","蓝色应援","花瓣星球","相框收藏家","夜航日记","安静观察者","星尘来信","云端相册","月页收藏","花蓝日常","破碎星光","轨道眼泪","银色晴天","暮色信笺","微光底片","星河散步","蓝花日记","午后微光","柔软轨道","丁香月色","底片档案","安静应援","日出之后","失落安可","银色轨道","蜜桃星球","阴天日记","轨道笔记","天鹅绒星","白日梦境","柔光轨道","月光书页"];
const personalities = ["理性分析派","情绪共鸣派","团体支持派","温和安慰派","直率质疑派","旁观整理派"];
const palettes = [["#f6d7d7","#8d5965"],["#d6e8f7","#456b91"],["#f5e2c6","#8b6941"],["#dcebdc","#54775b"],["#e8dcf4","#71558b"],["#f4dce9","#965f7a"],["#d9e5e8","#526d75"],["#f3e7d4","#94774f"]];
function hashSeed(value: string): number { let hash = 2166136261; for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619); return hash >>> 0; }
export function createThreadsAvatar(seedText: string): string {
  const hash = hashSeed(seedText);
  const [bg, fg] = palettes[hash % palettes.length];
  const initials = (seedText.replace(/[^a-z0-9]/gi, "").slice(0, 2) || "th").toUpperCase();
  const dotX = 12 + (hash % 72);
  const dotY = 12 + ((hash >>> 8) % 72);
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="' + bg + '"/><circle cx="' + dotX + '" cy="' + dotY + '" r="5" fill="' + fg + '" opacity=".35"/><circle cx="48" cy="37" r="17" fill="' + fg + '" opacity=".82"/><path d="M16 91c3-22 15-33 32-33s29 11 32 33" fill="' + fg + '" opacity=".82"/><text x="48" y="43" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#fff">' + initials + '</text></svg>';
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
export function createThreadsCommentIdentity(seedText: string): { handle: string; avatar: string } {
  const hash = hashSeed(seedText);
  const handle = "softreply_" + hash.toString(36).slice(0, 5) + "x";
  return { handle, avatar: createThreadsAvatar(handle) };
}
function classify(text: string): Mood {
  if (/(对不起|抱歉|很抱歉|道歉|让大家失望)/i.test(text)) return "apology";
  if (/(难过|很累|委屈|哭|讨厌我|不要再骂|受伤)/i.test(text)) return "sad";
  if (/(受够|很烦|闭嘴|不要再管|粉丝)/i.test(text) && /(烦|受够|闭嘴|不要再管|别来)/i.test(text)) return "attack";
  if (/(支持|ALD1|舞台|团体|成员)/i.test(text)) return "support";
  if (/(真心相爱|理解|解释|没有想过伤害|希望大家)/i.test(text)) return "explain";
  if (/(我的|男朋友|男友|喜欢我|陪在我身边|恋爱)/i.test(text)) return "claim";
  if (/(今天|蛋糕|吃了|天气|睡觉|晚安|早安|日常)/i.test(text)) return "daily";
  return "mention";
}
export function reconcileThreadsFanReplies(
  posts: ThreadsPlayerPost[],
  existing: ThreadsFanReply[],
): ThreadsFanReply[] {
  const knownIds = new Set(existing.map((reply) => reply.id));
  const recovered = posts.flatMap((post) =>
    generateThreadsFanReplies(post).filter((reply) => !knownIds.has(reply.id)),
  );
  return recovered.length ? [...existing, ...recovered] : existing;
}

export function generateThreadsFanReplies(post: ThreadsPlayerPost): ThreadsFanReply[] {
  const mood = classify(post.text);
  const order: Mood[] = [mood, "explain", "attack", "sad", "apology", "daily", "support", "mention", "claim"];
  let seed = hashSeed(post.id + post.text);
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const selected: Array<{ text: string; category: Mood }> = [];
  const used = new Set<string>();
  for (const category of order) {
    const candidates = [...pools[category]];
    for (let i = candidates.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [candidates[i], candidates[j]] = [candidates[j], candidates[i]]; }
    const quota = category === mood ? 8 : category === "mention" || category === "support" ? 3 : 2;
    for (const candidate of candidates) {
      if (selected.length >= 24) break;
      if (selected.filter(item => item.category === category).length >= quota || used.has(candidate)) continue;
      used.add(candidate);
      selected.push({ text: candidate, category });
    }
    if (selected.length >= 24) break;
  }
  const filler = ["我先收藏，等后续更新。","每个人都可以表达看法，但请不要人身攻击。","这件事还是等当事人和公司说明吧。","希望讨论可以回到事情本身。","看完之后心情有点复杂。","这条动态很快就会被转发出去吧。","先不急着下结论，再看看后续。","今天的时间线又变长了。"];
  for (const text of filler) { if (selected.length >= 24) break; if (!used.has(text)) { used.add(text); selected.push({ text, category: "mention" }); } }
  return selected.slice(0, 24).map(({ text: sourceText, category }, index) => {
    const mentionTarget = handles[(index + 1) % handles.length];
    let text = sourceText.replace(/\{\{BOYFRIEND_NAME\}\}/g, post.boyfriend || "他");
    // Fan accounts should discuss or tag other fan IDs, never tag the player by default.
    text = text.replace(/@allyz_1101\b/gi, "@" + mentionTarget);
    if (text.includes("{{MENTION_HANDLE}}")) text = text.replace(/\{\{MENTION_HANDLE\}\}/g, mentionTarget);
    if (category === "mention" && !/@[\w.]+/.test(text)) text = text + " @" + mentionTarget;
    if (category === "support" && post.contextText && index === 0) text = "你前面提过「" + post.contextText.slice(0, 36) + "」，" + text;
    if (category === "claim" && post.boyfriend) text = text.replace(/正主真的出来回应了/g, post.boyfriend + " 的女友真的出来回应了");
    const handle = handles[index];
    return {
      id: post.id + "-reply-" + index, postId: post.id, authorId: handle, handle,
      displayName: displayNames[index], avatar: createThreadsAvatar(handle), text, category,
      personality: personalities[index % personalities.length],
      scheduledAt: post.createdAt + (index < 4 ? 3000 + index * 1200 : index < 11 ? 10000 + (index - 4) * 2100 : index < 19 ? 30000 + (index - 11) * 3500 : 60000 + (index - 19) * 6500),
      deliveredAt: null, readAt: null,
    };
  });
}
