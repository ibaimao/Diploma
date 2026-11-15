export type TaskColor = "coral" | "peach" | "sage" | "blue";
export type TaskPriority = "high" | "medium" | "low" | "none";
export type TaskDeadline =
  { kind: "date"; date: string } | { kind: "datetime"; at: string };

/** Reserved for explicit work intervals; a deadline is never a start time. */
export interface ScheduleBlock {
  id: string;
  starts_at: string;
  ends_at: string;
}
export interface Task {
  id: string;
  title: string;
  planned_date: string;
  deadline: TaskDeadline | null;
  estimated_minutes: number | null;
  actual_minutes: number;
  category: string;
  priority: TaskPriority;
  completed: boolean;
  schedule_blocks: ScheduleBlock[];
}
export type TaskInput = Omit<
  Task,
  "id" | "completed" | "actual_minutes" | "schedule_blocks"
>;

// Archived reference fixture, never loaded into user storage.
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
