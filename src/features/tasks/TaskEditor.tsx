import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";
import type { Task, TaskDeadline, TaskInput, TaskPriority } from "./types";
import { validateInput } from "./taskModel";
import { exactDeadline } from "./taskDates";
import { localDay, localDateTime } from "../../shared/time";

interface EditorProps {
  task?: Task;
  day: string;
  onSave: (input: TaskInput) => boolean;
  onDelete?: () => boolean;
  onClose: () => void;
}
export function QuickTaskEditor(props: Omit<EditorProps, "task" | "onDelete">) {
  return <TaskEditor {...props} mode="quick" />;
}
/** Calendar can supply its selected day here; no calendar UI is mounted yet. */
export function AdvancedTaskEditor(props: EditorProps) {
  return <TaskEditor {...props} mode="advanced" />;
}
function TaskEditor({
  task,
  day,
  mode,
  onSave,
  onDelete,
  onClose,
}: EditorProps & { mode: "quick" | "advanced" }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [withDuration, setWithDuration] = useState(
    task?.estimated_minutes != null,
  );
  const [withDeadline, setWithDeadline] = useState(task?.deadline != null);
  const [withTime, setWithTime] = useState(task?.deadline?.kind === "datetime");
  const exact =
    task?.deadline?.kind === "datetime"
      ? localDateTime(new Date(task.deadline.at))
      : null;
  const deadlineDay =
    task?.deadline?.kind === "date" ? task.deadline.date : exact?.slice(0, 10);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    dialog.current?.querySelector<HTMLInputElement>('[name="title"]')?.focus();
    return () => {
      previous?.focus();
    };
  }, []);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    try {
      let duration: number | null = null;
      if (withDuration) {
        const hours = Number(fields.get("hours"));
        const minutes = Number(fields.get("minutes"));
        if (
          !Number.isSafeInteger(hours) ||
          hours < 0 ||
          !Number.isInteger(minutes) ||
          minutes < 0 ||
          minutes > 59
        )
          throw new Error("Введите неотрицательные часы и минуты от 0 до 59.");
        duration = hours * 60 + minutes;
      }
      const plannedDate =
        mode === "quick"
          ? localDay(new Date())
          : String(fields.get("planned_date"));
      let deadline: TaskDeadline | null = null;
      if (withDeadline) {
        const date =
          mode === "quick" ? plannedDate : String(fields.get("deadline_date"));
        deadline =
          mode === "quick" || withTime
            ? exactDeadline(date, String(fields.get("deadline_time")))
            : { kind: "date", date };
      }
      const input = validateInput({
        title: String(fields.get("title")),
        category: String(fields.get("category")),
        planned_date: plannedDate,
        estimated_minutes: duration,
        deadline,
        priority:
          mode === "quick"
            ? "none"
            : (String(fields.get("priority")) as TaskPriority),
      });
      if (onSave(input)) onClose();
      else
        setError(
          "Не удалось сохранить. Проверьте доступ к хранилищу и повторите попытку.",
        );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Проверьте поля.");
    }
  }
  return (
    <dialog
      ref={dialog}
      className="task-dialog"
      aria-labelledby="task-editor-title"
      onCancel={onClose}
    >
      <button
        type="button"
        className="editor-close"
        aria-label="Закрыть форму"
        onClick={onClose}
      >
        <X aria-hidden="true" />
      </button>
      <form onSubmit={submit}>
        <h2 id="task-editor-title">
          {deleting
            ? "Удалить задачу?"
            : task
              ? "Редактировать задачу"
              : "Новая задача"}
        </h2>
        {deleting ? (
          <>
            <p>«{task?.title}» будет удалена.</p>
            <div className="editor-actions">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setDeleting(false);
                }}
              >
                Вернуться к задаче
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDelete?.()) onClose();
                  else setError("Удаление не сохранено. Повторите попытку.");
                }}
              >
                Удалить навсегда
              </button>
            </div>
          </>
        ) : (
          <>
            <label>
              Название задачи
              <input
                name="title"
                required
                autoFocus
                defaultValue={task?.title ?? ""}
              />
            </label>
            <label>
              Категория (необязательно)
              <input name="category" defaultValue={task?.category ?? ""} />
            </label>
            {mode === "advanced" && (
              <>
                <label>
                  Дата дела
                  <input
                    name="planned_date"
                    type="date"
                    required
                    defaultValue={task?.planned_date ?? day}
                  />
                </label>
                <label>
                  Приоритет
                  <select
                    name="priority"
                    defaultValue={task?.priority ?? "none"}
                  >
                    <option value="none">Без приоритета</option>
                    <option value="high">Высокий</option>
                    <option value="medium">Средний</option>
                    <option value="low">Низкий</option>
                  </select>
                </label>
              </>
            )}
            <label className="editor-toggle">
              <input
                type="checkbox"
                role="switch"
                aria-label="Добавить время выполнения"
                checked={withDuration}
                onChange={(event) => setWithDuration(event.target.checked)}
              />
              Добавить время выполнения
            </label>
            {withDuration && (
              <fieldset>
                <legend>Предполагаемая длительность</legend>
                <div className="duration-fields">
                  <label>
                    Часы
                    <input
                      name="hours"
                      type="number"
                      min="0"
                      step="1"
                      required
                      defaultValue={Math.floor(
                        (task?.estimated_minutes ?? 0) / 60,
                      )}
                    />
                  </label>
                  <label>
                    Минуты
                    <input
                      name="minutes"
                      type="number"
                      min="0"
                      max="59"
                      step="1"
                      required
                      defaultValue={(task?.estimated_minutes ?? 0) % 60}
                    />
                  </label>
                </div>
              </fieldset>
            )}
            <label className="editor-toggle">
              <input
                type="checkbox"
                role="switch"
                aria-label={
                  mode === "quick"
                    ? "Выполнить до определённого времени"
                    : "Добавить дедлайн"
                }
                checked={withDeadline}
                onChange={(event) => setWithDeadline(event.target.checked)}
              />
              {mode === "quick"
                ? "Выполнить до определённого времени"
                : "Добавить дедлайн"}
            </label>
            {withDeadline && (
              <fieldset>
                <legend>Дедлайн</legend>
                {mode === "advanced" && (
                  <>
                    <label>
                      Дата дедлайна
                      <input
                        name="deadline_date"
                        type="date"
                        required
                        defaultValue={deadlineDay ?? ""}
                      />
                    </label>
                    <label className="editor-toggle">
                      <input
                        type="checkbox"
                        role="switch"
                        aria-label="Указать точное время"
                        checked={withTime}
                        onChange={(event) => setWithTime(event.target.checked)}
                      />
                      Указать точное время
                    </label>
                  </>
                )}
                {(mode === "quick" || withTime) && (
                  <label>
                    Время дедлайна
                    <input
                      name="deadline_time"
                      type="time"
                      required
                      step="60"
                      defaultValue={exact?.slice(11, 16) ?? ""}
                    />
                  </label>
                )}
              </fieldset>
            )}
            <div className="editor-actions">
              {task && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setDeleting(true);
                  }}
                >
                  Удалить
                </button>
              )}
              <button className="editor-save" type="submit">
                Сохранить
              </button>
            </div>
          </>
        )}
        {error && <p role="alert">{error}</p>}
      </form>
    </dialog>
  );
}
