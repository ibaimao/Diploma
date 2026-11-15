import { useCallback, useEffect, useState } from "react";
import { assertFree, loadEvents } from "../calendar/scheduling";
import { deadlineAt } from "./taskDates";
import type { Task } from "./types";
import { createTaskRepository, TASKS_KEY } from "./taskStorage";

// Save first: an unavailable/full storage must never look like a successful change.
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const reload = useCallback(() => {
    try {
      setTasks(createTaskRepository(window.localStorage).load());
      setReady(true);
      setError("");
    } catch {
      setReady(false);
      setError(
        "Не удалось прочитать задачи. Сохранённые данные не изменены. Проверьте доступ к хранилищу и повторите попытку.",
      );
    }
  }, []);
  useEffect(() => {
    reload();
    const sync = (event: StorageEvent) => {
      if (event.key === TASKS_KEY || event.key === null) reload();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [reload]);
  function change(update: (current: Task[]) => Task[]): boolean {
    try {
      const repository = createTaskRepository(window.localStorage);
      const next = update(repository.load());
      const events = loadEvents(window.localStorage);
      for (const task of next)
        for (const block of task.schedule_blocks) {
          const start = Date.parse(block.starts_at),
            end = Date.parse(block.ends_at);
          if (
            task.deadline &&
            end >
              deadlineAt(task.deadline) +
                (task.deadline.kind === "date" ? 1 : 0)
          )
            throw new Error(
              "Нельзя разместить задачу после дедлайна: задача закончится позже установленного срока.",
            );
          assertFree(start, end, next, events, task.id);
        }
      repository.save(next);
      setTasks(next);
      setError("");
      return true;
    } catch (cause) {
      setError(
        `Изменения не сохранены. ${cause instanceof Error ? cause.message : "Проверьте доступ к хранилищу."}`,
      );
      return false;
    }
  }
  return { tasks, error, ready, change, reload };
}
