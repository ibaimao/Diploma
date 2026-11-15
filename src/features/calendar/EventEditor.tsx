import { useEffect, useRef, useState } from "react";
import type { FixedEvent } from "./scheduling";
export function EventEditor({
  event,
  day,
  onSave,
  onDelete,
  onClose,
}: {
  event?: FixedEvent;
  day: string;
  onSave: (event: FixedEvent) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    dialog.current?.showModal();
    return () => previous?.focus();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="task-dialog"
      onCancel={onClose}
      aria-label="Фиксированное событие"
    >
      <button
        className="editor-close"
        aria-label="Закрыть форму"
        onClick={onClose}
      >
        ×
      </button>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          try {
            onSave({
              id: event?.id ?? crypto.randomUUID(),
              title: String(data.get("title")),
              date: String(data.get("date")),
              start: String(data.get("start")),
              end: String(data.get("end")),
              weekly: data.get("weekly") === "on",
            });
            onClose();
          } catch (cause) {
            setError((cause as Error).message);
          }
        }}
      >
        <h2>{event ? "Редактировать событие" : "Новое событие"}</h2>
        <label>
          Название
          <input name="title" required defaultValue={event?.title} autoFocus />
        </label>
        <label>
          Дата
          <input
            name="date"
            type="date"
            required
            defaultValue={event?.date ?? day}
          />
        </label>
        <label>
          Начало
          <input
            name="start"
            type="time"
            required
            defaultValue={event?.start}
          />
        </label>
        <label>
          Окончание
          <input name="end" type="time" required defaultValue={event?.end} />
        </label>
        <label className="editor-toggle">
          <input type="checkbox" name="weekly" defaultChecked={event?.weekly} />
          Повторять еженедельно
        </label>
        {event?.weekly && (
          <p>Изменение или удаление относится ко всей серии.</p>
        )}
        <div className="editor-actions">
          {event && (
            <button
              type="button"
              onClick={() => {
                try {
                  onDelete();
                  onClose();
                } catch (cause) {
                  setError((cause as Error).message);
                }
              }}
            >
              Удалить событие
            </button>
          )}
          <button className="editor-save">Сохранить</button>
        </div>
        {error && <p role="alert">{error}</p>}
      </form>
    </dialog>
  );
}
