import { Check } from "lucide-react";
import { priorityColors } from "./taskModel";
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
  const deadline = task.deadline;
  const exact = deadline?.kind === "datetime" ? new Date(deadline.at) : null;
  return (
    <li
      className={`task-card task-card--${priorityColors[task.priority]}${overdue ? " task-card--overdue" : ""}${task.completed ? " task-card--completed" : ""}`}
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
      {deadline && (
        <span
          className="task-schedule"
          title={
            exact?.toLocaleString("ru-RU") ??
            `До конца ${deadline.kind === "date" ? deadline.date : ""}`
          }
        >
          {exact
            ? `до ${overdue ? exact.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) + " " : ""}${exact.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`
            : `до ${deadline.kind === "date" ? new Date(`${deadline.date}T12:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) : ""}`}
        </span>
      )}
      <span className="sr-only">
        {task.estimated_minutes === null
          ? "Длительность не указана."
          : `Предполагаемая длительность: ${task.estimated_minutes} мин.`}{" "}
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
