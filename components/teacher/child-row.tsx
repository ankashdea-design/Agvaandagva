"use client";

import type { ChildWithReport, AttendanceStatus } from "@/types/database";
import { cn } from "@/lib/utils";
import { isComplete } from "./teacher-dashboard";

const MEAL_LABEL: Record<string, string> = { poor: "Муу", medium: "Дунд", good: "Сайн" };
const MOOD_EMOJI: Record<string, string> = { sad: "😢", neutral: "😐", happy: "😊" };

const ATTENDANCE_OPTIONS: { status: AttendanceStatus; icon: string; label: string }[] = [
  { status: "present", icon: "✓", label: "Ирсэн" },
  { status: "absent", icon: "✕", label: "Ирээгүй" },
  { status: "sick", icon: "🤒", label: "Өвчтэй" },
  { status: "excused", icon: "🏠", label: "Чөлөөтэй" },
];

export function ChildRow({
  child,
  onOpen,
  onAttendance,
}: {
  child: ChildWithReport;
  onOpen: () => void;
  onAttendance: (status: AttendanceStatus) => void;
}) {
  const attendanceStatus = child.attendance?.status ?? "present";
  const isAbsent = attendanceStatus !== "present";
  const complete = isComplete(child);

  return (
    <li className="py-2.5">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpen}
          className="flex flex-1 items-center gap-3 rounded-xl py-1.5 text-left active:bg-brand-50"
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
              complete ? "bg-emerald-100 text-emerald-700" : "bg-brand-100 text-brand-600"
            )}
          >
            {child.full_name.split(" ").pop()?.slice(0, 1) ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("truncate text-sm font-medium", isAbsent ? "text-brand-400 line-through" : "text-brand-900")}>
              {child.full_name}
            </p>
            {!isAbsent ? (
              <div className="mt-0.5 flex items-center gap-2 text-xs text-brand-500">
                <span>{child.daily_report?.mood ? MOOD_EMOJI[child.daily_report.mood] : "⚪"}</span>
                <span>
                  🍚 {child.daily_report?.meal ? MEAL_LABEL[child.daily_report.meal] : "—"}
                </span>
                {complete && <span className="text-emerald-600">✓ Бүрэн</span>}
              </div>
            ) : (
              <p className="mt-0.5 text-xs text-amber-600">
                {ATTENDANCE_OPTIONS.find((a) => a.status === attendanceStatus)?.label}
              </p>
            )}
          </div>
        </button>

        <select
          value={attendanceStatus}
          onChange={(e) => onAttendance(e.target.value as AttendanceStatus)}
          className="touch-target rounded-lg border border-brand-200 bg-white px-2 py-1.5 text-xs text-brand-700 outline-none"
          aria-label="Ирц"
        >
          {ATTENDANCE_OPTIONS.map((opt) => (
            <option key={opt.status} value={opt.status}>
              {opt.icon} {opt.label}
            </option>
          ))}
        </select>
      </div>
    </li>
  );
}
