import { CircleAlert, ListTodo, Plus, Sparkles } from "lucide-react";
import { demoTasks } from "./demoTasks";
import { TaskCard } from "./TaskCard";

export function TasksPanel() {
  const dailyTasks = demoTasks.filter((task) => !task.overdue);
  const overdueTasks = demoTasks.filter((task) => task.overdue);

  return (
    <section className="tasks-content" aria-labelledby="tasks-title">
      <div className="panel-heading">
        <div className="title-pill">
          <ListTodo size={20} />
          <h2 id="tasks-title">Задачи на день</h2>
        </div>
        <Sparkles
          className="heading-sparkles"
          size={27}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
      <div className="tasks-paper">
        <div className="day-summary">
          <span>
            1 сентября <span className="sample-date">· пример дня</span>
          </span>
          <span>
            Выполнено: {dailyTasks.filter((task) => task.completed).length} из{" "}
            {dailyTasks.length}
          </span>
        </div>
        <ul className="task-list" aria-label="Демонстрационные задачи на день">
          {dailyTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </ul>
        <div className="overdue-heading">
          <CircleAlert size={16} />
          <h3>Просроченные задачи</h3>
          <span aria-hidden="true" />
        </div>
        <ul
          className="task-list"
          aria-label="Демонстрационные просроченные задачи"
        >
          {overdueTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </ul>
        <div className="add-task-area">
          <button
            className="add-task-button"
            disabled
            aria-describedby="add-task-note"
          >
            <Plus size={18} /> Добавить задачу <span>Скоро</span>
          </button>
          <p id="add-task-note">Создание и отметки задач появятся позже.</p>
        </div>
        <div className="paper-note">
          <span className="note-line" />
          <span>Шаг за шагом — всё получится</span>
          <span className="note-line" />
        </div>
      </div>
      <p className="demo-caption">
        <span aria-hidden="true" />
        Демонстрационные данные · изменения не сохраняются
      </p>
    </section>
  );
}
