import { Check, Clock3 } from "lucide-react";
import type { DemoTask } from "./types";

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return [
    hours > 0 ? `${hours} ч` : "",
    remainder > 0 ? `${remainder} мин` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function TaskCard({ task }: { task: DemoTask }) {
  return (
    <li
      className={`task-card task-card--${task.color}${task.completed ? " task-card--completed" : ""}${task.overdue ? " task-card--overdue" : ""}`}
    >
      <div className="task-main">
        <h3>{task.title}</h3>
        <div className="task-details">
          <span>{task.category}</span>
          <span className="detail-dot" aria-hidden="true">
            ·
          </span>
          <span className="task-duration">
            <Clock3 size={12} />
            {formatDuration(task.durationMinutes)}
          </span>
        </div>
      </div>
      <div className="task-schedule">
        <span>{task.scheduleLabel}</span>
        {task.completed && <small>Выполнено</small>}
      </div>
      <span
        className={`task-checkbox${task.completed ? " task-checkbox--checked" : ""}`}
        role="img"
        aria-label={
          task.completed
            ? "Выполнено — пример отметки"
            : "Не выполнено — пример отметки"
        }
      >
        {task.completed && <Check size={20} strokeWidth={3} />}
      </span>
    </li>
  );
}
