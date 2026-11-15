import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
await mkdir("work", { recursive: true });
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  headless: true,
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  timezoneId: "Asia/Novosibirsk",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(process.env.APP_URL ?? "http://localhost:5173");
await page.getByRole("button", { name: "Календарь", exact: true }).click();
await page
  .getByRole("button", { name: "Добавить задачу", exact: true })
  .click();
await page.locator("[name=title]").fill("Проверка размещения");
await page
  .getByRole("switch", { name: "Добавить время выполнения", exact: true })
  .check();
await page.locator("[name=hours]").fill("2");
await page.getByRole("button", { name: "Сохранить", exact: true }).click();
assert.equal(await page.locator("dialog").count(), 0);
await page.getByRole("button", { name: "Месяц", exact: true }).click();
const day = await page.evaluate(() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
});
await page
  .locator(`.fc-daygrid-day[data-date="${day}"] .fc-daygrid-day-frame`)
  .click({ position: { x: 15, y: 40 } });
await page.locator(".fc-timeGridDay-view").waitFor();
const slot = page.locator('.fc-timegrid-slot-lane[data-time="10:00:00"]');
await slot.click();
await page.locator(".placement-banner").waitFor({ state: "detached" });
let tasks = await page.evaluate(
  () => JSON.parse(localStorage.getItem("study-planner.tasks.v2")).tasks,
);
assert.equal(tasks[0].schedule_blocks.length, 1);
assert.equal(
  Date.parse(tasks[0].schedule_blocks[0].ends_at) -
    Date.parse(tasks[0].schedule_blocks[0].starts_at),
  7200000,
);
await page.reload();
await page.getByRole("button", { name: "Календарь", exact: true }).click();
await page.locator(".fc-event").first().waitFor();
await page.screenshot({ path: "work/calendar-desktop.png" });
await page.getByRole("button", { name: "Задачи на день", exact: true }).click();
await page
  .getByRole("button", { name: "Выполнено: Проверка размещения", exact: true })
  .click();
await page.getByRole("button", { name: "Календарь", exact: true }).click();
await page.locator(".calendar-completed").waitFor();
await page
  .getByRole("button", { name: "Добавить событие", exact: true })
  .click();
await page.locator("[name=title]").fill("Лекция");
await page.locator("[name=start]").fill("14:00");
await page.locator("[name=end]").fill("15:00");
await page.locator("[name=weekly]").check();
await page.getByRole("button", { name: "Сохранить", exact: true }).click();
await page.getByRole("button", { name: "Месяц", exact: true }).click();
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(300);
await page.screenshot({ path: "work/calendar-mobile.png" });
console.log(
  await page
    .locator(".fc")
    .evaluate((e) => ({ width: e.clientWidth, scroll: e.scrollWidth })),
);
for (const width of [320, 390, 760, 1440]) {
  await page.setViewportSize({ width, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  const nav = await page.locator(".navigation").boundingBox();
  assert(nav.y + nav.height <= 844);
}
assert.deepEqual(errors, []);
console.log(
  "Chromium: desktop/mobile, month→day→manual placement, reload, completion sync, weekly event, page overflow: PASS",
);
await browser.close();
