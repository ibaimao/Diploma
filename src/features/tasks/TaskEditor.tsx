import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Task, TaskColor, TaskInput } from "./types";
import { taskColors, validateInput } from "./taskModel";
import { localDateTime } from "../../shared/time";

const colorNames = {
  coral: "Коралловый",
  peach: "Персиковый",
  sage: "Шалфейный",
  blue: "Голубой",
};
export function TaskEditor({
  task,
  day,
  onSave,
  onDelete,
  onClose,
}: {
  task?: Task;
  day: string;
  onSave: (input: TaskInput) => boolean;
  onDelete: () => boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [color, setColor] = useState<TaskColor>(task?.color ?? "coral");
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    return () => {
      previous?.focus();
    };
  }, []);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const hours = Number(fields.get("hours"));
    const minutes = Number(fields.get("minutes"));
    try {
      if (
        !Number.isSafeInteger(hours) ||
        hours < 0 ||
        !Number.isInteger(minutes) ||
        minutes < 0 ||
        minutes > 59
      )
        throw new Error("Введите неотрицательные часы и минуты от 0 до 59.");
      const local = String(fields.get("deadline"));
      const date = new Date(local);
      if (!Number.isFinite(date.getTime()) || localDateTime(date) !== local)
        throw new Error(
          "Такого местного времени не существует. Выберите другое время.",
        );
      const input = validateInput({
        title: String(fields.get("title")),
        estimated_minutes: hours * 60 + minutes,
        deadline: date.toISOString(),
        category: String(fields.get("category")),
        color,
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
              <button type="button" onClick={() => setDeleting(false)}>
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDelete()) onClose();
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
                      (task?.estimated_minutes ?? 30) / 60,
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
                    defaultValue={(task?.estimated_minutes ?? 30) % 60}
                  />
                </label>
              </div>
            </fieldset>
            <label>
              Дедлайн
              <input
                name="deadline"
                type="datetime-local"
                required
                defaultValue={
                  task ? localDateTime(new Date(task.deadline)) : `${day}T23:59`
                }
              />
            </label>
            <label>
              Категория (необязательно)
              <input name="category" defaultValue={task?.category ?? ""} />
            </label>
            <fieldset>
              <legend>Цвет карточки</legend>
              <div className="color-options">
                {taskColors.map((value) => (
                  <label
                    key={value}
                    className={`color-option task-card--${value}`}
                  >
                    <input
                      type="radio"
                      name="color"
                      value={value}
                      checked={color === value}
                      onChange={() => setColor(value)}
                    />
                    <span>{colorNames[value]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="editor-actions">
              {task && (
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
              <button type="button" onClick={onClose}>
                Отмена
              </button>
              <button type="submit">Сохранить</button>
            </div>
          </>
        )}
        {error && <p role="alert">{error}</p>}
      </form>
    </dialog>
  );
}
