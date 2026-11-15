import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ruLocale from "@fullcalendar/core/locales/ru";
import type { EventInput } from "@fullcalendar/core";
import { AdvancedTaskEditor } from "../tasks/TaskEditor";
import {
  createTask,
  deleteTask,
  editTask,
  toggleTask,
  priorityColors,
} from "../tasks/taskModel";
import type { Task } from "../tasks/types";
import type { useTasks } from "../tasks/useTasks";
import { localDay, localDateTime } from "../../shared/time";
import {
  assistedPlanning,
  assertEventFree,
  EVENTS_KEY,
  loadEvents,
  placeTask,
  saveEvents,
} from "./scheduling";
import type { FixedEvent } from "./scheduling";
import { createTaskRepository } from "../tasks/taskStorage";
import { EventEditor } from "./EventEditor";

const colors = {
  coral: "#f3a487",
  peach: "#f4d19b",
  sage: "#b4c4a1",
  blue: "#aecbed",
};
export function CalendarPanel({
  store,
}: {
  store: ReturnType<typeof useTasks>;
}) {
  const calendar = useRef<FullCalendar>(null);
  const [mode, setMode] = useState<
    "timeGridWeek" | "dayGridMonth" | "timeGridDay"
  >("timeGridWeek");
  const [selectedDay, setSelectedDay] = useState(localDay(new Date()));
  const [title, setTitle] = useState("");
  const [editor, setEditor] = useState<Task | "new" | null>(null);
  const [eventEditor, setEventEditor] = useState<FixedEvent | "new" | null>(
    null,
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [events, setEvents] = useState<FixedEvent[]>([]);
  const [eventsReady, setEventsReady] = useState(false);
  const [eventError, setEventError] = useState("");
  const pending = store.tasks.find((task) => task.id === pendingId);
  function reloadEvents() {
    try {
      setEvents(loadEvents(window.localStorage));
      setEventsReady(true);
      setEventError("");
    } catch (e) {
      setEventsReady(false);
      setEventError((e as Error).message);
    }
  }
  useEffect(() => {
    reloadEvents();
    const sync = (e: StorageEvent) => {
      if (e.key === EVENTS_KEY || e.key === null) reloadEvents();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function view(next: typeof mode, date = selectedDay) {
    setMode(next);
    calendar.current?.getApi().changeView(next, date);
  }
  function choose(date: Date, allDay: boolean) {
    const day = localDay(date);
    setSelectedDay(day);
    if (pending && (pending.estimated_minutes === null || !allDay)) {
      let warning = "";
      const ok = store.change((current) => {
        try {
          return placeTask(
            current,
            pending.id,
            day,
            allDay ? null : localDateTime(date).slice(11, 16),
            loadEvents(window.localStorage),
          );
        } catch (e) {
          warning = (e as Error).message;
          throw e;
        }
      });
      if (ok) {
        setPendingId(null);
        setNotice("");
      } else setNotice(warning || "Не удалось сохранить размещение.");
    } else view("timeGridDay", day);
  }
  const entries: EventInput[] = store.tasks.flatMap<EventInput>((task) => {
    const common = {
      title: task.title,
      backgroundColor: colors[priorityColors[task.priority]],
      borderColor: colors[priorityColors[task.priority]],
      textColor: "#354b56",
      extendedProps: { taskId: task.id },
      classNames: task.completed ? ["calendar-completed"] : [],
    };
    return task.schedule_blocks.length
      ? task.schedule_blocks.map((block) => ({
          ...common,
          id: block.id,
          start: block.starts_at,
          end: block.ends_at,
          editable: true,
          durationEditable: false,
        }))
      : task.planned_date
        ? [
            {
              ...common,
              id: task.id,
              start: task.planned_date,
              allDay: true,
              editable: false,
            },
          ]
        : [];
  });
  for (const event of events) {
    const common = {
      id: `event-${event.id}`,
      title: event.title,
      backgroundColor: "#c6c0df",
      borderColor: "#c6c0df",
      textColor: "#354b56",
      editable: false,
      extendedProps: { fixedId: event.id },
    };
    entries.push(
      event.weekly
        ? {
            ...common,
            daysOfWeek: [new Date(`${event.date}T12:00`).getDay()],
            startTime: event.start,
            endTime: event.end,
            startRecur: event.date,
          }
        : {
            ...common,
            start: `${event.date}T${event.start}`,
            end: `${event.date}T${event.end}`,
          },
    );
  }
  return (
    <section className="tasks-content calendar-content" aria-label="Календарь">
      <div className="panel-heading">
        <h1>Календарь</h1>
      </div>
      <div className="tasks-paper calendar-paper">
        <div className="calendar-toolbar">
          <div className="calendar-modes">
            <button
              aria-pressed={mode === "timeGridWeek"}
              onClick={() => view("timeGridWeek")}
            >
              Неделя
            </button>
            <button
              aria-pressed={mode === "dayGridMonth"}
              onClick={() => view("dayGridMonth")}
            >
              Месяц
            </button>
          </div>
          <button
            disabled={!store.ready || !eventsReady}
            onClick={() => setEditor("new")}
          >
            Добавить задачу
          </button>
          <button
            disabled={!store.ready || !eventsReady}
            onClick={() => setEventEditor("new")}
          >
            Добавить событие
          </button>
        </div>
        {pending && (
          <div className="placement-banner" role="status">
            Выберите {pending.estimated_minutes === null ? "дату" : "время"} для
            задачи: {pending.title}
            <button
              onClick={() => {
                setPendingId(null);
                setNotice("");
              }}
            >
              Отменить размещение
            </button>
          </div>
        )}
        {notice && <p role="alert">{notice}</p>}
        {store.error && (
          <p role="alert">
            {store.error} <button onClick={store.reload}>Повторить</button>
          </p>
        )}
        {eventError && (
          <p role="alert">
            {eventError} <button onClick={reloadEvents}>Повторить</button>
          </p>
        )}
        <div className="calendar-dates">
          <button
            aria-label="Предыдущий период"
            onClick={() => {
              const api = calendar.current!.getApi();
              api.prev();
              setSelectedDay(localDay(api.getDate()));
            }}
          >
            ‹
          </button>
          <h2>{title}</h2>
          <button
            aria-label="Следующий период"
            onClick={() => {
              const api = calendar.current!.getApi();
              api.next();
              setSelectedDay(localDay(api.getDate()));
            }}
          >
            ›
          </button>
          <button
            onClick={() => {
              const today = localDay(new Date());
              setSelectedDay(today);
              calendar.current?.getApi().gotoDate(today);
            }}
          >
            Сегодня
          </button>
        </div>
        {store.tasks.some((task) => task.planned_date === null) && (
          <div className="unscheduled">
            <h2>Незапланированные задачи</h2>
            {store.tasks
              .filter((task) => task.planned_date === null)
              .map((task) => (
                <button
                  key={task.id}
                  disabled={!eventsReady}
                  onClick={() => {
                    setPendingId(task.id);
                    setNotice("");
                  }}
                >
                  {task.title} — разместить
                </button>
              ))}
          </div>
        )}
        <FullCalendar
          ref={calendar}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          locale={ruLocale}
          firstDay={1}
          timeZone="local"
          initialView="timeGridWeek"
          initialDate={selectedDay}
          headerToolbar={false}
          height="auto"
          allDayText="Без времени"
          slotDuration="00:30:00"
          slotLabelInterval="01:00"
          nowIndicator
          dayMaxEvents={2}
          eventMinHeight={22}
          eventLongPressDelay={300}
          longPressDelay={300}
          events={entries}
          datesSet={(info) => setTitle(info.view.title)}
          dateClick={(info) => choose(info.date, info.allDay)}
          navLinks
          navLinkDayClick={(date) => {
            setSelectedDay(localDay(date));
            view("timeGridDay", localDay(date));
          }}
          eventClick={(info) => {
            if (pending) {
              setNotice("Это время занято. Выберите другое место.");
              return;
            }
            const task = store.tasks.find(
              (task) => task.id === info.event.extendedProps.taskId,
            );
            if (task) setEditor(task);
            else {
              const event = events.find(
                (event) => event.id === info.event.extendedProps.fixedId,
              );
              if (event) setEventEditor(event);
            }
          }}
          eventDrop={(info) => {
            if (
              !info.event.start ||
              info.event.allDay ||
              !eventsReady ||
              pending
            ) {
              info.revert();
              setNotice("Для переноса выберите время в недельном расписании.");
              return;
            }
            const date = info.event.start;
            let warning = "";
            const ok = store.change((current) => {
              try {
                return placeTask(
                  current,
                  info.event.extendedProps.taskId,
                  localDay(date),
                  localDateTime(date).slice(11, 16),
                  loadEvents(window.localStorage),
                );
              } catch (e) {
                warning = (e as Error).message;
                throw e;
              }
            });
            if (!ok) info.revert();
            setNotice(ok ? "" : warning || "Перенос не сохранён.");
          }}
        />
      </div>
      {editor !== null && (
        <AdvancedTaskEditor
          task={editor === "new" ? undefined : editor}
          planning={editor === "new"}
          day={selectedDay}
          onClose={() => setEditor(null)}
          onPlanningMode={(mode) => {
            if (mode === "assisted") setNotice(assistedPlanning.message);
          }}
          onSave={(input) => {
            if (editor === "new") {
              const task = createTask({ ...input, planned_date: null });
              const ok = store.change((current) => [...current, task]);
              if (ok) {
                setPendingId(task.id);
                setNotice("");
              }
              return ok;
            }
            return store.change((current) =>
              editTask(current, editor.id, input),
            );
          }}
          extraActions={
            editor === "new" ? undefined : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setPendingId(editor.id);
                    setEditor(null);
                  }}
                >
                  Разместить заново
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      store.change((current) => toggleTask(current, editor.id))
                    )
                      setEditor(null);
                  }}
                >
                  {editor.completed ? "Вернуть в работу" : "Выполнить задачу"}
                </button>
              </>
            )
          }
          onDelete={
            editor === "new"
              ? undefined
              : () => store.change((current) => deleteTask(current, editor.id))
          }
        />
      )}

      {eventEditor !== null && (
        <EventEditor
          event={eventEditor === "new" ? undefined : eventEditor}
          day={selectedDay}
          onClose={() => setEventEditor(null)}
          onSave={(event) => {
            const others = loadEvents(window.localStorage).filter(
              (item) => item.id !== event.id,
            );
            assertEventFree(
              event,
              createTaskRepository(window.localStorage).load(),
              others,
            );
            saveEvents(window.localStorage, [...others, event]);
            reloadEvents();
          }}
          onDelete={() => {
            saveEvents(
              window.localStorage,
              loadEvents(window.localStorage).filter(
                (event) => event.id !== (eventEditor as FixedEvent).id,
              ),
            );
            reloadEvents();
          }}
        />
      )}
    </section>
  );
}
