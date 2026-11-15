import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, test } from "node:test";
import { JSDOM } from "jsdom";
import { createServer } from "vite";

let environment;
let server;
let container;
let root;
let App;
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
  // Vite loads the actual TSX modules. Middleware mode does not start a web server.
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
  });
  ({ App } = await server.ssrLoadModule("/src/app/App.tsx"));
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

test("Demo data and the unfinished 3D scene are clearly disclosed", () => {
  assert.match(container.textContent, /Демо-версия/);
  assert.match(container.textContent, /Демонстрационные данные/);
  assert.match(container.textContent, /изменения не сохраняются/);
  assert.match(
    container.textContent,
    /Иллюстрация-заглушка · 3D появится позже/,
  );
  assert.equal(container.querySelectorAll("li.task-card").length, 5);
  assert.equal(container.querySelectorAll(".task-card--overdue").length, 1);
  assert.match(container.querySelector(".task-duration").textContent, /2 ч/);
});

test("Task creation is disabled and completion indicators cannot change tasks", async () => {
  const addButton = container.querySelector(".add-task-button");
  assert.equal(addButton.disabled, true);
  assert.ok(
    document.getElementById(addButton.getAttribute("aria-describedby")),
  );
  const completion = container.querySelectorAll(".task-checkbox");
  const before = container.querySelector(".task-list").innerHTML;

  await act(() => {
    addButton.click();
    completion.forEach((indicator) => indicator.click());
  });

  assert.equal(container.querySelector(".task-list").innerHTML, before);
  assert.equal(container.querySelectorAll("input, form, canvas").length, 0);
  assert.equal(container.querySelectorAll(".task-checkbox--checked").length, 1);
  completion.forEach((indicator) => {
    assert.equal(indicator.getAttribute("role"), "img");
    assert.match(indicator.getAttribute("aria-label"), /пример отметки/);
  });
});

for (const [label, description] of [
  ["Календарь", "Сейчас раздел не реализован"],
  ["Таймер", "Таймер пока не работает"],
  ["Статистика", "Реальные данные пока не собираются"],
  ["Комната", "Наград и покупок пока нет"],
]) {
  test(`${label}: navigation opens an honest placeholder and returns to tasks`, async () => {
    const button = getNavigationButton(`${label} — раздел в разработке`);
    await act(() => button.click());

    assert.equal(container.querySelectorAll('[aria-current="page"]').length, 1);
    assert.equal(button.getAttribute("aria-current"), "page");
    assert.match(
      container.querySelector(".workspace").textContent,
      /БУДУЩИЙ РАЗДЕЛ/,
    );
    assert.ok(
      container.querySelector(".workspace").textContent.includes(description),
    );
    assert.equal(container.querySelectorAll("li.task-card").length, 0);
    assert.ok(
      container.querySelector(".pet-room"),
      "Pet room should remain visible",
    );

    await act(() => container.querySelector(".back-button").click());
    assert.equal(
      getNavigationButton("Задачи").getAttribute("aria-current"),
      "page",
    );
    assert.equal(container.querySelectorAll("li.task-card").length, 5);
  });
}

test("A remounted application starts on the demo tasks without saving state", async () => {
  await act(() => getNavigationButton("Таймер — раздел в разработке").click());
  await act(() => root.unmount());
  root = createRoot(container);
  await act(() => root.render(createElement(App)));

  assert.equal(
    getNavigationButton("Задачи").getAttribute("aria-current"),
    "page",
  );
  assert.equal(container.querySelectorAll("li.task-card").length, 5);
  assert.equal(window.localStorage.length, 0);
});
