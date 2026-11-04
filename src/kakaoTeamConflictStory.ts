import { ALD1_SECRET_ADMIRER_MEMBERS, isAdultMember, secureRandomIndex, type SecretAdmirerMember } from "./kakaoSecretAdmirer";

export type TeamConflictChoice = { key: string; text: string; next: string };
export type TeamConflictNode = { id: string; lines: string[]; choices: TeamConflictChoice[]; result?: string };
const node = (id: string, lines: string[], choices: [string,string,string][], result?: string): TeamConflictNode => ({
  id, lines, choices: choices.map(([key,text,next])=>({key,text,next})), ...(result ? {result} : {}),
});

// B 的角色只从明确登记出生日期的成年成员中抽选；年龄资料缺失时不会视为成年。
export function getTeamConflictCandidates(boyfriendId: string, friendId: string, secretAdmirerId: string, asOf = new Date()) {
  if (!boyfriendId || !friendId || !secretAdmirerId) return [];
  return ALD1_SECRET_ADMIRER_MEMBERS.filter((member) =>
    isAdultMember(member, asOf) &&
    member.id !== boyfriendId &&
    member.id !== friendId &&
    member.id !== secretAdmirerId
  );
}
export function chooseTeamConflictMember(boyfriendId: string, friendId: string, secretAdmirerId: string, getRandomValues?: (array: Uint32Array) => Uint32Array, asOf = new Date()): SecretAdmirerMember | null {
  const candidates = getTeamConflictCandidates(boyfriendId, friendId, secretAdmirerId, asOf);
  if (!candidates.length) return null;
  return candidates[secureRandomIndex(candidates.length, getRandomValues)];
}

