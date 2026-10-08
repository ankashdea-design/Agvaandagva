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
    nap: null,
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
    morning_tea: null,
    evening_tea: null,
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
          <button onClick={onClose} className="touch-target rounded-full
