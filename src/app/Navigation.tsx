import {
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Clock3,
  House,
  ListTodo,
} from "lucide-react";

export type Section = "tasks" | "calendar" | "timer" | "statistics" | "pet";

const items = [
  { id: "tasks", label: "Задачи", icon: ListTodo },
  { id: "calendar", label: "Календарь", icon: CalendarDays },
  { id: "timer", label: "Таймер", icon: Clock3 },
  { id: "statistics", label: "Статистика", icon: ChartNoAxesColumnIncreasing },
  { id: "pet", label: "Комната", icon: House },
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
          className={`nav-button${active === id ? " nav-button--active" : ""}`}
          onClick={() => onSelect(id)}
          aria-current={active === id ? "page" : undefined}
          aria-label={id === "tasks" ? label : `${label} — раздел в разработке`}
          title={id === "tasks" ? label : `${label} — скоро`}
        >
          <span className="nav-icon">
            <Icon size={25} strokeWidth={1.7} />
          </span>
          <span className="nav-label">{label}</span>
        </button>
      ))}
      <span className="nav-decoration" aria-hidden="true">
        ✳
      </span>
    </nav>
  );
}
