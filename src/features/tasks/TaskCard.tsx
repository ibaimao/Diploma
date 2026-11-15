import { Check } from "lucide-react";
import type { Task } from "./types";

export function TaskCard({
  task,
  overdue,
  onEdit,
  onToggle,
}: {
  task: Task;
  overdue: boolean;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const deadline = new Date(task.deadline);
  return (
    <li
      className={`task-card task-card--${task.color}${overdue ? " task-card--overdue" : ""}`}
    >
      <h3>
        <button
          className="task-title-button"
          onClick={onEdit}
          aria-label={`Редактировать: ${task.title}`}
        >
          {task.title}
        </button>
      </h3>
      <span className="task-schedule" title={deadline.toLocaleString("ru-RU")}>
        {overdue
          ? `${deadline.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })} `
          : "до "}
        {deadline.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
      <span className="sr-only">
        Предполагаемая длительность: {task.estimated_minutes} мин.{" "}
        {task.category}
      </span>
      <button
        className={`task-checkbox${task.completed ? " task-checkbox--checked" : ""}`}
        aria-label={`Выполнено: ${task.title}`}
        aria-pressed={task.completed}
        onClick={onToggle}
      >
        {task.completed && <Check aria-hidden="true" strokeWidth={2.5} />}
      </button>
    </li>
  );
}
