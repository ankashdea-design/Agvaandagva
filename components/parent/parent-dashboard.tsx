"use client";

import { useState } from "react";
import type { ChildWithReport } from "@/types/database";
import { formatMongolianDate, cn } from "@/lib/utils";

const MOOD_LABEL: Record<string, { emoji: string; text: string }> = {
  happy: { emoji: "😊", text: "Сайхан" },
  neutral: { emoji: "😐", text: "Хэвийн" },
  sad: { emoji: "😢", text: "Уйтгартай" },
};
const MEAL_LABEL: Record<string, string> = { poor: "Идсэнгүй", medium: "Дунд зэрэг идсэн", good: "Сайн идсэн" };
const ACTIVITY_LABELS: { key: string; label: string; icon: string }[] = [
  { key: "drawing", label: "Зураг зурсан", icon: "🎨" },
  { key: "music", label: "Дуу хөгжим", icon: "🎵" },
  { key: "story", label: "Үлгэр сонссон", icon: "📖" },
  { key: "play", label: "Тоглосон", icon: "🧸" },
  { key: "physical", label: "Биеийн хөдөлгөөн", icon: "🏃" },
  { key: "cognitive", label: "Танин мэдэхүй", icon: "🧠" },
];

export function ParentDashboard({
  date,
  children,
}: {
  date: string;
  children: (ChildWithReport & { class_name?: string })[];
}) {
  const [activeId, setActiveId] = useState(children[0].id);
  const active = children.find((c) => c.id === activeId)!;
  const report = active.daily_report;
  const activities = active.daily_activities;
  const attendance = active.attendance;

  return (
    <div className="mx-auto max-w-md px-4 pt-5">
      {children.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "shrink-0 touch-target rounded-full border px-4 py-2 text-sm font-medium",
                c.id === activeId
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-brand-200 bg-white text-brand-700"
              )}
            >
              {c.full_name}
            </button>
          ))}
        </div>
      )}

      <div className="mb-5">
        <h1 className="text-xl font-semibold text-brand-900">{active.full_name}</h1>
        <p className="text-sm text-brand-500">
          {active.class_name ? `${active.class_name} · ` : ""}
          {formatMongolianDate(date)}
        </p>
      </div>

      {attendance && attendance.status !== "present" ? (
        <div className="mb-4 rounded-2xl bg-amber-50 p-4 text-amber-800">
          <p className="font-medium">
            {attendance.status === "absent" && "Өнөөдөр ирээгүй"}
            {attendance.status === "sick" && "🤒 Өнөөдөр өвчтэй"}
            {attendance.status === "excused" && "🏠 Өнөөдөр чөлөөтэй"}
          </p>
        </div>
      ) : (
        <>
          {report?.highlight_note && (
            <div className="mb-4 rounded-2xl bg-brand-600 p-4 text-white shadow-card">
              <p className="mb-1 text-xs font-medium opacity-80">⭐ Өнөөдрийн онцлох</p>
              <p className="text-sm leading-relaxed">{report.highlight_note}</p>
            </div>
          )}

          <div className="mb-3 grid grid-cols-2 gap-3">
            <StatusCard
              icon={report?.mood ? MOOD_LABEL[report.mood].emoji : "⚪"}
              label="Сэтгэл санаа"
              value={report?.mood ? MOOD_LABEL[report.mood].text : "Тэмдэглэгдээгүй"}
            />
            <StatusCard
              icon="🍚"
              label="Хоол"
              value={report?.meal ? MEAL_LABEL[report.meal] : "Тэмдэглэгдээгүй"}
            />
          </div>

          {(report?.nap_start || report?.nap_end) && (
            <StatusCard
              icon="😴"
              label="Нойр"
              value={`${report?.nap_start ?? "?"} – ${report?.nap_end ?? "?"}`}
              className="mb-3"
            />
          )}

          <div className="mb-3 rounded-2xl bg-white p-4 shadow-soft">
            <p className="mb-2 text-sm font-semibold text-brand-800">ӨНӨӨДӨР</p>
            <div className="grid grid-cols-2 gap-2">
              {ACTIVITY_LABELS.map((a) => {
                const done = activities ? Boolean((activities as any)[a.key]) : false;
                return (
                  <div
                    key={a.key}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                      done ? "bg-emerald-50 text-emerald-700" : "bg-brand-50/50 text-brand-300"
                    )}
                  >
                    <span>{done ? "✓" : "○"}</span>
                    <span>{a.icon} {a.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {report?.extra_note && (
            <div className="mb-3 rounded-2xl bg-white p-4 shadow-soft">
              <p className="mb-1 text-sm font-semibold text-brand-800">📝 Багшийн тэмдэглэл</p>
              <p className="text-sm text-brand-600">{report.extra_note}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatusCard({
  icon,
  label,
  value,
  className,
}: {
  icon: string;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl bg-white p-4 shadow-soft", className)}>
      <p className="mb-1 text-2xl">{icon}</p>
      <p className="text-xs text-brand-400">{label}</p>
      <p className="text-sm font-semibold text-brand-900">{value}</p>
    </div>
  );
}
