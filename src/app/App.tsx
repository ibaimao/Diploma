import { useState } from "react";
import { Navigation } from "./Navigation";
import type { Section } from "./Navigation";
import { TasksPanel } from "../features/tasks/TasksPanel";
import { CalendarPlaceholder } from "../features/calendar/CalendarPlaceholder";
import { TimerPlaceholder } from "../features/timer/TimerPlaceholder";
import { PetRoomPlaceholder } from "../features/pet/PetRoomPlaceholder";
import { FeaturePlaceholder } from "../shared/ui/FeaturePlaceholder";

export function App() {
  const [section, setSection] = useState<Section>("tasks");
  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Перейти к задачам
      </a>
      <main
        className="planner"
        aria-label="Планировщик для учёбы"
        aria-describedby="prototype-description"
      >
        <p id="prototype-description" className="sr-only">
          Демонстрационные задачи и дата. Данные не сохраняются. Комната —
          иллюстрация-заглушка, а не 3D. Остальные разделы пока не реализованы.
        </p>
        <Navigation active={section} onSelect={setSection} />
        <div id="main-content" className="workspace" tabIndex={-1}>
          {section === "tasks" && <TasksPanel />}
          {section === "calendar" && <CalendarPlaceholder />}
          {section === "timer" && <TimerPlaceholder />}
          {section === "rewards" && (
            <FeaturePlaceholder
              title="Задания за монетки"
              description="Раздел пока не реализован. Заданий за монетки и наград пока нет."
            />
          )}
          {section === "shop" && (
            <FeaturePlaceholder
              title="Магазин предметов"
              description="Раздел пока не реализован. Покупки и платежи недоступны."
            />
          )}
        </div>
        <PetRoomPlaceholder />
      </main>
    </div>
  );
}
