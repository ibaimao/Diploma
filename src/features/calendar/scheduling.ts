import type { Task } from "../tasks/types";
import { deadlineAt, exactDeadline, isLocalDate } from "../tasks/taskDates";
import { localDay } from "../../shared/time";

export interface FixedEvent {
  id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  weekly: boolean;
}
export const EVENTS_KEY = "study-planner.events.v1";
export function validateEvent(event: FixedEvent) {
  if (
    !event.id ||
    !event.title.trim() ||
    !isLocalDate(event.date) ||
    typeof event.weekly !== "boolean"
  )
    throw new Error("Проверьте название и дату события.");
  exactDeadline(event.date, event.start);
  exactDeadline(event.date, event.end);
  if (event.end <= event.start)
    throw new Error("Окончание должно быть позже начала в тот же день.");
}
export function loadEvents(storage: Pick<Storage, "getItem">): FixedEvent[] {
  const raw = storage.getItem(EVENTS_KEY);
  if (raw === null) return [];
  const data = JSON.parse(raw);
  if (data.version !== 1 || !Array.isArray(data.events))
    throw new Error("Не удалось прочитать события. Данные не изменены.");
  const ids = new Set();
  for (const event of data.events) {
    validateEvent(event);
    if (ids.has(event.id)) throw new Error("Повтор ID события.");
    ids.add(event.id);
  }
  return data.events;
}
export function saveEvents(
  storage: Pick<Storage, "setItem">,
  events: FixedEvent[],
) {
  events.forEach(validateEvent);
  storage.setItem(EVENTS_KEY, JSON.stringify({ version: 1, events }));
}
export function occursOn(event: FixedEvent, day: string) {
  return (
    event.date === day ||
    (event.weekly &&
      day >= event.date &&
      new Date(`${day}T12:00`).getDay() ===
        new Date(`${event.date}T12:00`).getDay())
  );
}
export function eventInterval(event: FixedEvent, day: string) {
  return {
    start: new Date(`${day}T${event.start}`).getTime(),
    end: new Date(`${day}T${event.end}`).getTime(),
  };
}
const overlaps = (a: number, b: number, c: number, d: number) => a < d && c < b;
export function assertFree(
  start: number,
  end: number,
  tasks: Task[],
  events: FixedEvent[],
  excludeTask?: string,
) {
  if (
    tasks.some(
      (task) =>
        task.id !== excludeTask &&
        task.schedule_blocks.some((block) =>
          overlaps(
            start,
            end,
            Date.parse(block.starts_at),
            Date.parse(block.ends_at),
          ),
        ),
    )
  )
    throw new Error("Это время занято другой задачей. Выберите другое место.");
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  while (cursor.getTime() < end) {
    const day = localDay(cursor);
    if (
      events.some((event) => {
        const interval = eventInterval(event, day);
        return (
          occursOn(event, day) &&
          overlaps(start, end, interval.start, interval.end)
        );
      })
    )
      throw new Error(
        "Это время занято фиксированным событием. Выберите другое место.",
      );
    cursor.setDate(cursor.getDate() + 1);
  }
}
export function placeTask(
  tasks: Task[],
  id: string,
  day: string,
  time: string | null,
  events: FixedEvent[],
): Task[] {
  const task = tasks.find((task) => task.id === id);
  if (!task) throw new Error("Задача уже удалена.");
  if (!isLocalDate(day)) throw new Error("Выберите дату.");
  let schedule_blocks: Task["schedule_blocks"] = [];
  if (task.estimated_minutes !== null) {
    if (time === null)
      throw new Error("Выберите время начала в расписании дня.");
    const exact = exactDeadline(day, time);
    const start = Date.parse(exact.kind === "datetime" ? exact.at : "");
    const end = start + task.estimated_minutes * 60000;
    if (!Number.isFinite(end) || !Number.isFinite(new Date(end).getTime()))
      throw new Error("Слишком большая длительность.");
    // An interval ending exactly at next midnight still fits a date-only deadline.
    const limit = task.deadline
      ? deadlineAt(task.deadline) + (task.deadline.kind === "date" ? 1 : 0)
      : Infinity;
    if (end > limit)
      throw new Error(
        "Нельзя разместить задачу после дедлайна: задача закончится позже установленного срока.",
      );
    assertFree(start, end, tasks, events, id);
    schedule_blocks = [
      {
        id: task.schedule_blocks[0]?.id ?? crypto.randomUUID(),
        starts_at: new Date(start).toISOString(),
        ends_at: new Date(end).toISOString(),
      },
    ];
  } else if (
    task.deadline &&
    day >
      (task.deadline.kind === "date"
        ? task.deadline.date
        : localDay(new Date(task.deadline.at)))
  ) {
    throw new Error("Нельзя разместить задачу после дедлайна");
  }
  return tasks.map((item) =>
    item.id === id ? { ...item, planned_date: day, schedule_blocks } : item,
  );
}
export function assertEventFree(
  event: FixedEvent,
  tasks: Task[],
  others: FixedEvent[],
) {
  validateEvent(event);
  // Task blocks are finite; check each occurrence they can overlap, including midnight crossings.
  for (const task of tasks)
    for (const block of task.schedule_blocks) {
      const cursor = new Date(block.starts_at);
      cursor.setHours(0, 0, 0, 0);
      while (cursor.getTime() < Date.parse(block.ends_at)) {
        const day = localDay(cursor);
        const interval = eventInterval(event, day);
        if (
          occursOn(event, day) &&
          overlaps(
            interval.start,
            interval.end,
            Date.parse(block.starts_at),
            Date.parse(block.ends_at),
          )
        )
          throw new Error(
            "Событие пересекается с задачей. Выберите другое время.",
          );
        cursor.setDate(cursor.getDate() + 1);
      }
    }
  for (const other of others) {
    const day =
      event.weekly && other.weekly
        ? event.date > other.date
          ? event.date
          : other.date
        : event.weekly
          ? other.date
          : event.date;
    if (
      occursOn(event, day) &&
      occursOn(other, day) &&
      event.start < other.end &&
      other.start < event.end
    )
      throw new Error("События пересекаются. Выберите другое время.");
  }
}
// Integration boundary for the future planner: no automatic placement is performed.
export const assistedPlanning = {
  available: false,
  message: "Автоматический подбор появится позже. Разместите задачу вручную.",
} as const;