const outcomes: Record<string, string[]> = {
  S01:["今天先到这里吧。","我需要整理一下自己的情绪。","你也好好休息，我们明天再谈。"],
  S02:["好，我不会再一直劝你分手。","但如果团队真的受到影响，我还是会说出自己的想法。"],
  S03:["我知道了。","我不应该把自己的标准强加在你们身上。","我会试着用别的方式处理这件事。"],
  S04:["如果你真的需要一点距离，就先照顾好自己。","但不要因为我说的话就急着做决定。"],
  S05:["……我明白了。","你不会因为我反对，就放弃他。","那我希望你们真的能一起面对后果。"],
  S06:["好，你先跟他好好谈。","我不会再逼你现在回答。","希望你最后做出的决定，是你真正想要的。"],
  S07:["对不起，我今天说了很多伤人的话。","我需要一点时间整理好自己。","希望你也能好好休息。"],
  S08:["……好。","如果你现在不想再跟我联络，我会尊重。","今天的事情是我做得太过分，对不起。"],
  S09:["我会找机会再跟他谈。","这次我不想只是吵架。","我希望我们至少能把话说清楚。"],
  S10:["我们可能还是有不同的想法。","但我会试着尊重你们。","我也希望你们能理解其他成员的难处。"],
  S11:["我今天想了很多。","别人不一定要走跟我一样的路。","对不起，今天让你承受这些。"],
  S12:["谢谢你愿意听我说以前的事情。","我需要先处理好自己的过去。","希望有一天，我也能真正放下。"],
};
const themes = [
  ["我知道今天公司的会议让所有人都很疲惫。","原本安排好的行程也被打乱了。","我不是不知道你也受了委屈。"],
  ["我希望你认真想想这段关系接下来会带来什么影响。","其他成员也有自己的压力。","不是一句对不起就能让事情恢复原样。"],
  ["我希望你们先暂停这段关系。","至少在现在这个时候，他需要把注意力放回团队。","我知道这对你不公平，但我想不到别的办法。"],
  ["我以前也有过很喜欢的人。","那个人不是短暂的好感，而是我认真想过未来的人。","可是最后，我选择不再联络。"],
  ["我告诉自己那是正确的决定。","我不想影响团队，也不想让粉丝失望。","我害怕自己的感情会毁掉大家努力得到的机会。"],
  ["今天看到他为了你跟公司争辩，我真的很不甘心。","为什么我以前连试着争取都不敢？","为什么他现在却可以做出不同的选择？"],
  ["我可能把自己的遗憾投射到你们身上了。","我希望他也做出跟我一样的选择。","这样我就不用一直怀疑自己当年是不是太懦弱。"],
  ["我知道我越界了。","我可以担心团队，却不能替你们决定感情。","我会为今天说过的话负责。"],
  ["我不是想跟他变成敌人。","我们曾经一起努力到现在。","我希望有一天还能好好沟通。"],
  ["我现在还不知道该怎么面对那段过去。","我不想因为遗憾就打扰对方现在的生活。","但我至少应该学会承认自己的后悔。"],
  ["你可以理解我的难过，但不需要接受我的要求。","每个人都有选择自己生活的权利。","我需要时间学会尊重这一点。"],
];
const prompts = [
  ["你想说什么？","如果是今天的事，我已经很累了。","你是不是也在怪我？"],
  ["我知道造成大家困扰了。","你这是在责怪我吗？","这也不是我们故意的。"],
  ["所以你希望我怎么做？","你一定要在这时候说这些吗？","我知道大家辛苦，但我也很难过。"],
  ["你不能把责任全部推给他。","你是不是跟他吵架了？","所以你觉得我们不应该交往？"],
  ["我会跟他一起想办法。","你是不是希望我们分手？","我不觉得分手就能解决一切。"],
  ["你说话真的很伤人。","我可以理解你担心团队。","你根本不了解我们的关系。"],
  ["谈恋爱不代表不负责任。","你觉得偶像就不应该恋爱？","那你希望我们承担什么责任？"],
  ["你是在叫我跟他分手？","我不会因为你一句话就分手。","也许暂时分开真的比较好。"],
  ["你现在是在对我发脾气。","你是不是有其他事情没说？","我们先冷静一下。"],
  ["你可以关心我，又不要求我分手吗？","你根本没有站在我的立场想。","我也不想继续受伤。"],
];
const followUps = [
  ["我会跟他谈，但不会替你劝分手。","你自己也曾经这样选择过吗？","我希望你也理解我们。"],
  ["你以前到底经历过什么？","你不应该拿自己的过去惩罚他。","你是不是开始后悔自己的选择？"],
  ["你是在嫉妒他有勇气。","你不应该因此希望他失去我。","你当时为什么没有争取？"],
  ["我愿意跟他一起承担。","我也开始不知道了。","你只是想让事情变得对自己比较简单。"],
  ["我理解，但不会照你说的做。","那我们一起想其他办法。","你说这些只是想让自己好过一点吧？"],
];
const story: Record<string,TeamConflictNode> = {};
for (let i=1;i<=101;i++) {
  const id="B"+String(i).padStart(3,"0");
  const theme=themes[(i-1)%themes.length];
  const resultIndex=Math.floor((i-1)/8);
  const resultId=resultIndex<12 && i%8===1 ? "S"+String(resultIndex+1).padStart(2,"0") : "";
  const nextA=i<101?"B"+String(i+1).padStart(3,"0"):"S12";
  const nextB=i<100?"B"+String(i+2).padStart(3,"0"):"S11";
  const nextC=resultId || (i<99?"B"+String(i+3).padStart(3,"0"):"S10");
  const replies = followUps[(i-1)%followUps.length];
  const lines = i===1
    ? ["你现在有空吗？","我有些话想跟你说。","可能不太好听，但我觉得今天一定要说清楚。"]
    : i===2
      ? ["今天公司的会议，你知道吗？","我们所有人都被叫过去了。","原本安排好的事情也被打乱。","而这一切都是因为你们的恋情曝光。"]
      : i===3
        ? ["我知道你很累。","但你不是唯一一个很累的人。","今天其他成员也很累，有人甚至不知道接下来的行程会不会被取消。"]
        : i===4
          ? ["我不是只怪你。","我更生他的气。","他明明知道自己是偶像，也知道自己不是一个人在活动。","为什么还要让事情变成这样？"]
          : [theme[(i-1)%theme.length],theme[(i+1)%theme.length],theme[(i+2)%theme.length]];
  const choiceTexts = i===1
    ? ["你想说什么？","如果是关于今天的事，我已经很累了。","你是不是也在怪我？"]
    : i===2
      ? ["我知道造成大家困扰了。","你这是在责怪我吗？","这也不是我们故意的。"]
      : i===3
        ? ["所以你希望我怎么做？","你一定要在这时候说这些吗？","我知道大家辛苦，但我也很难过。"]
        : i===4
          ? ["你不能把责任全部推给他。","你是不是跟他吵架了？","所以你觉得我们不应该交往？"]
          : replies;
  story[id]=node(id,lines,[["A",choiceTexts[0],nextA],["B",choiceTexts[1],nextB],["C",choiceTexts[2],nextC]]);
}
for(let i=1;i<=12;i++){const id="S"+String(i).padStart(2,"0");story[id]=node(id,outcomes[id],[] ,id);}
export const TEAM_CONFLICT_STORY=story;
export function getTeamConflictNode(id:string):TeamConflictNode|undefined{return TEAM_CONFLICT_STORY[id];}
export function getTeamConflictChoice(nodeId:string,key:string):TeamConflictChoice|undefined{return TEAM_CONFLICT_STORY[nodeId]?.choices.find(choice=>choice.key===key);}
export function getTeamConflictNodeCount():number{return Object.keys(TEAM_CONFLICT_STORY).length;}
export function validateTeamConflictGraph():string[]{const ids=new Set(Object.keys(TEAM_CONFLICT_STORY));const errors:string[]=[];for(const current of Object.values(TEAM_CONFLICT_STORY)){for(const choice of current.choices){if(!ids.has(choice.next))errors.push(current.id+" -> "+choice.next);}}const visited=new Set<string>(["B001"]);const pending=["B001"];while(pending.length){const current=TEAM_CONFLICT_STORY[pending.pop()!];for(const choice of current?.choices??[]){if(!visited.has(choice.next)){visited.add(choice.next);pending.push(choice.next);}}}for(const id of [...Array.from({length:101},(_,i)=>"B"+String(i+1).padStart(3,"0")),...Object.keys(outcomes)])if(!visited.has(id))errors.push("unreachable "+id);return errors;}
