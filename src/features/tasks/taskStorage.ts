import type { Task, TaskPriority } from "./types";
import { validateInput } from "./taskModel";
import { isInstant, isLocalDate } from "./taskDates";
import { localDay } from "../../shared/time";

export const TASKS_KEY = "study-planner.tasks.v2";
export const LEGACY_TASKS_KEY = "study-planner.tasks.v1";
export interface TaskRepository {
  load(): Task[];
  save(tasks: Task[]): void;
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Некорректная запись задачи.");
  return value as Record<string, unknown>;
}
function parseTasks(value: unknown): Task[] {
  if (!Array.isArray(value)) throw new Error("Некорректный список задач.");
  const ids = new Set<string>();
  for (const item of value) {
    const task = record(item);
    if (
      typeof task.id !== "string" ||
      !task.id ||
      ids.has(task.id) ||
      typeof task.completed !== "boolean" ||
      typeof task.actual_minutes !== "number" ||
      !Number.isFinite(task.actual_minutes) ||
      task.actual_minutes < 0 ||
      !Array.isArray(task.schedule_blocks)
    )
      throw new Error("Некорректные данные задач.");
    validateInput(item as Task);
    const blockIds = new Set<string>();
    for (const item of task.schedule_blocks) {
      const block = record(item);
      if (
        typeof block.id !== "string" ||
        !block.id ||
        blockIds.has(block.id) ||
        !isInstant(block.starts_at) ||
        !isInstant(block.ends_at) ||
        Date.parse(block.ends_at) <= Date.parse(block.starts_at)
      )
        throw new Error("Некорректный временной блок.");
      blockIds.add(block.id);
    }
    ids.add(task.id);
  }
  return value;
}
function migrateV1(value: unknown): Task[] {
  if (!Array.isArray(value))
    throw new Error("Некорректный старый список задач.");
  const colorPriority: Record<string, TaskPriority> = {
    coral: "high",
    peach: "medium",
    sage: "low",
    blue: "none",
  };
  return parseTasks(
    value.map((item) => {
      const old = record(item);
      if (
        typeof old.deadline !== "string" ||
        typeof old.color !== "string" ||
        !Object.hasOwn(colorPriority, old.color) ||
        typeof old.estimated_minutes !== "number" ||
        old.estimated_minutes <= 0
      )
        throw new Error("Не удалось преобразовать старую задачу.");
      const dateOnly = isLocalDate(old.deadline);
      if (!dateOnly && !isInstant(old.deadline))
        throw new Error("Некорректный старый дедлайн.");
      return {
        id: old.id,
        title: old.title,
        category: old.category,
        estimated_minutes: old.estimated_minutes,
        actual_minutes: old.actual_minutes,
        completed: old.completed,
        priority: colorPriority[old.color],
        planned_date: dateOnly
          ? old.deadline
          : localDay(new Date(old.deadline)),
        deadline: dateOnly
          ? { kind: "date", date: old.deadline }
          : { kind: "datetime", at: old.deadline },
        schedule_blocks: [],
      };
    }),
  );
}
export function createTaskRepository(
  storage: Pick<Storage, "getItem" | "setItem">,
): TaskRepository {
  function save(tasks: Task[]) {
    parseTasks(tasks);
    storage.setItem(TASKS_KEY, JSON.stringify({ version: 2, tasks }));
  }
  return {
    load() {
      const raw = storage.getItem(TASKS_KEY);
      if (raw !== null) {
        const data = JSON.parse(raw);
        if (data?.version !== 2)
          throw new Error("Неизвестный формат сохранения.");
        return parseTasks(data.tasks);
      }
      const legacy = storage.getItem(LEGACY_TASKS_KEY);
      if (legacy === null) return [];
      const data = JSON.parse(legacy);
      if (data?.version !== 1)
        throw new Error("Неизвестный старый формат сохранения.");
      const tasks = migrateV1(data.tasks);
      // Validate the entire collection before writing. The original v1 key is the backup.
      save(tasks);
      return tasks;
    },
    save,
  };
}
