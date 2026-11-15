import type { Task, TaskInput } from "./types";
import { localDay } from "../../shared/time";

export const taskColors = ["coral", "peach", "sage", "blue"] as const;
export function validateInput(input: TaskInput): TaskInput {
  if (!input.title.trim()) throw new Error("Введите название задачи.");
  if (
    !Number.isSafeInteger(input.estimated_minutes) ||
    input.estimated_minutes <= 0
  )
    throw new Error(
      "Длительность должна быть больше нуля и задана в целых минутах.",
    );
  if (!input.deadline || !Number.isFinite(Date.parse(input.deadline)))
    throw new Error("Укажите корректные дату и время дедлайна.");
  if (!taskColors.includes(input.color))
    throw new Error("Выберите цвет карточки.");
  return {
    ...input,
    title: input.title.trim(),
    category: input.category.trim(),
    deadline: new Date(input.deadline).toISOString(),
  };
}
export function createTask(input: TaskInput, id = crypto.randomUUID()): Task {
  return { ...validateInput(input), id, actual_minutes: 0, completed: false };
}
export function editTask(tasks: Task[], id: string, input: TaskInput): Task[] {
  const clean = validateInput(input);
  if (!tasks.some((task) => task.id === id))
    throw new Error("Задача уже удалена. Обновите список.");
  return tasks.map((task) => (task.id === id ? { ...task, ...clean } : task));
}
export function toggleTask(tasks: Task[], id: string): Task[] {
  return tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task,
  );
}
export function deleteTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id);
}
export function isOverdue(task: Task, now: Date): boolean {
  return !task.completed && Date.parse(task.deadline) < now.getTime();
}
export function selectTasks(tasks: Task[], day: string, now: Date) {
  const sorted = [...tasks].sort(
    (a, b) => Date.parse(a.deadline) - Date.parse(b.deadline),
  );
  return {
    daily: sorted.filter(
      (task) =>
        localDay(new Date(task.deadline)) === day && !isOverdue(task, now),
    ),
    overdue: sorted.filter((task) => isOverdue(task, now)),
  };
}
