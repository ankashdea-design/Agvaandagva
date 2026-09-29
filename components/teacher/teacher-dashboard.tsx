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
          morning_tea: null,
          evening_tea: null,
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
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/55 px-4 pb-3 pt-5 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
              {className || "Бэлтгэл бүлэг"}
            </h1>
            <p className="text-sm text-slate-500">
              {total} хүүхэд · {formatMongolianDate(date)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!online && (
              <span className="flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-800">
                <WifiOff size={13} /> Офлайн{pendingCount > 0 ? ` (${pendingCount})` : ""}
              </span>
            )}
            <div className="flex h-11 items-center gap-1.5 rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 px-3.5 text-white shadow-lg shadow-brand-600/25">
              <CheckCircle2 size={16} />
              <span className="text-sm font-bold">
                {completeCount} / {total}
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Хүүхдийн нэрээр хайх..."
            className="glass-btn w-full rounded-xl py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-brand-400"
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
          className="glass-btn press w-full touch-target rounded-2xl border-dashed py-3 text-sm font-semibold text-brand-700 hover:bg-white/70"
        >
          ⚡ Бүгдэд тэмдэглэх
        </button>
      </div>

      {/* Child list */}
      <ul className="space-y-2 px-4 pb-6 pt-3">
        {filtered.length === 0 && (
          <li className="glass-soft rounded-2xl py-10 text-center text-sm text-slate-400">
            Илэрц олдсонгүй.
          </li>
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
        <div className="glass-strong fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-900">
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
    neutral: "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-600/25",
    warning: "bg-gradient-to-b from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-500/25",
    danger: "bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25",
    success: "bg-gradient-to-b from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/25",
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "press shrink-0 touch-target rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
        active
          ? toneActive[tone] + " border-transparent"
          : "glass-btn text-slate-600"
      )}
    >
      {label}
    </button>
  );
}
