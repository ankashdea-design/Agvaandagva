"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, CheckCircle2, Wifi, WifiOff } from "lucide-react";
import type { ChildWithReport, MealStatus, MoodStatus } from "@/types/database";
import { formatMongolianDate, cn } from "@/lib/utils";
import { bulkApplyToClass, updateAttendance } from "@/app/teacher/actions";
import { ChildRow } from "./child-row";
import { ChildDetailSheet } from "./child-detail-sheet";
import { BulkActionSheet } from "./bulk-action-sheet";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useOfflineQueue } from "@/hooks/use-offline-queue";

type Filter = "all" | "missing" | "absent" | "complete";

export function isComplete(c: ChildWithReport) {
  return Boolean(c.daily_report?.meal && c.daily_report?.mood);
}

export function TeacherDashboard({
  classId,
  className,
  date,
  initialChildren,
}: {
  classId: string;
  className: string;
  date: string;
  initialChildren: ChildWithReport[];
}) {
  const [children, setChildren] = useState(initialChildren);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [bulkSheetOpen, setBulkSheetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const online = useOnlineStatus();
  const { enqueue, pendingCount } = useOfflineQueue();

  const total = children.length;
  const completeCount = children.filter(isComplete).length;
  const missingCount = total - completeCount;
  const absentCount = children.filter((c) => c.attendance && c.attendance.status !== "present").length;

  const filtered = useMemo(() => {
    let list = children;
    if (filter === "missing") list = list.filter((c) => !isComplete(c));
    if (filter === "absent") list = list.filter((c) => c.attendance?.status !== "present");
    if (filter === "complete") list = list.filter(isComplete);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((c) => c.full_name.toLowerCase().includes(q));
    }
    return list;
  }, [children, filter, query]);

  function patchChild(childId: string, patch: Partial<ChildWithReport>) {
    setChildren((prev) => prev.map((c) => (c.id === childId ? { ...c, ...patch } : c)));
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function handleBulk(kind: Parameters<typeof bulkApplyToClass>[0]["kind"], label: string) {
    const childIds = children.map((c) => c.id);

    // Optimistic local update
    setChildren((prev) =>
      prev.map((c) => {
              const report = c.daily_report ?? {
          id: `temp-${c.id}`,
          child_id: c.id,
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
        if (kind.type === "meal") return { ...c, daily_report: { ...report, meal: kind.value } };
        if (kind.type === "mood") return { ...c, daily_report: { ...report, mood: kind.value } };
        if (kind.type === "hygiene")
          return { ...c, daily_report: { ...report, [kind.key]: kind.value } };
        if (kind.type === "activity") {
          const activities = c.daily_activities ?? {
            id: `temp-act-${c.id}`,
            daily_report_id: report.id,
            drawing: false,
            music: false,
            story: false,
            play: false,
            physical: false,
            cognitive: false,
          };
          return { ...c, daily_report: report, daily_activities: { ...activities, [kind.key]: kind.value } };
        }
        return c;
      })
    );
    setBulkSheetOpen(false);

    if (!online) {
      enqueue({ type: "bulk", classId, date, childIds, kind });
      showToast(`Офлайн — ${label} дараа sync хийгдэнэ.`);
      return;
    }

    startTransition(async () => {
      try {
        await bulkApplyToClass({ classId, date, childIds, kind });
        showToast(`${childIds.length} хүүхдэд шинэчлэгдлээ.`);
      } catch {
        showToast("Алдаа гарлаа. Дахин оролдоно уу.");
      }
    });
  }

  async function handleAttendance(childId: string, status: "present" | "absent" | "sick" | "excused") {
    patchChild(childId, {
      attendance: {
        id: `temp-att-${childId}`,
        child_id: childId,
        report_date: date,
        status,
        marked_by: null,
      },
    });

    if (!online) {
      enqueue({ type: "attendance", childId, date, status });
      showToast("Офлайн — дараа sync хийгдэнэ.");
      return;
    }

    startTransition(async () => {
      try {
        await updateAttendance({ childId, date, status });
      } catch {
        showToast("Ирц шинэчлэхэд алдаа гарлаа.");
      }
    });
  }

  const activeChild = children.find((c) => c.id === activeChildId) ?? null;

  return (
    <div className="mx-auto max-w-md">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-brand-100 bg-warm-50/95 px-4 pb-3 pt-5 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-brand-900">{className || "Бэлтгэл бүлэг"}</h1>
            <p className="text-sm text-brand-500">{total} хүүхэд · {formatMongolianDate(date)}</p>
          </div>
          <div className="flex items-center gap-2">
            {!online && (
              <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700">
                <WifiOff size={13} /> Офлайн{pendingCount > 0 ? ` (${pendingCount})` : ""}
              </span>
            )}
            <div className="flex h-11 items-center gap-1 rounded-xl bg-brand-600 px-3 text-white shadow-soft">
              <CheckCircle2 size={16} />
              <span className="text-sm font-semibold">
                {completeCount} / {total}
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Хүүхдийн нэрээр хайх..."
            className="w-full rounded-xl border border-brand-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={`Бүгд — ${total}`} />
          <FilterChip
            active={filter === "missing"}
            onClick={() => setFilter("missing")}
            label={`Дутуу — ${missingCount}`}
            tone="warning"
          />
          <FilterChip
            active={filter === "absent"}
            onClick={() => setFilter("absent")}
            label={`Ирээгүй — ${absentCount}`}
            tone="danger"
          />
          <FilterChip
            active={filter === "complete"}
            onClick={() => setFilter("complete")}
            label={`Бүрэн — ${completeCount}`}
            tone="success"
          />
        </div>
      </header>

      {/* Bulk action trigger */}
      <div className="px-4 pt-3">
        <button
          onClick={() => setBulkSheetOpen(true)}
          className="w-full touch-target rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 py-3 text-sm font-semibold text-brand-700 active:bg-brand-100"
        >
          ⚡ Бүгдэд тэмдэглэх
        </button>
      </div>

      {/* Child list */}
      <ul className="divide-y divide-brand-100 px-4 pb-6 pt-2">
        {filtered.length === 0 && (
          <li className="py-10 text-center text-sm text-brand-400">Илэрц олдсонгүй.</li>
        )}
        {filtered.map((child) => (
          <ChildRow
            key={child.id}
            child={child}
            onOpen={() => setActiveChildId(child.id)}
            onAttendance={(status) => handleAttendance(child.id, status)}
          />
        ))}
      </ul>

      {activeChild && (
        <ChildDetailSheet
          child={activeChild}
          classId={classId}
          date={date}
          online={online}
          onClose={() => setActiveChildId(null)}
          onPatch={(patch) => patchChild(activeChild.id, patch)}
          onQueue={enqueue}
        />
      )}

      {bulkSheetOpen && (
        <BulkActionSheet onClose={() => setBulkSheetOpen(false)} onApply={handleBulk} />
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm text-white shadow-card">
          {toast}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  tone = "neutral",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tone?: "neutral" | "warning" | "danger" | "success";
}) {
  const toneActive: Record<string, string> = {
    neutral: "bg-brand-700 text-white",
    warning: "bg-amber-600 text-white",
    danger: "bg-red-500 text-white",
    success: "bg-emerald-600 text-white",
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 touch-target rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active ? toneActive[tone] + " border-transparent" : "border-brand-200 bg-white text-brand-600"
      )}
    >
      {label}
    </button>
  );
}
