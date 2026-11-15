import type { Task } from "./types";
import { validateInput } from "./taskModel";

export const TASKS_KEY = "study-planner.tasks.v1";
export interface TaskRepository {
  load(): Task[];
  save(tasks: Task[]): void;
}
function parseTasks(value: unknown): Task[] {
  if (!Array.isArray(value)) throw new Error("Некорректный список задач.");
  const ids = new Set<string>();
  for (const task of value) {
    if (
      !task ||
      typeof task !== "object" ||
      typeof task.id !== "string" ||
      !task.id ||
      ids.has(task.id) ||
      typeof task.title !== "string" ||
      typeof task.category !== "string" ||
      typeof task.deadline !== "string" ||
      typeof task.completed !== "boolean" ||
      !Number.isFinite(task.actual_minutes) ||
      task.actual_minutes < 0
    )
      throw new Error("Некорректные данные задач.");
    validateInput(task);
    ids.add(task.id);
  }
  return value;
}
export function createTaskRepository(
  storage: Pick<Storage, "getItem" | "setItem">,
): TaskRepository {
  return {
    load() {
      const raw = storage.getItem(TASKS_KEY);
      if (raw === null) return [];
      const data = JSON.parse(raw);
      if (data?.version !== 1)
        throw new Error("Неизвестный формат сохранения.");
      return parseTasks(data.tasks);
    },
    save(tasks) {
      parseTasks(tasks);
      storage.setItem(TASKS_KEY, JSON.stringify({ version: 1, tasks }));
    },
  };
}
