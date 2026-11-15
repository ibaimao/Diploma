export type TaskColor = "coral" | "peach" | "sage" | "blue";

/** Presentation data only. Persistence and editing belong to a later stage. */
export interface DemoTask {
  id: string;
  title: string;
  category: string;
  scheduleLabel: string;
  durationMinutes: number;
  color: TaskColor;
  completed: boolean;
  overdue: boolean;
}
