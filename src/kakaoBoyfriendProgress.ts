export type BoyfriendStoryStage = "stage2" | "stage3";

export function getBoyfriendStageResultKey(stage: BoyfriendStoryStage): "boyfriend-stage2-result" | "boyfriend-stage3-result" {
  return stage === "stage2" ? "boyfriend-stage2-result" : "boyfriend-stage3-result";
}

export function getBoyfriendStageHistoryKey(stage: BoyfriendStoryStage): "boyfriend-stage2-history" | "boyfriend-stage3-history" {
  return stage === "stage2" ? "boyfriend-stage2-history" : "boyfriend-stage3-history";
}

export function getBoyfriendStageNodeKey(stage: BoyfriendStoryStage): "boyfriend-stage2-node" | "boyfriend-stage3-node" {
  return stage === "stage2" ? "boyfriend-stage2-node" : "boyfriend-stage3-node";
}
