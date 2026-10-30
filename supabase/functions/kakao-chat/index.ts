import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return Response.json({ error: "AI服务尚未配置，请稍后再试。" }, { status: 503, headers: cors });

  try {
    const { character, role, playerText, history = [] } = await req.json();
    if (typeof character !== "string" || !character || typeof playerText !== "string" || !playerText) {
      return Response.json({ error: "缺少聊天内容。" }, { status: 400, headers: cors });
    }
    const persona = role === "boyfriend"
      ? "你是玩家选择的男友。你温柔、亲密、自然，有恋爱中的默契，但不夸张、不油腻。"
      : "你是玩家选择的知心好友。你亲切、可靠、善于倾听，像关系很好的朋友。";
    const transcript = Array.isArray(history) ? history.slice(-12).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content).slice(0, 1000),
    })) : [];
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: Deno.env.get("OPENAI_MODEL") || "gpt-4.1-mini",
        instructions: `你正在扮演游戏《捡手机》中的角色「${character}」。${persona} 全程使用简体中文，回复像真实即时通讯消息，通常1至3句，避免旁白、括号动作和AI自我介绍。只回应玩家刚刚选择发送的话，并结合最近聊天上下文。`,
        input: [...transcript, { role: "user", content: playerText }],
        max_output_tokens: 180,
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("OpenAI request failed", response.status, detail.slice(0, 500));
      return Response.json({ error: "暂时无法生成回复，请稍后重试。" }, { status: 502, headers: cors });
    }
    const data = await response.json();
    const reply = (data.output ?? []).flatMap((item: any) => item.content ?? [])
      .filter((part: any) => part.type === "output_text")
      .map((part: any) => part.text).join("\\n").trim();
    if (!reply) throw new Error("Empty model response");
    return Response.json({ reply }, { headers: cors });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "聊天服务发生错误，请稍后再试。" }, { status: 500, headers: cors });
  }
});
