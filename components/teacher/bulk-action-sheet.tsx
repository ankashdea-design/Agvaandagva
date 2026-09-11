"use client";

import { X } from "lucide-react";
import type { bulkApplyToClass } from "@/app/teacher/actions";

type Kind = Parameters<typeof bulkApplyToClass>[0]["kind"];

const ACTIONS: { label: string; icon: string; kind: Kind }[] = [
  { label: "Бүгд хоол сайн", icon: "🍚", kind: { type: "meal", value: "good" } },
  { label: "Бүгд унтсан", icon: "😴", kind: { type: "hygiene", key: "hygiene_hands", value: true } },
  { label: "Бүгд зураг зурсан", icon: "🎨", kind: { type: "activity", key: "drawing", value: true } },
  { label: "Бүгд дуу хөгжим", icon: "🎵", kind: { type: "activity", key: "music", value: true } },
  { label: "Бүгд үлгэр сонссон", icon: "📖", kind: { type: "activity", key: "story", value: true } },
  { label: "Бүгд тоглосон", icon: "🧸", kind: { type: "activity", key: "play", value: true } },
  { label: "Бүгд гар угаасан", icon: "🧼", kind: { type: "hygiene", key: "hygiene_hands", value: true } },
];

export function BulkActionSheet({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: (kind: Kind, label: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30" onClick={onClose}>
      <div
        className="w-full rounded-t-3xl bg-white p-4 pb-8 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-brand-900">Бүгдэд тэмдэглэх</h2>
          <button onClick={onClose} className="touch-target rounded-full p-1 text-brand-400">
            <X size={20} />
          </button>
        </div>
        <p className="mb-3 text-xs text-brand-500">
          Эхлээд бүгдэд ерөнхийгөөр тэмдэглээд, дараа нь зөвхөн ялгаатай хүүхдийг тус тусад нь засаарай.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => onApply(a.kind, a.label)}
              className="flex touch-target flex-col items-center justify-center gap-1 rounded-2xl border border-brand-200 bg-brand-50 py-4 text-center active:bg-brand-100"
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-medium text-brand-800">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
