import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, test } from "node:test";
import { JSDOM } from "jsdom";
import { createServer } from "vite";

let environment;
let server;
let container;
let root;
let App;
let model;
let storage;
let time;
let act;
let createElement;
let createRoot;

before(async () => {
  environment = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost/",
  });
  globalThis.window = environment.window;
  globalThis.document = environment.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  ({ act, createElement } = await import("react"));
  ({ createRoot } = await import("react-dom/client"));
  // Load the real TSX modules without starting an HTTP or preview server.
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
  });
  ({ App } = await server.ssrLoadModule("/src/app/App.tsx"));
  model = await server.ssrLoadModule("/src/features/tasks/taskModel.ts");
  storage = await server.ssrLoadModule("/src/features/tasks/taskStorage.ts");
  time = await server.ssrLoadModule("/src/shared/time.ts");
  globalThis.FormData = environment.window.FormData;
  environment.window.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
});
beforeEach(async () => {
  window.localStorage.clear();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(() => root.render(createElement(App)));
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
});
after(async () => {
  await server?.close();
  environment?.window.close();
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});

function getNavigationButton(label) {
  const button = container.querySelector(`nav button[aria-label="${label}"]`);
  assert.ok(button, `Navigation button missing: ${label}`);
  return button;
}

test("Only the five requested sections appear in icon navigation", () => {
  assert.deepEqual(
    [...container.querySelectorAll("nav button")].map((button) =>
      button.getAttribute("aria-label"),
    ),
    [
      "Задачи на день",
      "Календарь",
      "Таймер Pomodoro",
      "Задания за монетки",
      "Магазин предметов",
    ],
  );
  assert.equal(container.querySelectorAll('[aria-current="page"]').length, 1);
  assert.equal(
    getNavigationButton("Задачи на день").getAttribute("aria-current"),
    "page",
  );
  assert.equal(container.querySelector(".nav-label"), null);
});

