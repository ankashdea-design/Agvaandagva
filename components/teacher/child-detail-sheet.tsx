"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import type {
  ChildWithReport,
  MealStatus,
  MoodStatus,
  DailyReport,
  DailyActivities,
  JuiceStatus,
  MealIntakeStatus,
  BowelStatus,
} from "@/types/database";
import { updateReportField, updateActivity } from "@/app/teacher/actions";
import { cn } from "@/lib/utils";

const MOODS: { value: MoodStatus; emoji: string; label: string }[] = [
  { value: "sad", emoji: "😢", label: "Уйтгартай" },
  { value: "neutral", emoji: "😐", label: "Хэвийн" },
  { value: "happy", emoji: "😊", label: "Сайхан" },
];
const MEALS: { value: MealStatus; label: string }[] = [
  { value: "poor", label: "Муу" },
  { value: "medium", label: "Дунд" },
  { value: "good", label: "Сайн" },
];
const JUICE_OPTIONS: { value: JuiceStatus; label: string }[] = [
  { value: "drank", label: "Уусан" },
  { value: "partial", label: "Бага зэрэг уусан" },
  { value: "not_drank", label: "Уугаагүй" },
];
const MEAL_INTAKE_OPTIONS: { value: MealIntakeStatus; label: string }[] = [
  { value: "ate", label: "Идсэн" },
  { value: "partial", label: "Бага зэрэг идсэн" },
  { value: "not_ate", label: "Идээгүй" },
];
const BOWEL_OPTIONS: { value: BowelStatus; label: string }[] = [
  { value: "good", label: "Сайн" },
  { value: "medium", label: "Дунд" },
  { value: "none", label: "Бие засаагүй" },
];
const ACTIVITIES: { key: keyof DailyActivities; label: string; icon: string }[] = [
  { key: "drawing", label: "Зураг", icon: "🎨" },
  { key: "music", label: "Дуу хөгжим", icon: "🎵" },
  { key: "story", label: "Үлгэр", icon: "📖" },
  { key: "play", label: "Тоглоом", icon: "🧸" },
  { key: "physical", label: "Биеийн хөдөлгөөн", icon: "🏃" },
  { key: "cognitive", label: "Танин мэдэхүй", icon: "🧠" },
];
const HYGIENE: { key: "hygiene_hands" | "hygiene_toilet" | "hygiene_teeth"; label: string }[] = [
  { key: "hygiene_hands", label: "Гар угаасан" },
  { key: "hygiene_toilet", label: "Бие зассан" },
  { key: "hygiene_teeth", label: "Шүд угаасан" },
];

