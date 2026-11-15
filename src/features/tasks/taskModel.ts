import type { Task, TaskColor, TaskInput, TaskPriority } from "./types";
import { deadlineAt, isLocalDate, isInstant } from "./taskDates";

export const priorityColors: Record<TaskPriority, TaskColor> = {
  high: "coral",
  medium: "peach",
  low: "sage",
  none: "blue",
};
export function validateInput(input: TaskInput): TaskInput {
  if (typeof input.title !== "string" || !input.title.trim())
    throw new Error("Введите название задачи.");
  if (typeof input.category !== "string")
    throw new Error("Некорректная категория.");
  if (!isLocalDate(input.planned_date)) throw new Error("Укажите дату дела.");
  if (
    input.estimated_minutes !== null &&
    (!Number.isSafeInteger(input.estimated_minutes) ||
      input.estimated_minutes <= 0)
  )
    throw new Error(
      "Длительность должна быть больше нуля и задана в целых минутах.",
    );
  if (!["high", "medium", "low", "none"].includes(input.priority))
    throw new Error("Выберите приоритет.");
  const deadline = input.deadline;
  if (
    deadline !== null &&
    (!deadline ||
      (deadline.kind === "date"
        ? !isLocalDate(deadline.date)
        : deadline.kind !== "datetime" || !isInstant(deadline.at)))
  )
    throw new Error("Укажите корректный дедлайн.");
  return {
    title: input.title.trim(),
    category: input.category.trim(),
    planned_date: input.planned_date,
    estimated_minutes: input.estimated_minutes,
    priority: input.priority,
    deadline,
  };
}
export function createTask(input: TaskInput, id = crypto.randomUUID()): Task {
  return {
    ...validateInput(input),
    id,
    actual_minutes: 0,
    completed: false,
    schedule_blocks: [],
  };
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
  return (
    !task.completed &&
    task.deadline !== null &&
    deadlineAt(task.deadline) < now.getTime()
  );
}
export function selectTasks(tasks: Task[], day: string, now: Date) {
  const sorted = [...tasks].sort((a, b) => {
    const aTime = a.deadline ? deadlineAt(a.deadline) : Infinity;
    const bTime = b.deadline ? deadlineAt(b.deadline) : Infinity;
    return aTime === bTime ? 0 : aTime < bTime ? -1 : 1;
  });
  return {
    daily: sorted.filter(
      (task) =>
        task.planned_date === day && !task.completed && !isOverdue(task, now),
    ),
    overdue: sorted.filter((task) => isOverdue(task, now)),
    completed: sorted.filter(
      (task) => task.planned_date === day && task.completed,
    ),
  };
}
