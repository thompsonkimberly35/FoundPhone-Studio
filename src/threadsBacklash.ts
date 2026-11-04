import { makeItem, type Item } from "./schema";

export type InstagramReplyEvidence = {
  conversationId: string; attackerUserId: string; attackerHandle: string;
  attackerMessageId: string; playerReplyMessageId: string;
  attackerText: string; playerReplyText: string; capturedAt: number;
};
type PostSeed = { id:string; handle:string; body:string; comments:[string,string][] };
const seeds: PostSeed[] = [
{id:"T001",handle:"petalafterglow_7q",body:"我在演唱会上碰不到{{BOYFRIEND_NAME}}。\n只能在散场以后，蹲在地上捡一片他曾经站过的舞台上落下的纸花。\n我把那片纸花夹在日记里，珍惜得像什么宝物。\n可是她不需要纸花。\n她可以牵他的手，可以抱他，可以听见他在没有麦克风的时候说话。\n突然觉得我们之间的距离，原来从来都不只是舞台和观众席。",comments:[["@bluehour_m8","最后一句真的让我哭了。"],["@allyzsky_4p","我理解难过，但她也不是做错了什么才被喜欢。"],["@filmcloud_9r","那片纸花我也一直留着，现在不知道该怎么面对。"]]},
{id:"T002",handle:"moonreceipt_3v",body:"我每天睡前都会看他的照片。\n把手机亮度调到最低，怕明天上班起不来，却还是舍不得关掉。\n我以为这已经是我能离他最近的距离。\n结果有人根本不用透过屏幕，就能看见他刚睡醒的样子。\n原来我每天反复看的日常，对另一个人来说，只是普通的一天。",comments:[["@winterpage_6x","追星最难过的就是突然意识到距离。"],["@tinyorbit_2k","但偶像本来就有自己的私人生活啊。"],["@softlight_8n","不是不懂，只是还没办法接受。"]]},
{id:"T003",handle:"albumdust_8w",body:"我不是要他感谢我花过的钱。\n我买专辑、投票、熬夜看舞台，都是我自己愿意的。\n可是我真的有过那种错觉。\n觉得自己这么努力支持的人，至少会永远停留在我熟悉的样子。\n现在才知道，原来人不会因为被很多人喜欢，就停止拥有自己的爱情。",comments:[["@rosearchive_5t","这篇很成熟，但也很痛。"],["@orbitwalk_7c","花钱不等于拥有他，这点真的要分清楚。"],["@duskletter_4h","知道道理跟不难过是两回事。"]]},
{id:"T004",handle:"quietencore_2z",body:"我想了很久。\n我最讨厌的好像不是那个女生。\n而是我发现，自己曾经相信的那些小小的特别，可能根本没有那么特别。\n他在直播里说晚安，我真的会开心一整晚。\n可是他真正想说晚安的人，从来不是我们。",comments:[["@lucid_6p","这篇比直接骂人还痛。"],["@starfield_9k","直播的晚安本来就是对粉丝说的，跟恋爱不冲突。"],["@bluepetal_3n","我今天真的不想听道理。"]]},
{id:"T005",handle:"starlost_9f",body:"每次有人说「你们只是粉丝」，我都觉得很难过。\n我当然知道我只是粉丝。\n我从来没有真的以为他会爱上我。\n但那不代表我陪伴过的时间、投入过的感情，就可以被一句「只是粉丝」轻轻带过。\n我现在很失望。\n至少让我有失望的权利吧。",comments:[["@dawnviolet_4q","有失望的权利，也要尊重别人的生活。"],["@mintfilm_8v","我觉得她说的是粉丝的感情也是真的。"],["@silvercloud_2m","这两件事其实可以同时成立。"]]},
{id:"T006",handle:"fadedpolaroid_6n",body:"我看到有人说，只要{{BOYFRIEND_NAME}}幸福就好。\n可是他现在真的幸福吗？\n公司被骂，团员被牵连，粉丝站关站。\n我不知道这段感情是不是值得他承受这么多。\n我只是希望他不要有一天回头看，才发现自己失去了原本很珍惜的东西。",comments:[["@echo_7mt","这也是我最担心的。"],["@sunnyorbit_5p","幸福不是外人可以替他定义的。"],["@filmnight_3x","但团队受到影响也是现实。"]]},
{id:"T007",handle:"afterconcert_5r",body:"以前我最喜欢看{{BOYFRIEND_NAME}}的眼睛。\n他看向镜头的时候，我总觉得那里有很多想说的话。\n现在每次看到他的自拍，我都忍不住想，他拍完这张照片以后，是不是就去回她的讯息了。\n我讨厌自己开始这样想。\n也讨厌这件事让我连以前喜欢的照片都看不下去。",comments:[["@lilacpage_8s","我也是，旧照片突然变得很难看。"],["@honeyfilm_4w","不要用猜测去否定他以前的努力。"],["@cloudafter_6t","我知道，可是心情真的控制不了。"]]},
{id:"T008",handle:"orbitfarewell_4k",body:"今天把应援账号的通知关掉了。\n不是因为我突然讨厌他。\n而是我发现，现在每次看到他的名字，我第一个感觉已经不是开心。\n谢谢以前那些让我熬过很难日子的舞台。\n但我想先离开了。\n希望以后再听到他的歌，我能只记得当初喜欢他的心情。",comments:[["@silverpetal_7v","辛苦了，先照顾自己。"],["@allyzriver_2f","希望大家不要去骂脱粉的人。"],["@brightday_9q","我会继续支持，但尊重你离开。"]]},
{id:"T009",handle:"comebacktears_7m",body:"我真的想问，为什么偏偏是现在？\nALD1才刚走到这里。\n每个成员都在努力，ALLYZ也在努力。\n我们原本应该一起期待下一个舞台。\n现在所有讨论都变成了恋爱、公司声明、粉丝脱粉。\n我真的好不甘心。",comments:[["@frameblue_3r","我也觉得其他成员很可怜。"],["@daystar_8h","恋情曝光不是所有活动问题的唯一原因。"],["@orbitwave_5z","但现在焦点真的全被带走了。"]]},
{id:"T010",handle:"jealousorbit_2p",body:"我知道这样说很难看。\n可是我真的想问，她到底凭什么？\n我们隔着人群喊他的名字。\n她却可以在没有人看见的地方，叫他只属于她的称呼。\n我知道爱情不是排队领号码牌。\n但我还是嫉妒得快疯了。",comments:[["@pinkdusk_6n","最后一句太真实了。"],["@clearallyz_9x","嫉妒可以理解，但不要因此去骚扰她。"],["@midnightpage_4v","我也不想嫉妒，可是做不到。"]]},
{id:"T011",handle:"melodyashes_8c",body:"以前听ALD1的情歌，会觉得每一句都好浪漫。\n现在听到那些歌词，脑袋却一直想到他可能真的有一个想唱给她听的人。\n我知道歌不是只唱给我。\n但我今天真的没办法听完。",comments:[["@tenderstar_5m","我今天直接把歌单关掉了。"],["@blueorbit_7j","歌曲的意义也可以属于每个听的人。"],["@quietmoon_2x","我需要一点时间才能重新听。"]]},
{id:"T012",handle:"lastframe_3q",body:"MIDNIGHT FILM关站以后，我把她最后一张舞台照片存下来了。\n照片里的{{BOYFRIEND_NAME}}笑得很好看。\n我突然想到，镜头后面那个人，可能也曾经为这个笑容幸福过很多年。\n现在她决定不再拍了。\n原来连喜欢一个人的习惯，也会有结束的一天。",comments:[["@orbitglass_8p","我看到关站公告真的哭了。"],["@starletter_6v","站姐有权利离开，他也有权利恋爱。"],["@softblue_4k","希望大家都能好好往前走。"]]},
{id:"T013",handle:"brokenlight_5x",body:"我知道恋爱不是她一个人的决定。\n可是我现在真的没有办法对那个女生说祝福。\n每次看到她的事情，我就想到我们这几天经历的混乱。\n我不会去私讯她。\n但也不要要求我现在就喜欢她。",comments:[["@allyzrose_2q","不喜欢可以，但不要攻击就好。"],["@orbitgray_9m","我也是这个心情。"],["@clearfilm_7t","至少你知道不能去骚扰她。"]]},
{id:"T014",handle:"respectfirst_6h",body:"我也是ALLYZ。\n我也因为这件事难过。\n但我真的受不了有人把那个女生的私人资料当成战利品一样到处转。\n你可以不支持这段感情。\n可以脱粉，可以生气。\n但她不是你们拿来发泄情绪的工具。\n拜托停止。",comments:[["@moonriver_3k","终于有人说了。"],["@coldstar_8v","不支持恋情跟反对人肉搜索不冲突。"],["@nightorbit_5q","那些去私讯威胁的人真的太过分。"]]},
{id:"T015",handle:"ordinaryidol_9t",body:"我想了很久。\n我们喜欢的是一个会唱歌、会跳舞、会努力的人。\n不是一个永远不会喜欢别人的角色。\n如果{{BOYFRIEND_NAME}}真的喜欢她，我希望他至少可以不用因为这件事被当成罪人。\n我还是会去看他的舞台。",comments:[["@lightfilm_4n","谢谢你，我也是这样想。"],["@frostorbit_7p","可以支持，但也不能忽略团队影响。"],["@allyzsun_2w","我会继续当ALLYZ。"]]},
{id:"T016",handle:"unsentletters_4z",body:"我写过很多封不会真的寄出去的信。\n考试考不好时写。\n工作很累时写。\n第一次看演唱会回家也写。\n每一封最后都会写，希望你每天都幸福。\n可是现在真的知道他有自己的幸福了，我却发现自己没有想象中大方。\n原来祝福有时也需要练习。",comments:[["@petalblue_8r","这篇真的太温柔也太难过。"],["@starroad_5h","慢慢来，不用勉强自己。"],["@quietdawn_2m","我也写过好多信。"]]},
{id:"T017",handle:"whisperstage_7x",body:"我们要等直播，才能听见他的声音。\n要等回归，才能看到新的照片。\n要等演唱会，才能跟他待在同一个空间。\n而她可能只需要传一句「你在干嘛」。\n我不是觉得她有错。\n我只是突然很难过，原来我拼命等待的东西，对别人来说那么平常。",comments:[["@silvermoon_9p","我真的看哭了。"],["@brightfilm_3v","粉丝与恋人本来就是不同的关系。"],["@cloudsong_6k","知道，但还是好羡慕。"]]},
{id:"T018",handle:"votefatigue_5n",body:"我以前每天都设闹钟投票。\n上班休息的十分钟也在投。\n不是为了得到他的回报。\n只是想看他站在更大的舞台上。\n现在我突然没有力气打开投票App。\n我不是要他向我道歉。\n只是我好像需要重新找回喜欢他的理由。",comments:[["@orbitvote_2r","我也是，今天完全提不起劲。"],["@allyzhope_8c","先休息，喜欢不应该变成义务。"],["@bluehour_4m","我还是会帮团体投票。"]]},
{id:"T019",handle:"memoryclip_8q",body:"刚刚翻到以前的直播片段。\n{{BOYFRIEND_NAME}}说，希望ALLYZ每天都能过得幸福。\n我以前听到这句话真的会笑。\n今天却突然哭了。\n我知道他没有说谎。\n只是我没想到，有一天我会因为他的幸福而难过。",comments:[["@softfilm_3t","最后一句真的太痛了。"],["@starfield_6w","他希望粉丝幸福，粉丝也可以希望他幸福。"],["@nightblue_9k","我需要时间。"]]},
{id:"T020",handle:"teamfirst_3v",body:"我不是只追一个人。\n我喜欢的是整个ALPHA DRIVE ONE。\n所以我最难过的不是{{BOYFRIEND_NAME}}谈恋爱。\n而是其他成员明明也在努力，却突然要一起承受这些舆论。\n我希望他真的有想过团队。",comments:[["@allmember_7q","团粉真的很难受。"],["@fairorbit_4x","也不能把所有问题都归咎于一段恋情。"],["@teamlight_8m","希望公司把活动处理好。"]]},
{id:"T021",handle:"encoreagain_6p",body:"我今天还是把演唱会影片看完了。\n看到{{BOYFRIEND_NAME}}跑向舞台另一边的时候，还是忍不住笑。\n原来喜欢不会因为一则新闻就全部消失。\n我还是会难过。\n但如果下次有演唱会，我想我还是会去。",comments:[["@allyzday_2v","我也是。"],["@moonfilm_8x","不用急着决定要不要脱粉。"],["@silverstar_5k","希望还能看到他们站上舞台。"]]},
{id:"T022",handle:"distancehurt_9m",body:"我曾经在签售会上紧张到一句话都说不出来。\n回家以后懊恼了一整个星期。\n因为那十几秒是我准备很久才得到的机会。\n可是她可以跟他吵架，可以和好，可以一起度过普通的星期天。\n我知道不能比较。\n但我真的好羡慕。",comments:[["@cloudpink_4t","签售那段太有共鸣了。"],["@orbitkind_7r","她是恋人，不是抢走粉丝名额的人。"],["@duskblue_2p","我懂道理，但还是会羡慕。"]]},
{id:"T023",handle:"selfishstar_5w",body:"我明明知道{{BOYFRIEND_NAME}}没有答应过要单身一辈子。\n也知道我不可能真的跟他在一起。\n可是看到恋情新闻时，我第一个念头居然是希望他们分手。\n我被自己的想法吓到了。\n原来喜欢一个人，有时也会让自己变得很自私。",comments:[["@gentleorbit_8v","能意识到就已经很重要了。"],["@brokenmoon_3x","我也有过一样的念头。"],["@clearstar_6q","情绪可以有，但不要真的去伤害别人。"]]},
{id:"T024",handle:"coldencore_7h",body:"我不会骂她。\n也不会去她的IG留言。\n但我现在真的说不出祝福。\n我不想假装自己很成熟。\n我花了那么长时间喜欢一个人，总需要一点时间接受他有了恋人。",comments:[["@allyzquiet_4n","不祝福也没关系，尊重就好。"],["@orbitgray_9r","我现在也是这样。"],["@bluefilm_2k","至少不要伤害无辜的人。"]]},
{id:"T025",handle:"wakeuptimeline_8z",body:"Wake One的声明我看了。\n写了很多关于隐私跟恶意攻击的事。\n这些当然重要。\n但我还是希望公司能好好处理ALD1接下来的活动。\n不要让所有成员一直处于不确定的状态。\n粉丝也需要知道，团体接下来到底会怎么走。",comments:[["@teamorbit_3p","我最关心的是活动安排。"],["@respectallyz_6v","保护隐私也很重要，不能二选一。"],["@silverday_9t","希望公司之后有更明确的公告。"]]},
{id:"T026",handle:"realitycheck_4c",body:"有些话可能很难听。\n但我们真的需要记住，粉丝不是偶像的女朋友。\n我们可以因为他的舞台得到力量。\n也可以因为失望选择离开。\n但不能因为自己投入了很多感情，就认为他没有权利喜欢别人。",comments:[["@allyztruth_7m","这篇说得很好。"],["@sadpetal_2v","我知道，但今天真的不想被教育。"],["@orbitsoft_8q","尊重粉丝难过，也尊重他的生活。"]]},
{id:"T027",handle:"photocardbox_6x",body:"今天把桌上的小卡全部收进盒子里了。\n不是要丢掉。\n只是现在每次抬头看到他，我都会想起那些新闻。\n我希望过一阵子，再打开盒子的时候，我可以重新想起第一次抽到本命小卡的开心。",comments:[["@cardlover_9p","我今天也把小卡收起来了。"],["@moonarchive_4r","不要冲动丢掉，以后可能会后悔。"],["@softallyz_7k","给自己一点时间。"]]},
{id:"T028",handle:"privateisprivate_3n",body:"我真的不懂，为什么有人觉得偶像恋爱曝光，就可以去查另一个人的私人资料。\n她不是站在舞台上的人。\n也没有义务向粉丝解释自己的生活。\n你可以批评公司的处理方式。\n但不要把一个普通女生当成所有情绪的出口。",comments:[["@clearorbit_8w","完全同意。"],["@fanvoice_5q","我对恋情失望，但反对公开个资。"],["@nightpetal_2m","那些威胁私讯真的该停止。"]]},
{id:"T029",handle:"",body:"我之前真的太生气了。\n所以跑去她的Instagram私讯。\n没想到她居然回我了。\n我现在把对话放在这里。\n你们自己看她是怎么说的。\n我真的不知道该怎么形容现在的心情。",comments:[["@screenshottea_8p","居然真的回了？"],["@fairreply_3v","你先私讯别人骂人，现在还截图公开？"],["@orbitanger_6q","我想看完整对话，不想只看一边说法。"]]},
{id:"T030",handle:"replydebate_7t",body:"刚刚看到有人把那个女生的IG回复截图发出来。\n我真的觉得这件事已经失控了。\n有人说她回得太冷淡。\n有人说她不应该回复。\n可是如果她完全不回，又会有人说她心虚。\n到底要她怎么做，大家才会满意？",comments:[["@orbitlogic_4m","她怎么回都会被骂吧。"],["@hurtallyz_9x","粉丝失望也不是完全没理由。"],["@quietfilm_2r","失望不代表可以去骚扰。"]]},
{id:"T031",handle:"wordbyword_5k",body:"我看了那张IG截图好几次。\n大家现在都在分析她回复的每个字。\n可是我突然觉得很荒谬。\n我们真的已经到了要把一个陌生女生的私人讯息拆成一个字一个字讨论的程度吗？\n我不知道该不该继续看下去了。",comments:[["@starwatch_7p","真的，这件事越来越可怕。"],["@sadorbit_3x","但截图都公开了，大家当然会讨论。"],["@respectblue_8n","公开不代表这样做就是对的。"]]},
{id:"T032",handle:"nomoretears_2h",body:"我今天在捷运上看到他的照片，眼泪突然掉下来。\n旁边的人一定觉得我很奇怪。\n我也觉得自己很奇怪。\n明明只是喜欢一个隔着屏幕的人。\n却真的因为他的恋爱新闻难过成这样。\n我希望明天醒来，可以不要再为这件事哭了。",comments:[["@comfortstar_6q","抱抱你，先休息。"],["@allyzmoon_9v","你投入的感情是真的，不用觉得丢脸。"],["@clearheart_4m","难过可以，但也记得照顾自己的生活。"]]},
{id:"T033",handle:"loveisnotdebt_8r",body:"我知道很多ALLYZ很难过。\n但我不希望我们最后变成用曾经的支持去惩罚{{BOYFRIEND_NAME}}的人。\n那些一起唱过的歌、一起看过的舞台都是真的。\n他谈恋爱，也不会让那些回忆突然变成假的。\n至少我不想这样看待自己曾经的喜欢。",comments:[["@warmorbit_3t","这篇说得太好了。"],["@brokenfilm_7x","我还没办法这么想。"],["@softblue_5p","慢慢来，不需要所有人今天就接受。"]]},
{id:"T034",handle:"lastalbum_4v",body:"我想我不会再买下一张专辑了。\n不是要威胁他。\n也不是希望他跟谁分手。\n只是我现在没有以前那种，看到预购公告就立刻打开购物车的心情。\n原来脱粉不一定是突然讨厌。\n有时只是慢慢没有力气再喜欢了。",comments:[["@albumgirl_8q","最后一句真的很难过。"],["@allyzstay_2m","我会继续买，但尊重你。"],["@moonarchive_6k","先不要急着做决定也可以。"]]},
{id:"T035",handle:"unheardcheer_9n",body:"我有时会想，{{BOYFRIEND_NAME}}会知道吗？\n知道有人因为他开始努力学韩文。\n知道有人因为想看他的舞台，第一次自己搭飞机出国。\n知道有人在最难过的时候，靠着他的歌撑过去。\n我不是要他回报什么。\n只是希望他知道，那些喜欢过他的心情，都不是假的。",comments:[["@blueletter_4x","我就是因为他第一次出国。"],["@starlight_7v","他应该知道粉丝的支持有多重要。"],["@gentleallyz_2q","希望粉丝也能相信，他以前的感谢是真的。"]]},
{id:"T036",handle:"tomorrowallyz_6w",body:"今天的Threads全都是难过的人。\n有人脱粉，有人生气，有人还在努力替他说话。\n我也不知道自己现在算哪一种。\n但刚刚洗澡的时候，我还是不自觉哼了ALD1的歌。\n原来喜欢一个人的习惯，不会因为一夜之间发生的事就全部消失。\n也许明天，我还是会按下播放键。",comments:[["@orbitmorning_8k","我也是。"],["@cloudallyz_3r","不用急着替自己的心情分类。"],["@starroad_5n","希望大家明天都能好一点。"]]}
];
export const makeThreadsBacklash = (boyfriendName:string, evidence:InstagramReplyEvidence, time:string, x002Published:boolean):Item[] => seeds.map((seed,index)=>{
 const handle=seed.id==="T029"?evidence.attackerHandle:seed.handle;
 const body=seed.body.replace(/\{\{BOYFRIEND_NAME\}\}/g,boyfriendName);
 const comments=seed.comments.map(([author,text])=>author+"："+text);
 const item=makeItem({id:"threads-backlash-"+seed.id.toLowerCase(),title:seed.id+" · "+handle,sender:handle,body,time,kind:"post",likes: [12800,9300,21400,17600,8200,15300][index%6],comments,avatar:"",folder:"threads-backlash",meta:{eventId:"threads-backlash-after-first-ig-reply",postId:seed.id,handle,authorId:seed.id==="T029"?evidence.attackerUserId:"threads-user-"+seed.id.toLowerCase(),reposts:String(320+index*47),replyCount:String(comments.length),visibilityCondition:seed.id==="T025"?"X002": "always",evidenceId:seed.id==="T029"||seed.id==="T030"?"ig-first-reply-evidence":"",evidenceConversationId:seed.id==="T029"||seed.id==="T030"?evidence.conversationId:"",evidenceAttackerHandle:seed.id==="T029"||seed.id==="T030"?evidence.attackerHandle:"",evidenceAttackerText:seed.id==="T029"||seed.id==="T030"?evidence.attackerText:"",evidencePlayerReplyText:seed.id==="T029"||seed.id==="T030"?evidence.playerReplyText:"",evidenceCapturedAt:seed.id==="T029"||seed.id==="T030"?String(evidence.capturedAt):""}});
 if(seed.id==="T029") item.title=seed.id+" · "+handle;
 if(seed.id==="T030") item.body += "\n\n引用：T029公开的对话截图。";
 if(seed.id==="T025"&&!x002Published) item.hidden=true;
 return item;
});
export function createThreadsPlayerReply(postId:string,text:string,time:string):Item{
 return makeItem({id:"threads-player-reply-"+crypto.randomUUID(),title:postId,sender:"allyz_1101",body:text,time,folder:"threads-reply",outgoing:true,meta:{postId,authorHandle:"@allyz_1101",isPlayerReply:"true",createdAt:String(Date.now())}});
}
export function hasThreadsX002(posts:Item[]):boolean{return posts.some(p=>p.meta?.eventId==="X002"||p.id==="boyfriend-stage2-X002"||p.id==="x-story-X002"||p.meta?.stage2Event==="X002");}

export type ThreadsReplyRecord = {
  id: string;
  postId: string;
  authorId: string;
  authorHandle: string;
  text: string;
  createdAt: number;
  isPlayerReply: boolean;
  parentReplyId?: string;
};
export function createThreadsReplyRecord(postId: string, text: string, createdAt = Date.now(), parentReplyId?: string): ThreadsReplyRecord {
  return {
    id: "threads-reply-" + crypto.randomUUID(),
    postId,
    authorId: "player-allyz_1101",
    authorHandle: "@allyz_1101",
    text,
    createdAt,
    isPlayerReply: true,
    ...(parentReplyId ? { parentReplyId } : {}),
  };
}
