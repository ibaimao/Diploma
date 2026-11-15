import { Check } from "lucide-react";
import type { DemoTask } from "./types";

export function TaskCard({ task }: { task: DemoTask }) {
  return (
    <li
      className={`task-card task-card--${task.color}${task.overdue ? " task-card--overdue" : ""}`}
    >
      <h3>{task.title}</h3>
      <span className="task-schedule">{task.scheduleLabel}</span>
      <span className="sr-only">
        Демонстрационная задача. Предполагаемая длительность:{" "}
        {task.durationMinutes} мин. Изменение отметки пока недоступно.
      </span>
      <span
        className={`task-checkbox${task.completed ? " task-checkbox--checked" : ""}`}
        role="img"
        aria-label={
          task.completed
            ? "Выполнено — пример отметки"
            : "Не выполнено — пример отметки"
        }
      >
        {task.completed && <Check aria-hidden="true" strokeWidth={2.5} />}
      </span>
    </li>
  );
}
