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
let dates;
let editors;
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
  dates = await server.ssrLoadModule("/src/features/tasks/taskDates.ts");
  editors = await server.ssrLoadModule("/src/features/tasks/TaskEditor.tsx");
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
  const target = [...container.querySelectorAll("button,[role=switch]")].find(
    (node) =>
      node.textContent === text || node.getAttribute("aria-label") === text,
  );
  assert.ok(target, `Missing control: ${text}`);
  return act(() => target.click());
}
function fill(name, value) {
  const input = container.querySelector(`[name="${name}"]`);
  assert.ok(input, `Missing field: ${name}`);
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
async function add(title = "Подготовить доклад") {
  await click("Добавить задачу");
  fill("title", title);
  fill("category", "Учёба");
  await save();
}
function stored() {
  return storage.createTaskRepository(window.localStorage).load();
}
function today() {
  return time.localDay(new Date());
}
function input(overrides = {}) {
  return {
    title: "Задача",
    category: "",
    planned_date: today(),
    estimated_minutes: null,
    deadline: null,
    priority: "none",
    ...overrides,
  };
}
async function seed(tasks) {
  storage.createTaskRepository(window.localStorage).save(tasks);
  await remount();
}
async function advanced(props = {}) {
  await act(() =>
    root.render(
      createElement(editors.AdvancedTaskEditor, {
        day: today(),
        onClose() {},
        onSave(value) {
          storage
            .createTaskRepository(window.localStorage)
            .save([model.createTask(value)]);
          return true;
        },
        ...props,
      }),
    ),
  );
}
function titles() {
  return [...container.querySelectorAll(".task-card h3")].map(
    (node) => node.textContent,
  );
}

test("Quick add defaults to today, null duration/deadline, no priority or manual color", async () => {
  assert.equal(container.querySelector('[aria-label="Выбранный день"]'), null);
  assert.equal(container.querySelector(".overdue-heading"), null);
  assert.equal(
    container.querySelector('[aria-label="Просроченные задачи"]'),
    null,
  );
  await click("Добавить задачу");
  assert.equal(container.querySelectorAll('[role="switch"]:checked').length, 0);
  for (const name of [
    "hours",
    "minutes",
    "deadline_time",
    "planned_date",
    "priority",
    "color",
  ])
    assert.equal(container.querySelector(`[name="${name}"]`), null);
  assert.equal(
    [...container.querySelectorAll("button")].some(
      (node) => node.textContent === "Отмена",
    ),
    false,
  );
  assert.ok(container.querySelector(".editor-close"));
  assert.ok(container.querySelector(".editor-save"));
  fill("title", "Быстрая задача");
  await save();
  const task = stored()[0];
  assert.equal(task.planned_date, today());
  assert.equal(task.deadline, null);
  assert.equal(task.estimated_minutes, null);
  assert.equal(task.priority, "none");
  assert.equal(task.actual_minutes, 0);
  assert.deepEqual(task.schedule_blocks, []);
  assert.equal(Object.hasOwn(task, "color"), false);
  assert.ok(container.querySelector(".task-card--blue"));
  assert.equal(container.querySelector(".task-schedule"), null);
  await remount();
  assert.deepEqual(stored(), [task]);
});

test("Quick toggles show time fields; disabled values are null even after entering them", async () => {
  await click("Добавить задачу");
  fill("title", "Со временем");
  await click("Добавить время выполнения");
  fill("hours", "1");
  fill("minutes", "15");
  await click("Выполнить до определённого времени");
  assert.equal(container.querySelector('[name="deadline_time"]').type, "time");
  assert.equal(container.querySelector('[name="deadline_date"]'), null);
  fill("deadline_time", "23:59");
  await save();
  assert.equal(stored()[0].estimated_minutes, 75);
  assert.deepEqual(stored()[0].deadline, dates.exactDeadline(today(), "23:59"));
  await click("Добавить задачу");
  fill("title", "Без времени");
  await click("Добавить время выполнения");
  fill("minutes", "40");
  await click("Добавить время выполнения");
  await click("Выполнить до определённого времени");
  fill("deadline_time", "08:00");
  await click("Выполнить до определённого времени");
  await save();
  assert.equal(stored()[1].estimated_minutes, null);
  assert.equal(stored()[1].deadline, null);
});

test("Edit preserves ID and actual time, and priority automatically changes card color", async () => {
  await add();
  const original = stored()[0];
  for (const [priority, color] of Object.entries(model.priorityColors)) {
    await click("Редактировать: Подготовить доклад");
    fill("priority", priority);
    await save();
    assert.ok(container.querySelector(`.task-card--${color}`));
    assert.equal(stored().length, 1);
    assert.equal(stored()[0].id, original.id);
    assert.equal(stored()[0].priority, priority);
    assert.equal(stored()[0].actual_minutes, 0);
  }
  await click("Редактировать: Подготовить доклад");
  fill("title", "Исправленный доклад");
  await click("Добавить время выполнения");
  fill("minutes", "45");
  await save();
  await remount();
  assert.equal(stored()[0].estimated_minutes, 45);
  assert.deepEqual(titles(), ["Исправленный доклад"]);
});

test("Ordering is daily unfinished → overdue → completed, with completion/undo persisted", async () => {
  const late = model.createTask(
    input({
      title: "Просроченная",
      deadline: {
        kind: "datetime",
        at: new Date(Date.now() - 60000).toISOString(),
      },
    }),
    "late",
  );
  const first = model.createTask(input({ title: "Первая" }), "first");
  const second = model.createTask(input({ title: "Вторая" }), "second");
  await seed([first, late, second]);
  assert.deepEqual(titles(), ["Первая", "Вторая", "Просроченная"]);
  await click("Выполнено: Первая");
  assert.deepEqual(titles(), ["Вторая", "Просроченная", "Первая"]);
  assert.ok(
    container.querySelector(".task-card--completed .task-title-button"),
  );
  await click("Выполнено: Просроченная");
  assert.equal(container.querySelector(".overdue-heading"), null);
  assert.equal(
    container.querySelector('[aria-label="Просроченные задачи"]'),
    null,
  );
  assert.deepEqual(titles(), ["Вторая", "Просроченная", "Первая"]);
  await remount();
  assert.equal(container.querySelectorAll(".task-card--completed").length, 2);
  await click("Выполнено: Первая");
  assert.deepEqual(titles(), ["Первая", "Вторая", "Просроченная"]);
  await click("Выполнено: Просроченная");
  assert.ok(container.querySelector(".overdue-heading"));
  assert.deepEqual(titles(), ["Первая", "Вторая", "Просроченная"]);
  assert.equal(container.querySelectorAll(".task-card--completed").length, 0);
  assert.ok(stored().every((task) => task.actual_minutes === 0));
});

test("Only today's planned tasks appear; deadline does not define the planned day", async () => {
  await seed([
    model.createTask(
      input({
        title: "Сегодня",
        deadline: { kind: "date", date: "2099-12-31" },
      }),
      "now",
    ),
    model.createTask(
      input({ title: "Будущая", planned_date: "2099-12-31" }),
      "future",
    ),
    model.createTask(
      input({ title: "Прошлая без дедлайна", planned_date: "2000-01-01" }),
      "past",
    ),
  ]);
  assert.deepEqual(titles(), ["Сегодня"]);
  assert.equal(stored().length, 3);
  assert.equal(container.querySelector(".overdue-heading"), null);
  await click("Календарь");
  assert.equal(container.querySelectorAll("dialog,input,select").length, 0);
  await click("Задачи на день");
  assert.deepEqual(titles(), ["Сегодня"]);
});

test("No empty overdue section after deleting the last late task; deletion and close are safe", async () => {
  await seed([
    model.createTask(
      input({
        title: "Поздняя",
        deadline: { kind: "date", date: "2000-01-01" },
      }),
      "late",
    ),
  ]);
  await click("Редактировать: Поздняя");
  await click("Удалить");
  await click("Вернуться к задаче");
  assert.equal(stored().length, 1);
  await click("Закрыть форму");
  assert.equal(stored().length, 1);
  await click("Редактировать: Поздняя");
  await click("Удалить");
  await click("Удалить навсегда");
  assert.deepEqual(stored(), []);
  assert.equal(container.querySelector(".overdue-heading"), null);
  await remount();
  assert.deepEqual(titles(), []);
});

test("Advanced form has optional estimate/deadline, date-only deadline and independent planned day", async () => {
  await advanced();
  assert.equal(container.querySelectorAll('[role="switch"]:checked').length, 0);
  fill("title", "Из календаря");
  fill("planned_date", "2027-02-10");
  fill("priority", "high");
  await click("Добавить дедлайн");
  assert.equal(container.querySelector('[name="deadline_time"]'), null);
  fill("deadline_date", "2027-02-12");
  await save();
  assert.equal(stored()[0].planned_date, "2027-02-10");
  assert.deepEqual(stored()[0].deadline, { kind: "date", date: "2027-02-12" });
  assert.equal(stored()[0].priority, "high");
  assert.equal(stored()[0].estimated_minutes, null);
});

test("Advanced exact time can be disabled independently; disabled deadline removes all its values", async () => {
  let captured;
  await advanced({
    onSave(value) {
      captured = value;
      return true;
    },
  });
  fill("title", "Точное время");
  await click("Добавить дедлайн");
  fill("deadline_date", "2027-02-12");
  await click("Указать точное время");
  fill("deadline_time", "14:30");
  await save();
  assert.deepEqual(
    captured.deadline,
    dates.exactDeadline("2027-02-12", "14:30"),
  );
  await click("Указать точное время");
  await save();
  assert.deepEqual(captured.deadline, { kind: "date", date: "2027-02-12" });
  await click("Указать точное время");
  fill("deadline_time", "14:30");
  await click("Добавить дедлайн");
  await save();
  assert.equal(captured.deadline, null);
});

test("Editing can clear existing optional fields while preserving actual time and schedule blocks", async () => {
  const task = {
    ...model.createTask(
      input({
        estimated_minutes: 70,
        deadline: { kind: "datetime", at: new Date().toISOString() },
      }),
      "task",
    ),
    actual_minutes: 23,
    schedule_blocks: [
      {
        id: "block",
        starts_at: "2027-02-10T10:00:00Z",
        ends_at: "2027-02-10T11:00:00Z",
      },
    ],
  };
  await seed([task]);
  await click("Редактировать: Задача");
  await click("Добавить время выполнения");
  await click("Добавить дедлайн");
  await save();
  const edited = stored()[0];
  assert.equal(edited.estimated_minutes, null);
  assert.equal(edited.deadline, null);
  assert.equal(edited.actual_minutes, 23);
  assert.deepEqual(edited.schedule_blocks, task.schedule_blocks);
});

test("Optional values validate only when enabled; invalid title, date, time or duration cannot be saved", async () => {
  for (const invalid of [
    { title: " " },
    { estimated_minutes: 0 },
    { estimated_minutes: -1 },
    { estimated_minutes: 0.5 },
    { planned_date: "2027-02-30" },
    { priority: "invalid" },
    { deadline: "" },
    { deadline: { kind: "date", date: "2027-02-30" } },
  ])
    assert.throws(() => model.createTask(input(invalid)));
  assert.throws(() => dates.exactDeadline(today(), "24:00"));
  await click("Добавить задачу");
  fill("title", "Задача");
  await click("Добавить время выполнения");
  await save();
  assert.match(
    container.querySelector("dialog [role=alert]").textContent,
    /больше нуля/,
  );
  assert.equal(stored().length, 0);
  fill("minutes", "-1");
  await save();
  assert.equal(stored().length, 0);
  await click("Добавить время выполнения");
  await click("Выполнить до определённого времени");
  await save();
  assert.equal(stored().length, 0);
});

test("Date-only deadline includes the entire local day across offsets and DST; null never becomes overdue", () => {
  const originalTZ = process.env.TZ;
  try {
    for (const zone of ["Asia/Novosibirsk", "America/New_York", "UTC"]) {
      process.env.TZ = zone;
      const task = model.createTask(
        input({ deadline: { kind: "date", date: "2026-03-08" } }),
      );
      assert.equal(
        model.isOverdue(task, new Date("2026-03-08T23:59:59.999")),
        false,
        zone,
      );
      assert.equal(
        model.isOverdue(task, new Date("2026-03-09T00:00:00")),
        true,
        zone,
      );
      assert.equal(
        model.isOverdue(
          { ...task, completed: true },
          new Date("2026-03-09T12:00:00"),
        ),
        false,
      );
      assert.equal(
        model.isOverdue(
          { ...task, deadline: null },
          new Date("2099-01-01T12:00:00"),
        ),
        false,
      );
    }
    process.env.TZ = "America/New_York";
    assert.equal(
      dates.deadlineAt({ kind: "date", date: "2026-03-08" }) -
        new Date("2026-03-08T00:00:00").getTime() +
        1,
      23 * 3600000,
    );
    assert.throws(() => dates.exactDeadline("2026-03-08", "02:30"));
    const exact = model.createTask(
      input({
        deadline: { kind: "datetime", at: "2026-11-15T10:00:00+07:00" },
      }),
    );
    assert.equal(
      model.isOverdue(exact, new Date("2026-11-15T03:00:00Z")),
      false,
    );
    assert.equal(
      model.isOverdue(exact, new Date("2026-11-15T03:00:00.001Z")),
      true,
    );
  } finally {
    if (originalTZ === undefined) delete process.env.TZ;
    else process.env.TZ = originalTZ;
  }
});

function legacyTask(overrides = {}) {
  return {
    id: "legacy",
    title: "Старая задача",
    category: "Учёба",
    deadline: new Date().toISOString(),
    estimated_minutes: 75,
    actual_minutes: 12,
    color: "coral",
    completed: false,
    ...overrides,
  };
}
function writeLegacy(tasks) {
  const raw = JSON.stringify({ version: 1, tasks });
  window.localStorage.setItem(storage.LEGACY_TASKS_KEY, raw);
  return raw;
}

test("V1 migration preserves all tasks, IDs, statuses, actual/estimated times and exact deadline, retaining original backup", async () => {
  const old = ["coral", "peach", "sage", "blue"].map((color, index) =>
    legacyTask({ id: `old-${index}`, color, completed: index === 1 }),
  );
  const backup = writeLegacy(old);
  await remount();
  const tasks = stored();
  assert.equal(tasks.length, 4);
  tasks.forEach((task, index) => {
    assert.equal(task.id, old[index].id);
    assert.equal(task.title, old[index].title);
    assert.equal(task.category, old[index].category);
    assert.equal(task.estimated_minutes, 75);
    assert.equal(task.actual_minutes, 12);
    assert.equal(task.completed, old[index].completed);
    assert.deepEqual(task.deadline, {
      kind: "datetime",
      at: old[index].deadline,
    });
    assert.equal(
      task.planned_date,
      time.localDay(new Date(old[index].deadline)),
    );
    assert.equal(model.priorityColors[task.priority], old[index].color);
    assert.deepEqual(task.schedule_blocks, []);
    assert.equal(Object.hasOwn(task, "color"), false);
  });
  assert.equal(window.localStorage.getItem(storage.LEGACY_TASKS_KEY), backup);
  assert.equal(
    JSON.parse(window.localStorage.getItem(storage.TASKS_KEY)).version,
    2,
  );
  assert.deepEqual(stored(), tasks);
  storage.createTaskRepository(window.localStorage).save([]);
  await remount();
  assert.deepEqual(stored(), []); // Backup must never resurrect deleted tasks.
});

test("Legacy date-only values migrate as dates; partial or failed migration never overwrites the backup", () => {
  writeLegacy([legacyTask({ deadline: "2026-11-15" })]);
  assert.deepEqual(stored()[0].deadline, { kind: "date", date: "2026-11-15" });
  window.localStorage.clear();
  const backup = writeLegacy([
    legacyTask(),
    legacyTask({ id: "broken", estimated_minutes: -1 }),
  ]);
  assert.throws(() => stored());
  assert.equal(window.localStorage.getItem(storage.TASKS_KEY), null);
  assert.equal(window.localStorage.getItem(storage.LEGACY_TASKS_KEY), backup);
  const raw = JSON.stringify({ version: 1, tasks: [legacyTask()] });
  const repository = storage.createTaskRepository({
    getItem(key) {
      return key === storage.LEGACY_TASKS_KEY ? raw : null;
    },
    setItem() {
      throw new Error("Quota exceeded");
    },
  });
  assert.throws(() => repository.load(), /Quota/);
});

test("Corrupt storage is reported without overwrite; unknown versions and duplicate IDs fail safely", async () => {
  window.localStorage.setItem(storage.TASKS_KEY, "damaged");
  const backup = writeLegacy([legacyTask()]);
  await remount();
  assert.ok(container.querySelector('[role="alert"]'));
  assert.equal(
    container.querySelector('[aria-label="Добавить задачу"]').disabled,
    true,
  );
  assert.equal(window.localStorage.getItem(storage.TASKS_KEY), "damaged");
  assert.equal(window.localStorage.getItem(storage.LEGACY_TASKS_KEY), backup);
  window.localStorage.setItem(
    storage.TASKS_KEY,
    JSON.stringify({ version: 99, tasks: [] }),
  );
  assert.throws(() => stored());
  const task = model.createTask(input(), "same");
  assert.throws(() =>
    storage.createTaskRepository(window.localStorage).save([task, task]),
  );
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

test("Closing by cross or Escape discards unsaved task without creating a duplicate", async () => {
  await click("Добавить задачу");
  fill("title", "Не сохранять");
  await click("Закрыть форму");
  assert.equal(container.querySelector("dialog"), null);
  assert.deepEqual(stored(), []);
  await click("Добавить задачу");
  fill("title", "Не сохранять тоже");
  await act(() =>
    container
      .querySelector("dialog")
      .dispatchEvent(new window.Event("cancel", { cancelable: true })),
  );
  assert.equal(container.querySelector("dialog"), null);
  assert.deepEqual(stored(), []);
});

test("Task selection sorts by real deadlines stably without mutating storage order", () => {
  const now = new Date("2027-02-10T10:00:00");
  const tasks = [
    model.createTask(
      input({ planned_date: "2027-02-10", title: "Без дедлайна" }),
      "none",
    ),
    model.createTask(
      input({
        planned_date: "2027-02-10",
        deadline: { kind: "date", date: "2027-02-10" },
      }),
      "end",
    ),
    model.createTask(
      input({
        planned_date: "2027-02-10",
        deadline: dates.exactDeadline("2027-02-10", "11:00"),
      }),
      "early",
    ),
    model.createTask(input({ planned_date: "2027-02-10" }), "none2"),
  ];
  assert.deepEqual(
    model.selectTasks(tasks, "2027-02-10", now).daily.map((task) => task.id),
    ["early", "end", "none", "none2"],
  );
  assert.deepEqual(
    tasks.map((task) => task.id),
    ["none", "end", "early", "none2"],
  );
});
