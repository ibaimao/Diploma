import { useCallback, useEffect, useState } from "react";
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
