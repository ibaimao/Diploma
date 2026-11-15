import { demoTasks } from "./demoTasks";
import { TaskCard } from "./TaskCard";

export function TasksPanel() {
  const dailyTasks = demoTasks.filter((task) => !task.overdue);
  const overdueTasks = demoTasks.filter((task) => task.overdue);
  return (
    <section className="tasks-content" aria-labelledby="tasks-title">
      <div className="panel-heading">
        <h1 id="tasks-title">Задачи на день</h1>
        <svg
          className="heading-rays"
          viewBox="0 0 24 30"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m6 8 4-6m2 13 8-3m-7 12 6 3"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div
        className="tasks-paper"
        role="region"
        aria-label="Список демонстрационных задач"
        tabIndex={0}
      >
        <ul className="task-list" aria-label="Задачи на день">
          {dailyTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </ul>
        <div className="overdue-heading">
          <h2>Просроченные задачи</h2>
          <span aria-hidden="true" />
        </div>
        <ul className="task-list" aria-label="Просроченные задачи">
          {overdueTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </ul>
      </div>
    </section>
  );
}
