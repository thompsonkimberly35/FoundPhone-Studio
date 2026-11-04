import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { compileStory } from "../src/story-engine/compiler";

const blank = JSON.parse(readFileSync(new URL("../stories/blank/story.json", import.meta.url), "utf8"));

async function start(page: Page) {
  const story = structuredClone(blank);
  story.id = "threads-player-post-e2e";
  story.installedApps.push("threads");
  story.content.threads = [];
  await page.route("**/work.json", (route) => route.fulfill({ json: compileStory(story).work }));
  await page.goto("/");
  await page.locator("button.unlock-btn").click();
}

async function openThreads(page: Page) {
  await page.getByRole("button", { name: "打开App Store", exact: true }).click();
  await page.getByPlaceholder("搜索全部App").fill("Threads");
  await page.locator(".runtime-library-row").getByRole("button", { name: "打开", exact: true }).click();
  await expect(page.locator(".app-screen:not([inert])")).toHaveCSS("transform", "none");
}

test("Threads player post image, fan activity, nested reply and save recovery", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await start(page);
  await openThreads(page);

  await page.getByRole("button", { name: "新建串文", exact: true }).last().click();
  const text = "今天終於鼓起勇氣說出我的感受，也希望大家理解並支持 ALD1。";
  await page.getByRole("textbox", { name: "串文内容" }).fill(text);
  await page.locator("#threads-player-photo").setInputFiles({
    name: "player-post.png",
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pVQAAAAASUVORK5CYII=", "base64"),
  });
  await expect(page.locator(".tr-compose-photo img")).toBeVisible();
  await page.getByRole("button", { name: "发布", exact: true }).click();
  await expect(page.locator(".tr-post").filter({ hasText: text })).toBeVisible();
  await expect(page.locator(".tr-post").filter({ hasText: text }).locator("img")).toBeVisible();

  await page.getByRole("button", { name: "返回桌面", exact: true }).click();
  await page.waitForTimeout(3600);
  await expect(page.locator(".global-kakao-notification")).toBeVisible();
  await openThreads(page);
  await expect(page.locator(".global-kakao-notification")).toHaveCount(0);
  await page.getByRole("button", { name: "Threads动态", exact: true }).click();
  await expect(page.locator(".tr-activity").first()).toBeVisible({ timeout: 10000 });
  await page.locator(".tr-activity").first().click();
  await expect(page.locator(".tr-fan-reply").first()).toBeVisible();
  await page.locator(".tr-fan-reply").first().getByRole("button", { name: "回覆", exact: true }).click();
  await page.getByPlaceholder("回覆這則留言").fill("謝謝你願意回覆我。");
  await page.locator(".tr-reply").getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.locator(".tr-nested-reply")).toContainText("謝謝你願意回覆我。");

  await page.reload();
  await page.getByRole("button", { name: "轻触解锁" }).click();
  await openThreads(page);
  await expect(page.locator(".tr-post").filter({ hasText: text })).toBeVisible();
  expect(errors).toEqual([]);
});
