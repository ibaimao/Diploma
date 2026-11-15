import { useState } from "react";
import { Cat, Heart, Leaf } from "lucide-react";
import { Navigation } from "./Navigation";
import type { Section } from "./Navigation";
import { TasksPanel } from "../features/tasks/TasksPanel";
import { CalendarPlaceholder } from "../features/calendar/CalendarPlaceholder";
import { TimerPlaceholder } from "../features/timer/TimerPlaceholder";
import { StatisticsPlaceholder } from "../features/statistics/StatisticsPlaceholder";
import { PetDetailsPlaceholder } from "../features/pet/PetDetailsPlaceholder";
import { PetRoomPlaceholder } from "../features/pet/PetRoomPlaceholder";

export function App() {
  const [section, setSection] = useState<Section>("tasks");
  const backToTasks = () => setSection("tasks");

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Перейти к содержимому
      </a>
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">
            <Cat size={27} strokeWidth={1.7} />
          </span>
          <div>
            <span className="brand-name">Планировщик для учёбы</span>
            <span className="brand-tagline">
              Большие планы начинаются с маленьких шагов
            </span>
          </div>
        </div>
        <span className="demo-badge">
          <span />
          Демо-версия
        </span>
      </header>
      <div className="intro">
        <div>
          <span className="eyebrow">ТВОЁ МЕСТО ДЛЯ СПОКОЙНОЙ УЧЁБЫ</span>
          <h1>
            Каждому делу — своё время
            <span className="intro-flower" aria-hidden="true">
              ✳
            </span>
          </h1>
          <p>Немного порядка в планах. Немного уюта в каждом дне.</p>
        </div>
        <span className="intro-note">
          <Leaf size={19} strokeWidth={1.6} /> В своём ритме
        </span>
      </div>
      <main id="main-content" className="planner" tabIndex={-1}>
        <Navigation active={section} onSelect={setSection} />
        <div className="workspace" key={section}>
          {section === "tasks" && <TasksPanel />}
          {section === "calendar" && (
            <CalendarPlaceholder onBack={backToTasks} />
          )}
          {section === "timer" && <TimerPlaceholder onBack={backToTasks} />}
          {section === "statistics" && (
            <StatisticsPlaceholder onBack={backToTasks} />
          )}
          {section === "pet" && <PetDetailsPlaceholder onBack={backToTasks} />}
        </div>
        <PetRoomPlaceholder />
      </main>
      <footer className="app-footer">
        <span>
          <Heart size={13} /> Для учёбы, в которой есть место себе
        </span>
        <span>Учебный проект · интерфейс-прототип</span>
      </footer>
    </div>
  );
}
