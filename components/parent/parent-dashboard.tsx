"use client";

import { useState } from "react";
import Image from "next/image";
import type { ChildWithReport } from "@/types/database";
import { formatMongolianDate, cn } from "@/lib/utils";

const MOOD_LABEL: Record<string, { emoji: string; text: string }> = {
  happy: { emoji: "😊", text: "Сайхан" },
  neutral: { emoji: "😐", text: "Хэвийн" },
  sad: { emoji: "😢", text: "Уйтгартай" },
};
const MEAL_LABEL: Record<string, string> = { poor: "Идсэнгүй", medium: "Бага зэрэг идсэн", good: "Идсэн" };
const JUICE_LABEL: Record<string, string> = { drank: "Уусан", partial: "Бага зэрэг уусан", not_drank: "Уугаагүй" };
const MEAL_INTAKE_LABEL: Record<string, string> = { ate: "Идсэн", partial: "Бага зэрэг идсэн", not_ate: "Идээгүй" };

const ACTIVITY_LABELS: { key: string; label: string; icon: string; tile: string }[] = [
  { key: "drawing", label: "Зураг зурсан", icon: "🎨", tile: "bg-amber-50" },
  { key: "music", label: "Дуу дуулсан", icon: "🎵", tile: "bg-violet-50" },
  { key: "story", label: "Үлгэр сонссон", icon: "📖", tile: "bg-sky-50" },
  { key: "play", label: "Тоглолт наадсан", icon: "🧸", tile: "bg-rose-50" },
  { key: "physical", label: "Хөдөлгөөнт тоглолт", icon: "🏃", tile: "bg-emerald-50" },
  { key: "cognitive", label: "Гадаа тоглосон", icon: "🌳", tile: "bg-lime-50" },
];

/* ===== Тоглоом майгарай статус элементүүд ===== */

function ValuePill({ value }: { value: string }) {
  const negative = /Уугаагүй|Идээгүй|Идсэнгүй/.test(value);
  const partial = /^Бага зэрэг/.test(value);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-xs font-bold",
        negative ? "bg-rose-50 text-rose-600" : partial ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
      )}
    >
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-full text-[10px] text-white",
          negative ? "bg-rose-400" : partial ? "bg-amber-400" : "bg-emerald-500"
        )}
      >
        {negative ? "✕" : partial ? "~" : "✓"}
      </span>
      {value}
    </span>
  );
}

function Tile({ icon, bg = "bg-brand-50" }: { icon: string; bg?: string }) {
  return (
    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-2xl text-lg", bg)}>
      {icon}
    </span>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_10px_36px_rgba(65,81,216,0.08)]", className)}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, tile, title }: { icon: string; tile: string; title: string }) {
  return (
    <p className="mb-4 flex items-center gap-3 text-base font-extrabold text-slate-800">
      <Tile icon={icon} bg={tile} />
      {title}
    </p>
  );
}

