import type { TaskDeadline } from "./types";
import { localDay, localDateTime } from "../../shared/time";

export function isLocalDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && localDay(date) === value;
}
export function isInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    ) &&
    isLocalDate(value.slice(0, 10)) &&
    Number.isFinite(Date.parse(value))
  );
}
export function deadlineAt(deadline: TaskDeadline): number {
  if (deadline.kind === "datetime") return Date.parse(deadline.at);
  // Next local midnight, not +24h: local days may have 23 or 25 hours.
  const end = new Date(`${deadline.date}T12:00:00`);
  end.setDate(end.getDate() + 1);
  end.setHours(0, 0, 0, 0);
  return end.getTime() - 1;
}
export function exactDeadline(day: string, time: string): TaskDeadline {
  const local = `${day}T${time}`;
  const date = new Date(local);
  if (
    !isLocalDate(day) ||
    !/^\d{2}:\d{2}$/.test(time) ||
    !Number.isFinite(date.getTime()) ||
    localDateTime(date) !== local
  )
    throw new Error("Укажите существующие местные дату и время.");
  return { kind: "datetime", at: date.toISOString() };
}
