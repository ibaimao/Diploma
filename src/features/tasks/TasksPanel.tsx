import { useState } from "react";
import { Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { AdvancedTaskEditor, QuickTaskEditor } from "./TaskEditor";
import { useTasks } from "./useTasks";
import {
  createTask,
  editTask,
  deleteTask,
  toggleTask,
  selectTasks,
} from "./taskModel";
import { localDay, useLocalNow } from "../../shared/time";
import type { Task } from "./types";

export function TasksPanel({ store }: { store: ReturnType<typeof useTasks> }) {
  const now = useLocalNow();
  const day = localDay(now);
  const [editor, setEditor] = useState<Task | "new" | null>(null);
  const { tasks, error, ready, change, reload } = store;
  const { daily, overdue, completed } = selectTasks(tasks, day, now);
  const renderTask = (task: Task, late: boolean) => (
    <TaskCard
      key={task.id}
      task={task}
      overdue={late}
      onEdit={() => setEditor(task)}
      onToggle={() => change((current) => toggleTask(current, task.id))}
    />
  );
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
        aria-label="Список задач"
        tabIndex={0}
      >
        <div className="task-toolbar">
          <button
            type="button"
            className="add-task-button"
            aria-label="Добавить задачу"
            disabled={!ready}
            onClick={() => setEditor("new")}
          >
            <Plus aria-hidden="true" />
          </button>
        </div>
        {error && (
          <div className="task-storage-error" role="alert">
            {error} <button onClick={reload}>Повторить</button>
          </div>
        )}
        <ul className="task-list" aria-label="Задачи на день">
          {daily.map((task) => renderTask(task, false))}
        </ul>
        {ready && daily.length + overdue.length + completed.length === 0 && (
          <p className="task-empty">На сегодня задач нет</p>
        )}
        {overdue.length > 0 && (
          <>
            <div className="overdue-heading">
              <h2>Просроченные задачи</h2>
              <span aria-hidden="true" />
            </div>
            <ul className="task-list" aria-label="Просроченные задачи">
              {overdue.map((task) => renderTask(task, true))}
            </ul>
          </>
        )}
        {completed.length > 0 && (
          <ul
            className="task-list completed-list"
            aria-label="Выполненные задачи дня"
          >
            {completed.map((task) => renderTask(task, false))}
          </ul>
        )}
        {editor === "new" && (
          <QuickTaskEditor
            day={day}
            onClose={() => setEditor(null)}
            onSave={(input) =>
              change((current) => [...current, createTask(input)])
            }
          />
        )}
        {editor !== null && editor !== "new" && (
          <AdvancedTaskEditor
            task={editor}
            day={day}
            onClose={() => setEditor(null)}
            onSave={(input) =>
              change((current) => editTask(current, editor.id, input))
            }
            onDelete={() => change((current) => deleteTask(current, editor.id))}
          />
        )}
      </div>
    </section>
  );
}
