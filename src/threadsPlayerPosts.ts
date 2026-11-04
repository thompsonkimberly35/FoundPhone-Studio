export type ThreadsPlayerPost = { id: string; text: string; createdAt: number; boyfriend: string; media?: string; contextText?: string };
export type ThreadsFanReply = { id: string; postId: string; authorId: string; handle: string; displayName: string; avatar: string; text: string; category: Mood; personality: string; scheduledAt: number; deliveredAt: number | null; readAt: number | null };
type Mood = "claim" | "explain" | "attack" | "sad" | "apology" | "daily" | "support" | "mention";
const pools: Record<Mood, string[]> = {
 claim: ["妳颯什麼？？？","臥槽，正主真的出來宣示主權了。","姐妳是嫌現在事情還不夠大嗎？","這句是故意發給粉絲看的吧。","我真的看傻了。","我們連他的手都碰不到，妳直接說他是妳的？","我本來還想替她說話，現在不了。","談戀愛可以，但有必要這樣講嗎？","她說的是事實吧，為什麼不能講？","這語氣真的很像在炫耀。","我只想知道他本人知不知道她發這個。","這留言區比新聞還精彩。"],
 explain: ["真心相愛就可以不顧團隊嗎？","她其實講得很正常吧。","我知道她沒有錯，但還是很難接受。","現在出來解釋是不是有點晚了？","至少她願意說話。","我只想好好追星，不想每天吵架。","希望妳真的有好好對待他。","我比較想知道公司接下來怎麼安排活動。"],
 attack: ["不是，妳現在是在罵整個粉絲群？","她真的以為自己很了不起？","妳把所有粉絲都當成壞人？","不要把正常粉絲跟私訊罵人的混在一起。","那些去騷擾她的人確實很過分。","這件事真的沒完沒了了。","公司到底什麼時候要出面？"],
 sad: ["現在知道難過了？","我們粉絲也很難過啊。","她只是談戀愛，真的沒必要被這樣罵。","我看到這篇突然有點心軟。","不要再去私訊她了，真的夠了。","她現在連發文說累都會被罵？","我不支持戀情，但也不想看到她被逼成這樣。"],
 apology: ["妳為什麼要替談戀愛道歉？","至少她知道事情影響很大。","道歉有用的話，團體活動會恢復嗎？","我覺得她也很可憐。","不用向所有人道歉吧。","希望妳之後不要再公開挑釁粉絲。","我還是不能接受，但不會去攻擊妳。"],
 daily: ["現在還有心情發日常？","她只是發個日常，你們到底要罵多久？","這個看起來好好吃欸。","不是，為什麼我的首頁又推她？","大家冷靜點吧，這篇又沒提戀愛。","我現在看到她帳號就會想到那件事。","今天也要好好吃飯，別被留言影響。","這到底有什麼好吵的？"],
 support: ["妳真的有想過其他成員嗎？","她說支持團體，結果團體現在被影響。","我覺得她至少沒有否定其他成員。","不要把所有責任都推到她身上。","希望公司能讓團體繼續正常活動。","她現在說什麼都會被罵吧。","希望大家把注意力放回舞台。"],
 mention: ["@orbitgirl_7p 快來看這篇。","我先留個言等等看後續。","這件事到底還要吵多久。","每個人都先冷靜一下吧。","有人整理時間線嗎？","我只想知道事情的完整經過。","截圖又要開始滿天飛了。"]
};
const displayNames = ["月光收件人","藍色應援","花瓣星球","相框收藏家","夜航日記","安靜觀察者","星塵來信","雲端相簿","月頁收藏","花藍日常","破碎星光","軌道眼淚","銀色晴天","暮色信箋","微光底片","星河散步","藍花日記","午後微光","柔軟軌道","丁香月色","底片檔案","安靜應援","日出之後","失落安可"];
const personalities = ["理性分析派","情緒共鳴派","團體支持派","溫和安慰派","直率質疑派","旁觀整理派"];
const handles = ["moonfilm_7qx","allyzblue_4n","petalorbit_8v","framearchive_2k","nightletter_6r","hushorbit_7q","starfall_3vx","cloudfilm_9m","moonpage_4rk","petalblue_8n","brokenstar_2w","orbittear_5x","silverday_9t","duskletter_7m","tinyfilm_4q","starlane_8v","bluepetal_2k","afterlight_6r","orbitsoft_9p","lilacmoon_5t","filmarchive_3n","quietallyz_8x","sunrise_4m","lostencore_7v","silverorbit_2q","moonfilm_6k","allyzheart_9w","peachorbit_8q","cloudyday_7r","orbitnote_5p"];
function classify(text: string): Mood {
 if (/(對不起|抱歉|很抱歉|道歉|讓大家失望)/i.test(text)) return "apology";
 if (/(很難過|很累|委屈|哭|討厭我|不要再罵)/i.test(text)) return "sad";
 if (/(受夠|很煩|閉嘴|不要再管|粉絲)/i.test(text) && /(煩|受夠|閉嘴|不要再管)/i.test(text)) return "attack";
 if (/(支持|ALD1|舞台|團體|成員)/i.test(text)) return "support";
 if (/(真心相愛|理解|解釋|沒有想過傷害|希望大家)/i.test(text)) return "explain";
 if (/(我的|男朋友|男友|喜歡我|陪在我身邊)/i.test(text)) return "claim";
 if (/(今天|蛋糕|吃了|天氣|睡覺|晚安|早安)/i.test(text)) return "daily";
 return "mention";
}
export function generateThreadsFanReplies(post: ThreadsPlayerPost): ThreadsFanReply[] {
 const mood = classify(post.text);
 const categories: Mood[] = ["claim","explain","attack","sad","apology","daily","support","mention"];
 let seed = [...post.id + post.text].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7);
 const random = () => { seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; };
 const mention = post.text.match(/@([\w.]+)/);
 const mentionHandle = mention?.[1] || "allyz_1101";
 const generated = categories.flatMap((category, categoryIndex) => {
   const pool = [...pools[category]];
   for (let i=pool.length-1;i>0;i--) { const j=Math.floor(random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
   return pool.slice(0,3).map((text,offset) => {
     let reply = text;
     if (category === "mention") reply = "@" + mentionHandle + " " + (offset === 0 ? "我看到你這篇了，想知道後續會怎麼發展。" : offset === 1 ? "你這段話我有看到，想補充一下我的想法。" : "來看這篇，大家可以討論但請保持尊重。");
     if (post.boyfriend) reply = reply.replace(/他/g,post.boyfriend);
     if (post.contextText && category === "support" && offset === 0) reply = "你前面提過「" + post.contextText.slice(0,36) + "」，希望大家能把注意力放回ALD1。";
     if (category === mood && post.boyfriend && category === "claim") reply = reply.replace(/妳/g,"你");
     return { category, reply, order: categoryIndex*3+offset };
   });
 });
 const unique = new Set<string>();
 return generated.map(({reply},index) => {
   let text = reply;
   if (unique.has(text)) text += "（我也有同樣的感受）";
   unique.add(text);
   const handle=handles[index];
   return {id:post.id+"-reply-"+index,postId:post.id,authorId:handle,handle,displayName:displayNames[index],
     avatar:"https://api.dicebear.com/9.x/notionists/svg?seed="+encodeURIComponent(handle),
     text,category:categories[Math.floor(index/3)],personality:personalities[index % personalities.length],scheduledAt:post.createdAt+(index<4?3000+index*1200:index<11?10000+(index-4)*2100:index<19?30000+(index-11)*3500:60000+(index-19)*6500),
     deliveredAt:null,readAt:null};
 });
}
