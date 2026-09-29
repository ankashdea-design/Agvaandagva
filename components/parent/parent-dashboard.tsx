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
const JUICE_LABEL: Record<string, string> = { drank: "Уусан", partial: "Бага зэрэг уусан", not_drank: "Уугаагүй" };
const MEAL_INTAKE_LABEL: Record<string, string> = { ate: "Идсэн", partial: "Бага зэрэг идсэн", not_ate: "Идээгүй" };
const BOWEL_LABEL: Record<string, string> = { good: "Сайн", medium: "Дунд", none: "Бие засаагүй" };

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
    <div className="mx-auto max-w-md px-4 pb-24 pt-5">
      {children.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "press shrink-0 touch-target rounded-full border px-4 py-2 text-sm font-medium",
                c.id === activeId
                  ? "border-transparent bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-600/25"
                  : "glass-btn text-slate-700"
              )}
            >
              {c.full_name}
            </button>
          ))}
        </div>
      )}

      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{active.full_name}</h1>
        <p className="text-sm text-slate-500">
          {active.class_name ? `${active.class_name} · ` : ""}
          {formatMongolianDate(date)}
        </p>
      </div>

      {attendance && attendance.status !== "present" ? (
        <div className="mb-4 rounded-2xl border border-amber-300/50 bg-amber-400/15 px-4 py-3.5 text-amber-800">
          <p className="font-semibold">
            {attendance.status === "absent" && "Өнөөдөр ирээгүй"}
            {attendance.status === "sick" && "🤒 Өнөөдөр өвчтэй"}
            {attendance.status === "excused" && "🏠 Өнөөдөр чөлөөтэй"}
          </p>
        </div>
      ) : (
        <>
          {report?.highlight_note && (
            <div className="mb-4 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 p-4 text-white shadow-lg shadow-brand-600/25">
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

          <SectionCard title="🍽️ Хоол, цайны дэлгэрэнгүй" className="mb-3">
            <div className="grid grid-cols-2 gap-2">
              <MiniRow icon="☕" label="Өглөөний цай" value={report?.morning_tea ? JUICE_LABEL[report.morning_tea] : "—"} />
              <MiniRow icon="🥤" label="Өдрийн жүүс" value={report?.juice ? JUICE_LABEL[report.juice] : "—"} />
              <MiniRow icon="🍲" label="1-р хоол" value={report?.meal1 ? MEAL_INTAKE_LABEL[report.meal1] : "—"} />
              <MiniRow icon="🍲" label="2-р хоол" value={report?.meal2 ? MEAL_INTAKE_LABEL[report.meal2] : "—"} />
              <MiniRow icon="🍵" label="Оройн цай" value={report?.evening_tea ? JUICE_LABEL[report.evening_tea] : "—"} />
            </div>
          </SectionCard>

          <SectionCard title="🧼 Ариун цэвэр" className="mb-3">
            <div className="grid grid-cols-1 gap-1.5 text-sm">
              <HygieneRow label="Гар угаасан" done={Boolean(report?.hygiene_hands)} />
              <HygieneRow label="Хүндээр бие зассан" done={Boolean(report?.hygiene_toilet)} />
              <HygieneRow label="Шүд угаасан" done={Boolean(report?.hygiene_teeth)} />
            </div>
          </SectionCard>

          <SectionCard title="ӨНӨӨДӨР" className="mb-3">
            <div className="grid grid-cols-2 gap-2">
              {ACTIVITY_LABELS.map((a) => {
                const done = activities ? Boolean((activities as any)[a.key]) : false;
                return (
                  <div
                    key={a.key}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                      done
                        ? "border-emerald-300/50 bg-emerald-400/15 text-emerald-800"
                        : "border-white/50 bg-white/30 text-slate-400"
                    )}
                  >
                    <span>{done ? "✓" : "○"}</span>
                    <span>{a.icon} {a.label}</span>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {report?.extra_note && (
            <SectionCard title="📝 Багшийн тэмдэглэл" className="mb-3">
              <p className="text-sm leading-relaxed text-slate-600">{report.extra_note}</p>
            </SectionCard>
          )}
        </>
      )}
    </div>
  );
}

function SectionCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass rounded-3xl p-4", className)}>
      <p className="mb-2 text-sm font-semibold text-slate-700">{title}</p>
      {children}
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
    <div className={cn("glass glass-hover rounded-3xl p-4", className)}>
      <p className="mb-1 text-2xl">{icon}</p>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function MiniRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/50 bg-white/40 px-3 py-2">
      <p className="text-xs text-slate-500">{icon} {label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function HygieneRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border px-3 py-2",
        done ? "border-emerald-300/50 bg-emerald-400/15 text-emerald-800" : "border-white/50 bg-white/30 text-slate-400"
      )}
    >
      <span>{done ? "✓" : "○"}</span>
      <span>{label}</span>
    </div>
  );
}
