import { createClient } from "@/lib/supabase/server";
import { formatMongolianDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export default async function AdminReportsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: kinder } = await supabase
    .from("kindergartens")
    .select("id")
    .eq("admin_id", user?.id)
    .single();

  const { data: classes } = await supabase
    .from("classes")
    .select("id")
    .eq("kindergarten_id", kinder?.id);
  const classIds = (classes ?? []).map((c) => c.id);

  const { data: reports } = await supabase
    .from("daily_reports")
    .select("report_date, meal, mood")
    .in("class_id", classIds.length ? classIds : ["00000000-0000-0000-0000-000000000000"])
    .order("report_date", { ascending: false })
    .limit(500);

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
      <h1 className="mb-4 text-lg font-semibold text-brand-900">Тайлан</h1>
      <Card>
        <p className="mb-3 text-sm font-semibold text-brand-800">Өдөр тутмын бөглөлт</p>
        <ul className="space-y-2">
          {days.map(([date, stat]) => {
            const pct = stat.total > 0 ? Math.round((stat.complete / stat.total) * 100) : 0;
            return (
              <li key={date} className="flex items-center justify-between text-sm">
                <span className="text-brand-600">{formatMongolianDate(date)}</span>
                <span className="font-medium text-brand-900">
                  {stat.complete}/{stat.total} ({pct}%)
                </span>
              </li>
            );
          })}
          {days.length === 0 && <p className="text-sm text-brand-400">Мэдээлэл алга байна.</p>}
        </ul>
      </Card>
    </div>
  );
}
