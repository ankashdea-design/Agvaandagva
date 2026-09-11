import { createClient } from "@/lib/supabase/server";
import { formatMongolianDate } from "@/lib/utils";

export default async function TeacherHistoryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assignment } = await supabase
    .from("teacher_classes")
    .select("class_id")
    .eq("teacher_id", user?.id)
    .maybeSingle();

  const { data: reports } = await supabase
    .from("daily_reports")
    .select("report_date, meal, mood")
    .eq("class_id", assignment?.class_id)
    .order("report_date", { ascending: false })
    .limit(200);

  const byDate = new Map<string, { total: number; complete: number }>();
  for (const r of reports ?? []) {
    const entry = byDate.get(r.report_date) ?? { total: 0, complete: 0 };
    entry.total += 1;
    if (r.meal && r.mood) entry.complete += 1;
    byDate.set(r.report_date, entry);
  }

  const days = Array.from(byDate.entries()).slice(0, 14);

  return (
    <div className="mx-auto max-w-md px-4 pt-5">
      <h1 className="mb-4 text-lg font-semibold text-brand-900">Түүх</h1>
      {days.length === 0 && (
        <p className="text-sm text-brand-400">Түүхэн мэдээлэл алга байна.</p>
      )}
      <ul className="space-y-2">
        {days.map(([date, stat]) => (
          <li
            key={date}
            className="flex items-center justify-between rounded-xl border border-brand-100 bg-white px-4 py-3 shadow-soft"
          >
            <span className="text-sm font-medium text-brand-800">{formatMongolianDate(date)}</span>
            <span className="text-sm text-brand-500">
              {stat.complete} / {stat.total} бүрэн
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
