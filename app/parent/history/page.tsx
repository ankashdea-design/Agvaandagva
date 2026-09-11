import { createClient } from "@/lib/supabase/server";
import { formatMongolianDate } from "@/lib/utils";

export default async function ParentHistoryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: links } = await supabase
    .from("parent_children")
    .select("child_id, children(full_name)")
    .eq("parent_id", user?.id);

  const childIds = (links ?? []).map((l: any) => l.child_id);

  const { data: reports } = await supabase
    .from("daily_reports")
    .select("report_date, mood, meal, highlight_note, child_id")
    .in("child_id", childIds.length ? childIds : ["00000000-0000-0000-0000-000000000000"])
    .order("report_date", { ascending: false })
    .limit(30);

  return (
    <div className="mx-auto max-w-md px-4 pt-5">
      <h1 className="mb-4 text-lg font-semibold text-brand-900">Түүх</h1>
      {(!reports || reports.length === 0) && (
        <p className="text-sm text-brand-400">Өмнөх мэдээлэл алга байна.</p>
      )}
      <ul className="space-y-2">
        {(reports ?? []).map((r) => (
          <li
            key={`${r.child_id}-${r.report_date}`}
            className="rounded-xl border border-brand-100 bg-white px-4 py-3 shadow-soft"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-brand-800">
                {formatMongolianDate(r.report_date)}
              </span>
              <span className="text-xs text-brand-400">
                {r.mood ?? "—"} · {r.meal ?? "—"}
              </span>
            </div>
            {r.highlight_note && <p className="text-xs text-brand-500">{r.highlight_note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
