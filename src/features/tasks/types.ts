export type TaskColor = "coral" | "peach" | "sage" | "blue";

export interface Task {
  id: string;
  title: string;
  estimated_minutes: number;
  actual_minutes: number;
  deadline: string;
  category: string;
  color: TaskColor;
  completed: boolean;
}
export type TaskInput = Omit<Task, "id" | "completed" | "actual_minutes">;

// Kept only for the archived reference fixtures, never loaded into user storage.
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