test("Fresh storage starts empty with current local clock and unchanged scroll structure", () => {
  assert.equal(container.querySelectorAll(".task-card").length, 0);
  assert.equal(
    container.querySelector(".room-date > span:last-child").textContent,
    new Date().toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
  const region = container.querySelector('.tasks-paper[role="region"]');
  assert.equal(region.tabIndex, 0);
  assert.equal(
    region.contains(container.querySelector(".panel-heading")),
    false,
  );
  assert.equal(region.contains(container.querySelector(".pet-room")), false);
});

test("Responsive room viewports preserve the illustration ratio and keep gradient IDs independent", () => {
  const desktop = container.querySelector(".room-illustration--desktop");
  const mobile = container.querySelector(".room-illustration--mobile");
  assert.ok(desktop);
  assert.ok(mobile);
  assert.equal(desktop.getAttribute("preserveAspectRatio"), "xMidYMid slice");
  assert.equal(mobile.getAttribute("preserveAspectRatio"), "xMidYMid meet");
  const desktopBox = desktop.getAttribute("viewBox").split(/\s+/).map(Number);
  const mobileBox = mobile.getAttribute("viewBox").split(/\s+/).map(Number);
  assert.ok(
    mobileBox[3] < desktopBox[3],
    "Mobile composition uses its own viewport, not stretched artwork",
  );
  const gradientIds = [
    ...container.querySelectorAll(".room-illustration [id]"),
  ].map((element) => element.id);
  assert.equal(new Set(gradientIds).size, gradientIds.length);
  for (const illustration of [desktop, mobile]) {
    for (const element of illustration.querySelectorAll('[fill^="url(#"]')) {
      const id = element.getAttribute("fill").slice(5, -1);
      assert.ok(
        [...illustration.querySelectorAll("[id]")].some(
          (target) => target.id === id,
        ),
      );
    }
  }
});

for (const label of [
  "Календарь",
  "Таймер Pomodoro",
  "Задания за монетки",
  "Магазин предметов",
]) {
  test(`${label}: existing navigation opens a placeholder and can return to the task list`, async () => {
    const button = getNavigationButton(label);
    await act(() => button.click());
    assert.equal(button.getAttribute("aria-current"), "page");
    assert.equal(container.querySelector(".workspace h1").textContent, label);
    assert.match(
      container
        .querySelector(".feature-placeholder")
        .getAttribute("aria-label"),
      /пока не реализован/,
    );
    assert.equal(container.querySelectorAll(".task-card").length, 0);
    assert.ok(container.querySelector(".pet-room"));
    await act(() => getNavigationButton("Задачи на день").click());
    assert.equal(container.querySelectorAll(".task-card").length, 0);
  });
}

function click(text) {
  const button = [...container.querySelectorAll("button")].find(
    (node) =>
      node.textContent === text || node.getAttribute("aria-label") === text,
  );
  assert.ok(button, `Missing button: ${text}`);
  return act(() => button.click());
}
function fill(name, value) {
  const input = container.querySelector(`[name="${name}"]`);
  assert.ok(input);
  // Uncontrolled form fields are read by FormData on submit.
  input.value = value;
}
async function save() {
  await act(() =>
    container
      .querySelector("form")
      .dispatchEvent(
        new window.Event("submit", { bubbles: true, cancelable: true }),
      ),
  );
}
async function remount() {
  await act(() => root.unmount());
  root = createRoot(container);
  await act(() => root.render(createElement(App)));
}
async function add(
  title = "Подготовить доклад",
  deadline = `${time.localDay(new Date())}T23:59`,
) {
  await click("Добавить задачу");
  fill("title", title);
  fill("hours", "1");
  fill("minutes", "15");
  fill("deadline", deadline);
  fill("category", "Учёба");
  await save();
}
function stored() {
  return storage.createTaskRepository(window.localStorage).load();
}

test("Create via modal, persist every field, edit without duplication, retain actual duration", async () => {
  await add();
  assert.equal(container.querySelectorAll(".task-card").length, 1);
  const original = stored()[0];
  assert.equal(original.estimated_minutes, 75);
  assert.equal(original.actual_minutes, 0);
  assert.equal(original.category, "Учёба");
  await click("Редактировать: Подготовить доклад");
  fill("title", "Исправленный доклад");
  fill("minutes", "45");
  await act(() =>
    container.querySelector('[name="color"][value="sage"]').click(),
  );
  await save();
  assert.equal(stored().length, 1);
  assert.equal(stored()[0].id, original.id);
  assert.equal(stored()[0].title, "Исправленный доклад");
  assert.equal(stored()[0].estimated_minutes, 105);
  assert.equal(stored()[0].actual_minutes, 0);
  assert.equal(stored()[0].color, "sage");
  await remount();
  assert.equal(
    container.querySelector(".task-card h3").textContent,
    "Исправленный доклад",
  );
});

test("Completion and undo persist across reload; navigation retains tasks", async () => {
  await add();
  await click("Выполнено: Подготовить доклад");
  assert.equal(stored()[0].completed, true);
  await remount();
  assert.equal(
    container.querySelector(".task-checkbox").getAttribute("aria-pressed"),
    "true",
  );
  await click("Выполнено: Подготовить доклад");
  assert.equal(stored()[0].completed, false);
  await click("Календарь");
  await click("Задачи на день");
  assert.equal(container.querySelectorAll(".task-card").length, 1);
});

test("Deletion requires confirmation; cancellation preserves task; empty list survives reload", async () => {
  await add();
  await click("Редактировать: Подготовить доклад");
  await click("Удалить");
  await click("Отмена");
  assert.equal(stored().length, 1);
  await click("Удалить");
  await click("Удалить навсегда");
  assert.deepEqual(stored(), []);
  assert.equal(container.querySelectorAll(".task-card").length, 0);
  await remount();
  assert.deepEqual(stored(), []);
  assert.equal(container.querySelectorAll(".task-card").length, 0);
});

test("Invalid title, missing deadline and nonpositive duration cannot be stored", async () => {
  const valid = {
    title: "Задача",
    estimated_minutes: 30,
    deadline: new Date().toISOString(),
    category: "",
    color: "blue",
  };
  for (const input of [
    { title: "  " },
    { deadline: "" },
    { estimated_minutes: 0 },
    { estimated_minutes: -10 },
    { estimated_minutes: 1.5 },
  ]) {
    assert.throws(() => model.createTask({ ...valid, ...input }));
  }
  await click("Добавить задачу");
  fill("title", "Задача");
  fill("minutes", "0");
  await save();
  assert.match(
    container.querySelector("dialog [role=alert]").textContent,
    /больше нуля/,
  );
  assert.deepEqual(stored(), []);
  fill("minutes", "-1");
  await save();
  assert.ok(container.querySelector("dialog [role=alert]"));
  assert.deepEqual(stored(), []);
});

test("Local selected day and overdue section partition tasks without duplicates; completed tasks remain on their day", async () => {
  const now = new Date("2026-11-15T12:00:00");
  const input = {
    title: "Задача",
    estimated_minutes: 30,
    category: "",
    color: "peach",
  };
  const tasks = [
    model.createTask({ ...input, deadline: "2026-11-15T13:00:00" }, "today"),
    model.createTask({ ...input, deadline: "2026-11-14T13:00:00" }, "late"),
    model.createTask({ ...input, deadline: "2026-11-16T13:00:00" }, "tomorrow"),
  ];
  const result = model.selectTasks(tasks, "2026-11-15", now);
  assert.deepEqual(
    result.daily.map((task) => task.id),
    ["today"],
  );
  assert.deepEqual(
    result.overdue.map((task) => task.id),
    ["late"],
  );
  const done = model.toggleTask(tasks, "late");
  assert.equal(model.selectTasks(done, "2026-11-14", now).daily[0].id, "late");
  assert.equal(model.selectTasks(done, "2026-11-14", now).overdue.length, 0);
  await add(
    "Завтра",
    `${time.localDay(new Date(Date.now() + 86400000))}T23:59`,
  );
  assert.equal(container.querySelectorAll(".task-card").length, 0);
  const dateInput = container.querySelector('[aria-label="Выбранный день"]');
  await act(() => {
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    ).set.call(dateInput, time.localDay(new Date(Date.now() + 86400000)));
    dateInput.dispatchEvent(new window.Event("change", { bubbles: true }));
    dateInput.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
  assert.equal(container.querySelectorAll(".task-card").length, 1);
});

test("Corrupt and unavailable storage are reported without overwriting existing data", async () => {
  window.localStorage.setItem(storage.TASKS_KEY, "damaged");
  await remount();
  assert.ok(container.querySelector('[role="alert"]'));
  assert.equal(
    container.querySelector('[aria-label="Добавить задачу"]').disabled,
    true,
  );
  assert.equal(window.localStorage.getItem(storage.TASKS_KEY), "damaged");
  const repository = storage.createTaskRepository({
    getItem() {
      return null;
    },
    setItem() {
      throw new Error("QuotaExceededError");
    },
  });
  assert.throws(() => repository.save([]), /Quota/);
});

test("Failed write keeps modal open and existing tasks intact", async () => {
  await add();
  const original = window.Storage.prototype.setItem;
  window.Storage.prototype.setItem = () => {
    throw new Error("Quota exceeded");
  };
  try {
    await click("Редактировать: Подготовить доклад");
    fill("title", "Не сохранено");
    await save();
    assert.ok(container.querySelector("dialog"));
    assert.equal(stored()[0].title, "Подготовить доклад");
    assert.ok(container.querySelector("dialog [role=alert]"));
  } finally {
    window.Storage.prototype.setItem = original;
  }
});

test("Storage events refresh other tabs; edits read latest saved list", async () => {
  await add();
  const first = stored()[0];
  storage
    .createTaskRepository(window.localStorage)
    .save([
      ...stored(),
      { ...first, id: "other-tab", title: "Другая вкладка" },
    ]);
  await act(() =>
    window.dispatchEvent(
      new window.StorageEvent("storage", { key: storage.TASKS_KEY }),
    ),
  );
  assert.equal(container.querySelectorAll(".task-card").length, 2);
  await click("Выполнено: Подготовить доклад");
  assert.equal(stored().length, 2);
  assert.equal(stored()[0].completed, true);
});