function Row({ icon, tile, label, value }: { icon: string; tile?: string; label: string; value: string | null }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-50 bg-white px-3 py-2.5 shadow-[0_2px_10px_rgba(65,81,216,0.05)]">
      <Tile icon={icon} bg={tile} />
      <span className="flex-1 text-sm font-semibold text-slate-700">{label}</span>
      {value ? <ValuePill value={value} /> : <span className="text-xs text-slate-300">—</span>}
    </div>
  );
}

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

  const mood = report?.mood ? MOOD_LABEL[report.mood] : null;

  return (
    <div className="mx-auto max-w-md px-4 pt-5 sm:max-w-xl lg:max-w-2xl">
      {children.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "press shrink-0 touch-target rounded-full border px-4 py-2 text-sm font-medium",
                c.id === activeId
                  ? "border-transparent bg-brand-600 text-white shadow-lg shadow-brand-600/25"
                  : "border-slate-200 bg-white text-slate-600"
              )}
            >
              {c.full_name}
            </button>
          ))}
        </div>
      )}

      {/* Хүүхдийн профайл + өнөөдрийн байдал */}
      <Card className="mb-4">
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-sky-400 text-xl font-extrabold text-white shadow-lg shadow-brand-600/25">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900">{active.full_name}</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              {active.class_name ? `${active.class_name} · ` : ""}
              {formatMongolianDate(date)}
            </p>
          </div>
          {/* Чимэглэл: нэрний ард — цэцэгтэй ишлэл (десктоп) */}
          <Image
            src="/illustrations/3.png"
            alt=""
            width={80}
            height={80}
            className="pointer-events-none hidden w-20 shrink-0 select-none sm:block"
          />
        </div>

        {attendance && attendance.status !== "present" ? (
          <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {attendance.status === "absent" && "Өнөөдөр ирээгүй"}
            {attendance.status === "sick" && "🤒 Өнөөдөр өвчтэй"}
            {attendance.status === "excused" && "🏠 Өнөөдөр чөлөөтэй"}
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-sm font-bold text-slate-600">Өнөөдрийн байдал</p>
            {mood ? (
              <span className="inline-flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-xl">{mood.emoji}</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">{mood.text}</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400">Тэмдэглэгдээгүй</span>
            )}
          </div>
        )}
      </Card>

      {attendance && attendance.status !== "present" ? null : (
        <>
          {report?.highlight_note && (
            <Card className="mb-4 border-brand-100 bg-gradient-to-br from-brand-500 to-brand-600 text-white">
              <p className="mb-1 text-xs font-semibold tracking-wide opacity-80">⭐ Өнөөдрийн онцлох</p>
              <p className="text-sm leading-relaxed">{report.highlight_note}</p>
            </Card>
          )}

          {/* Хооллолт */}
          <Card className="mb-4">
            <SectionTitle icon="🍽️" tile="bg-emerald-50" title="Хооллолт" />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Row icon="🧃" tile="bg-orange-50" label="Өдрийн жүүс" value={report?.juice ? JUICE_LABEL[report.juice] : null} />
              <Row icon="☕" tile="bg-amber-50" label="Өглөөний цай" value={report?.morning_tea ? JUICE_LABEL[report.morning_tea] : null} />
              <Row icon="🍲" tile="bg-rose-50" label="1-р хоол" value={report?.meal1 ? MEAL_INTAKE_LABEL[report.meal1] : null} />
              <Row icon="🍛" tile="bg-yellow-50" label="2-р хоол" value={report?.meal2 ? MEAL_INTAKE_LABEL[report.meal2] : null} />
              <Row icon="🍵" tile="bg-teal-50" label="Оройн цай" value={report?.evening_tea ? JUICE_LABEL[report.evening_tea] : null} />
            </div>
            {report?.meal && (
              <p className="mt-3 text-right text-xs font-semibold text-slate-400">
                Ерөнхий байдал: {MEAL_LABEL[report.meal]}
              </p>
            )}
          </Card>

          {/* Өдрийн хэрэгцээ */}
          <Card className="mb-4">
            <SectionTitle icon="🚽" tile="bg-sky-50" title="Өдрийн хэрэгцээ" />
            <div className="grid grid-cols-1 gap-2">
              <Row icon="🧼" tile="bg-sky-50" label="Гар угаасан" value={report?.hygiene_hands ? "Тийм" : null} />
              <Row icon="🧻" tile="bg-violet-50" label="Хүндээр бие зассан" value={report?.hygiene_toilet ? "Тийм" : null} />
              <Row icon="🦷" tile="bg-emerald-50" label="Шүд угаасан" value={report?.hygiene_teeth ? "Тийм" : null} />
            </div>
          </Card>

          {/* Нойр */}
          {(report?.nap_start || report?.nap_end) && (
            <Card className="mb-4">
              <SectionTitle icon="😴" tile="bg-indigo-50" title="Өдрийн нойр" />
              <p className="rounded-2xl bg-indigo-50 px-4 py-3 text-center text-lg font-extrabold text-indigo-700">
                {report?.nap_start ?? "?"} – {report?.nap_end ?? "?"}
              </p>
            </Card>
          )}

          {/* Өнөөдөр юу хийсэн бэ? */}
          <Card className="mb-4">
            <SectionTitle icon="🌈" tile="bg-amber-50" title="Өнөөдөр юу хийсэн бэ?" />
            <div className="flex items-center gap-4">
              <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                {ACTIVITY_LABELS.map((a) => {
                  const done = activities ? Boolean((activities as any)[a.key]) : false;
                  return (
                    <div
                      key={a.key}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border px-3 py-2.5",
                        done ? "border-slate-50 bg-white shadow-[0_2px_10px_rgba(65,81,216,0.05)]" : "border-dashed border-slate-100 bg-slate-50/50"
                      )}
                    >
                      <Tile icon={a.icon} bg={done ? a.tile : "bg-slate-100"} />
                      <span className={cn("flex-1 text-sm font-semibold", done ? "text-slate-700" : "text-slate-300")}>{a.label}</span>
                      <span
                        className={cn(
                          "flex size-6 items-center justify-center rounded-full text-xs text-white",
                          done ? "bg-emerald-500" : "bg-slate-200"
                        )}
                      >
                        {done ? "✓" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Чимэглэл: хүүхэд тоглож буй (десктоп) */}
              <Image
                src="/illustrations/2.png"
                alt=""
                width={150}
                height={180}
                className="pointer-events-none hidden lg:block"
              />
            </div>
          </Card>

          {/* Багшийн тэмдэглэл */}
          {report?.extra_note && (
            <Card className="mb-4">
              <SectionTitle icon="💬" tile="bg-violet-50" title="Багшийн тэмдэглэл" />
              <div className="rounded-2xl rounded-tl-md bg-violet-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
                {report.extra_note}
              </div>
              <div className="mt-2 flex items-center justify-end gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">Б</span>
                <span className="text-xs font-semibold text-slate-400">Багш</span>
              </div>
            </Card>
          )}

          {/* Нууцлал */}
          <p className="mb-6 flex items-start gap-2 rounded-2xl bg-white/70 px-4 py-3 text-xs leading-relaxed text-slate-400">
            🔒 Энэ мэдээлэл нь танай хүүхдийн хувийн мэдээлэл тул зөвхөн эцэг эхэд зориулагдсан болно.
          </p>
        </>
      )}
    </div>
  );
}
