import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, test } from "node:test";
import { JSDOM } from "jsdom";
import { createServer } from "vite";

let environment;
let server;
let container;
let root;
let App;
let TaskCard;
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
  ({ TaskCard } = await server.ssrLoadModule(
    "/src/features/tasks/TaskCard.tsx",
  ));
});
beforeEach(async () => {
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

test("The task titles and times reproduce the supplied reference", () => {
  assert.deepEqual(
    [...container.querySelectorAll(".task-card h3")].map(
      (node) => node.textContent,
    ),
    [
      "Дописать отчёт",
      "Убраться в комнате",
      "Прочитать книгу",
      "Нарисовать открытку",
      "Позвонить другу",
    ],
  );
  assert.deepEqual(
    [...container.querySelectorAll(".task-schedule")].map(
      (node) => node.textContent,
    ),
    ["9:00 - 11:00", "12:00 - 13:00", "до 17:30", "17:30 - 20:00", "до 8:00"],
  );
  assert.equal(container.querySelectorAll(".task-card--overdue").length, 1);
  assert.equal(container.querySelectorAll(".task-checkbox--checked").length, 0);
  assert.equal(
    container.querySelector(".room-date").textContent,
    "1 СЕНТ.10:56",
  );
});

test("No invented headings, captions, counters or extra task controls are shown", () => {
  assert.deepEqual(
    [...container.querySelectorAll("h1,h2")].map((node) => node.textContent),
    ["Задачи на день", "Просроченные задачи"],
  );
  for (const removedText of [
    "Знакомься",
    "Плюша",
    "Твой будущий компаньон",
    "ТВОЙ УЮТНЫЙ УГОЛОК",
    "Шаг за шагом",
    "Каждому делу",
    "Большие планы",
    "Немного порядка",
    "В своём ритме",
    "Здесь скоро",
    "Выполнено:",
  ])
    assert.equal(
      container.textContent.includes(removedText),
      false,
      removedText,
    );
  assert.equal(
    container.querySelectorAll(
      "header,footer,.add-task-button,.task-details,.pet-introduction",
    ).length,
    0,
  );
});

test("Demo status and unfinished features remain disclosed without visible decorative copy", () => {
  const main = container.querySelector("main");
  const description = document.getElementById(
    main.getAttribute("aria-describedby"),
  );
  assert.ok(description.classList.contains("sr-only"));
  assert.match(description.textContent, /Демонстрационные задачи и дата/);
  assert.match(description.textContent, /Данные не сохраняются/);
  assert.match(
    container.querySelector(".pet-room").getAttribute("aria-label"),
    /иллюстрация-заглушка/,
  );
  assert.match(
    container
      .querySelector('.tasks-paper[role="region"]')
      .getAttribute("aria-label"),
    /демонстрационных задач/,
  );
});

test("Task list is a separate focusable region; navigation, room and heading stay outside", () => {
  const scrollRegion = container.querySelector('.tasks-paper[role="region"]');
  assert.equal(scrollRegion.tabIndex, 0);
  assert.equal(scrollRegion.querySelectorAll(".task-card").length, 5);
  assert.equal(
    scrollRegion.contains(container.querySelector(".panel-heading")),
    false,
  );
  assert.equal(
    scrollRegion.contains(container.querySelector(".navigation")),
    false,
  );
  assert.equal(
    scrollRegion.contains(container.querySelector(".pet-room")),
    false,
  );
  assert.equal(container.querySelectorAll("input,form,canvas").length, 0);
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

test("Demonstration completion marks are inert", async () => {
  const before = container.querySelector(".tasks-paper").innerHTML;
  const indicators = container.querySelectorAll(".task-checkbox");
  await act(() => indicators.forEach((indicator) => indicator.click()));
  assert.equal(container.querySelector(".tasks-paper").innerHTML, before);
  indicators.forEach((indicator) => {
    assert.equal(indicator.getAttribute("role"), "img");
    assert.match(indicator.getAttribute("aria-label"), /пример отметки/);
  });
});

test("The task card can display a completed example without adding visible status text", async () => {
  await act(() =>
    root.render(
      createElement(
        "ul",
        null,
        createElement(TaskCard, {
          task: {
            id: "completed-example",
            title: "Дописать отчёт",
            category: "",
            scheduleLabel: "9:00 - 11:00",
            durationMinutes: 120,
            color: "coral",
            completed: true,
            overdue: false,
          },
        }),
      ),
    ),
  );
  assert.match(
    container
      .querySelector(".task-checkbox--checked")
      .getAttribute("aria-label"),
    /^Выполнено/,
  );
  assert.equal(container.querySelectorAll("small").length, 0);
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
    assert.equal(container.querySelectorAll(".task-card").length, 5);
  });
}

test("Remounting restores demo tasks and does not persist navigation or task changes", async () => {
  await act(() => getNavigationButton("Таймер Pomodoro").click());
  await act(() => root.unmount());
  root = createRoot(container);
  await act(() => root.render(createElement(App)));
  assert.equal(
    getNavigationButton("Задачи на день").getAttribute("aria-current"),
    "page",
  );
  assert.equal(container.querySelectorAll(".task-card").length, 5);
  assert.equal(window.localStorage.length, 0);
});