export function ChildDetailSheet({
  child,
  classId,
  date,
  online,
  onClose,
  onPatch,
  onQueue,
}: {
  child: ChildWithReport;
  classId: string;
  date: string;
  online: boolean;
  onClose: () => void;
  onPatch: (patch: Partial<ChildWithReport>) => void;
  onQueue: (job: any) => void;
}) {
  const [saving, setSaving] = useState<string | null>(null);
  const [note, setNote] = useState(child.daily_report?.highlight_note ?? "");
  const [, startTransition] = useTransition();

    const blankReport: DailyReport = {
    id: `temp-${child.id}`,
    child_id: child.id,
    class_id: classId,
    report_date: date,
    mood: null,
    meal: null,
    nap_start: null,
    nap_end: null,
    hygiene_hands: false,
    hygiene_toilet: false,
    hygiene_teeth: false,
    highlight_note: null,
    extra_note: null,
    is_complete: false,
    updated_at: new Date().toISOString(),
    updated_by: null,
    juice: null,
    meal1: null,
    meal2: null,
    bowel: null,
  };
  const report = child.daily_report ?? blankReport;
  const activities = child.daily_activities ?? {
    id: `temp-act-${child.id}`,
    daily_report_id: report.id,
    drawing: false,
    music: false,
    story: false,
    play: false,
    physical: false,
    cognitive: false,
  };

  function saveField(field: Parameters<typeof updateReportField>[0]["field"], value: any, key: string) {
    onPatch({ daily_report: { ...report, [field]: value } });
    setSaving(key);
    const job = { childId: child.id, classId, date, field, value };
    if (!online) {
      onQueue({ type: "field", ...job });
      setSaving(null);
      return;
    }
    startTransition(async () => {
      try {
        await updateReportField(job);
      } finally {
        setSaving(null);
      }
    });
  }

  function saveActivity(key: keyof DailyActivities, value: boolean) {
    onPatch({ daily_activities: { ...activities, [key]: value } });
    const job = { childId: child.id, classId, date, key, value };
    if (!online) {
      onQueue({ type: "activity", ...job });
      return;
    }
    startTransition(async () => {
      await updateActivity(job as any);
    });
  }

  function saveNote(value: string) {
    setNote(value);
    saveField("highlight_note", value, "note");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-white p-4 pb-10 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-brand-900">{child.full_name}</h2>
            <p className="text-xs text-brand-500">Өнөөдрийн байдал</p>
          </div>
          <button onClick={onClose} className="touch-target rounded-full p-1 text-brand-400">
            <X size={22} />
          </button>
        </div>

        <Section title="😊 Сэтгэл санаа">
          <div className="grid grid-cols-3 gap-2">
            {MOODS.map((m) => (
              <PillButton
                key={m.value}
                active={report.mood === m.value}
                onClick={() => saveField("mood", m.value, "mood")}
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="text-xs">{m.label}</span>
              </PillButton>
            ))}
          </div>
        </Section>

        <Section title="🍚 Хоол">
          <div className="grid grid-cols-3 gap-2">
            {MEALS.map((m) => (
              <PillButton key={m.value} active={report.meal === m.value} onClick={() => saveField("meal", m.value, "meal")}>
                <span className="text-xs">{m.label}</span>
              </PillButton>
            ))}
          </div>
        </Section>

        <Section title="🥤 Өдрийн жүүс">
          <div className="grid grid-cols-3 gap-2">
            {JUICE_OPTIONS.map((o) => (
              <PillButton key={o.value} active={report.juice === o.value} onClick={() => saveField("juice", o.value, "juice")}>
                <span className="text-xs">{o.label}</span>
              </PillButton>
            ))}
          </div>
        </Section>

        <Section title="🍲 1-р хоол">
          <div className="grid grid-cols-3 gap-2">
            {MEAL_INTAKE_OPTIONS.map((o) => (
              <PillButton key={o.value} active={report.meal1 === o.value} onClick={() => saveField("meal1", o.value, "meal1")}>
                <span className="text-xs">{o.label}</span>
              </PillButton>
            ))}
          </div>
        </Section>

        <Section title="🍲 2-р хоол">
          <div className="grid grid-cols-3 gap-2">
            {MEAL_INTAKE_OPTIONS.map((o) => (
              <PillButton key={o.value} active={report.meal2 === o.value} onClick={() => saveField("meal2", o.value, "meal2")}>
                <span className="text-xs">{o.label}</span>
              </PillButton>
            ))}
          </div>
        </Section>

        <Section title="🚽 Хүндээр бие зассан">
          <div className="grid grid-cols-3 gap-2">
            {BOWEL_OPTIONS.map((o) => (
              <PillButton key={o.value} active={report.bowel === o.value} onClick={() => saveField("bowel", o.value, "bowel")}>
                <span className="text-xs">{o.label}</span>
              </PillButton>
            ))}
          </div>
        </Section>

        <Section title="🎨 Үйл ажиллагаа">
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITIES.map((a) => (
              <label
                key={a.key}
                className={cn(
                  "flex touch-target items-center gap-2 rounded-xl border px-3 py-2.5 text-sm",
                  activities[a.key] ? "border-brand-500 bg-brand-50 text-brand-800" : "border-brand-200 text-brand-600"
                )}
              >
                <input
                  type="checkbox"
                  checked={Boolean(activities[a.key])}
                  onChange={(e) => saveActivity(a.key, e.target.checked)}
                  className="h-4 w-4 accent-brand-600"
                />
                <span>{a.icon} {a.label}</span>
              </label>
            ))}
          </div>
        </Section>

        <Section title="🧼 Ариун цэвэр">
          <div className="grid grid-cols-1 gap-2">
            {HYGIENE.map((h) => (
              <label
                key={h.key}
                className={cn(
                  "flex touch-target items-center gap-2 rounded-xl border px-3 py-2.5 text-sm",
                  report[h.key] ? "border-brand-500 bg-brand-50 text-brand-800" : "border-brand-200 text-brand-600"
                )}
              >
                <input
                  type="checkbox"
                  checked={Boolean(report[h.key])}
                  onChange={(e) => saveField(h.key, e.target.checked, h.key)}
                  className="h-4 w-4 accent-brand-600"
                />
                <span>{h.label}</span>
              </label>
            ))}
          </div>
        </Section>

        <Section title="📝 Нэмэлт тэмдэглэл">
          <textarea
            value={note}
            onChange={(e) => saveNote(e.target.value)}
            rows={3}
            placeholder="Өнөөдрийн онцлох зүйл..."
            className="w-full rounded-xl border border-brand-200 p-3 text-sm outline-none focus:border-brand-500"
          />
        </Section>

        <p className="text-center text-xs text-brand-300">
          {saving ? "Хадгалж байна..." : "Бүх өөрчлөлт автоматаар хадгалагдана"}
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="mb-2 text-sm font-semibold text-brand-700">{title}</h3>
      {children}
    </div>
  );
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex touch-target flex-col items-center justify-center gap-1 rounded-xl border py-3",
        active ? "border-brand-600 bg-brand-600 text-white" : "border-brand-200 text-brand-700"
      )}
    >
      {children}
    </button>
  );
}
