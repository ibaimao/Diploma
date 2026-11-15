import { CalendarDays, Clock3, Store, Trophy } from "lucide-react";

export type Section = "tasks" | "calendar" | "timer" | "rewards" | "shop";
const items = [
  { id: "tasks", label: "Задачи на день", icon: null },
  { id: "calendar", label: "Календарь", icon: CalendarDays },
  { id: "timer", label: "Таймер Pomodoro", icon: Clock3 },
  { id: "rewards", label: "Задания за монетки", icon: Trophy },
  { id: "shop", label: "Магазин предметов", icon: Store },
] as const;

export function Navigation({
  active,
  onSelect,
}: {
  active: Section;
  onSelect: (section: Section) => void;
}) {
  return (
    <nav className="navigation" aria-label="Разделы приложения">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`nav-button nav-button--${id}${active === id ? " nav-button--active" : ""}`}
          onClick={() => onSelect(id)}
          aria-current={active === id ? "page" : undefined}
          aria-label={label}
          title={label}
          aria-describedby={
            id === "tasks" ? undefined : "prototype-description"
          }
        >
          {Icon ? (
            <Icon aria-hidden="true" strokeWidth={1.6} />
          ) : (
            <span className="tasks-symbol" aria-hidden="true">
              !
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
