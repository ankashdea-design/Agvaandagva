import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils";
import type { ChildWithReport } from "@/types/database";

/**
 * Loads every child linked to the signed-in parent (parent_children),
 * each joined with today's report. RLS's is_parent_of_child() means this
 * can never return a child that isn't actually linked to this parent —
 * even a hand-edited child_id in a request would be rejected by Postgres.
 */
export async function getParentChildren(date: string = todayISO()) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: links } = await supabase
    .from("parent_children")
    .select("child_id")
    .eq("parent_id", user.id);

  const childIds = (links ?? []).map((l: { child_id: string }) => l.child_id);
  if (childIds.length === 0) return [];

  const { data: children } = await supabase
    .from("children")
    .select(
      `id, class_id, full_name, birth_date, avatar_url, is_active,
       classes(name),
       daily_reports!left(*),
       attendance!left(*)`
    )
    .in("id", childIds)
    .eq("daily_reports.report_date", date)
    .eq("attendance.report_date", date);

  const reportIds = (children ?? [])
    .flatMap((c: any) => c.daily_reports ?? [])
    .map((r: any) => r.id);

  const { data: activities } =
    reportIds.length > 0
      ? await supabase.from("daily_activities").select("*").in("daily_report_id", reportIds)
      : { data: [] };

  return (children ?? []).map((c: any) => {
    const report = Array.isArray(c.daily_reports) ? c.daily_reports[0] ?? null : null;
    const attendance = Array.isArray(c.attendance) ? c.attendance[0] ?? null : null;
    const activity = report
      ? (activities ?? []).find((a: any) => a.daily_report_id === report.id) ?? null
      : null;
    return {
      id: c.id,
      class_id: c.class_id,
      full_name: c.full_name,
      birth_date: c.birth_date,
      avatar_url: c.avatar_url,
      is_active: c.is_active,
      class_name: c.classes?.name ?? "",
      daily_report: report,
      daily_activities: activity,
      attendance,
    } as ChildWithReport & { class_name: string };
  });
}
