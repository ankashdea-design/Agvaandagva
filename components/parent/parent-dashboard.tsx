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

/** Утгын дагуу пиллин өнгө — зөвхөн харагдацад ашиглана */
function toneForValue(value: string): "green" | "amber" | "rose" | "neutral" {
  if (value === "—") return "neutral";
  if (/Уугаагүй|Идээгүй|Идсэнгүй/.test(value)) return "rose";
  if (/^Бага зэрэг/.test(value) || value === "Дунд зэрэг идсэн") return "amber";
  if (/Идсэн|Уусан|Сайн идсэн/.test(value)) return "green";
  return "neutral";
}

const VALUE_TONES = {
  green: "bg-emerald-400/15 text-emerald-800 border-emerald-300/50",
  amber: "bg-amber-400/15 text-amber-800 border-amber-300/50",
  rose: "bg-rose-400/15 text-rose-700 border-rose-300/50",
  neutral: "bg-white/40 text-slate-400 border-white/60",
} as const;

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

  const initials =
    active.full_name
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2) ?? "?";

  return (
    <div className="mx-auto max-w-md px-4 pt-5">
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

      {/* Толгой — аватар + нэр + огноо */}
      <div className="glass-strong mb-5 flex items-center gap-4 rounded-3xl p-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-sky-400 text-lg font-extrabold text-white shadow-lg shadow-brand-600/25">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-extrabold tracking-tight text-slate-900">
            {active.full_name}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {active.class_name ? `${active.class_name} · ` : ""}
            {formatMongolianDate(date)}
          </p>
        </div>
        {attendance?.status === "present" && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-400/15 px-2.5 py-1 text-xs font-bold text-emerald-800">
            ✓ Ирсэн
          </span>
        )}
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
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide opacity-85">
                <span className="flex size-5 items-center justify-center rounded-full bg-white/25">⭐</span>
                Өнөөдрийн онцлох
              </p>
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

          <SectionCard title="Хоол, цайны дэлгэрэнгүй" emoji="🍽️" className="mb-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <MiniRow icon="☕" label="Өглөөний цай" value={report?.morning_tea ? JUICE_LABEL[report.morning_tea] : "—"} />
              <MiniRow icon="🥤" label="Өдрийн жүүс" value={report?.juice ? JUICE_LABEL[report.juice] : "—"} />
              <MiniRow icon="🍲" label="1-р хоол" value={report?.meal1 ? MEAL_INTAKE_LABEL[report.meal1] : "—"} />
              <MiniRow icon="🍲" label="2-р хоол" value={report?.meal2 ? MEAL_INTAKE_LABEL[report.meal2] : "—"} />
              <MiniRow icon="🍵" label="Оройн цай" value={report?.evening_tea ? JUICE_LABEL[report.evening_tea] : "—"} />
            </div>
          </SectionCard>

          <SectionCard title="Ариун цэвэр" emoji="🧼" className="mb-3">
            <div className="grid grid-cols-1 gap-2">
              <HygieneRow label="Гар угаасан" done={Boolean(report?.hygiene_hands)} />
              <HygieneRow label="Хүндээр бие зассан" done={Boolean(report?.hygiene_toilet)} />
              <HygieneRow label="Шүд угаасан" done={Boolean(report?.hygiene_teeth)} />
            </div>
          </SectionCard>

          <SectionCard title="Өнөөдөр" emoji="✨" className="mb-3">
            <div className="grid grid-cols-2 gap-2">
              {ACTIVITY_LABELS.map((a) => {
                const done = activities ? Boolean((activities as any)[a.key]) : false;
                return (
                  <div
                    key={a.key}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm",
                      done
                        ? "border-emerald-300/50 bg-emerald-400/15 font-medium text-emerald-800"
                        : "border-white/50 bg-white/30 text-slate-400"
                    )}
                  >
                    <span className="text-base">{a.icon}</span>
                    <span className="truncate">{a.label}</span>
                    <span className="ml-auto">{done ? "✓" : "○"}</span>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {report?.extra_note && (
            <SectionCard title="Багшийн тэмдэглэл" emoji="📝" className="mb-3">
              <p className="rounded-2xl border border-white/50 bg-white/40 px-4 py-3 text-sm leading-relaxed text-slate-700">
                {report.extra_note}
              </p>
            </SectionCard>
          )}
        </>
      )}
    </div>
  );
}

function SectionCard({
  title,
  emoji,
  children,
  className,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass rounded-3xl p-4", className)}>
      <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
        <span className="flex size-7 items-center justify-center rounded-xl bg-brand-500/12 text-sm">
          {emoji}
        </span>
        {title}
      </p>
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
      <span className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-brand-500/12 text-2xl">
        {icon}
      </span>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-base font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function MiniRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const tone = toneForValue(value);
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/50 bg-white/40 px-3 py-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/70 text-sm shadow-sm">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
      <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold", VALUE_TONES[tone])}>
        {tone === "green" ? "✓" : tone === "rose" ? "✕" : tone === "amber" ? "~" : "—"}
      </span>
    </div>
  );
}

function HygieneRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-3.5 py-2.5",
        done
          ? "border-emerald-300/50 bg-emerald-400/15 font-medium text-emerald-800"
          : "border-white/50 bg-white/30 text-slate-400"
      )}
    >
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-full text-xs font-bold",
          done ? "bg-emerald-400/30 text-emerald-800" : "bg-white/60 text-slate-400"
        )}
      >
        {done ? "✓" : "○"}
      </span>
      <span>{label}</span>
    </div>
  );
}
