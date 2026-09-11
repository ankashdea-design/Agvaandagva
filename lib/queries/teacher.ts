import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils";
import type { ChildWithReport } from "@/types/database";

/**
 * Loads the signed-in teacher's assigned class, plus every active child in
 * it joined with today's daily_report / daily_activities / attendance.
 * RLS guarantees this only ever returns the teacher's own class — even if
 * class_id here were tampered with client-side, Postgres would reject it.
 */
export async function getTeacherClassData(date: string = todayISO()) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: assignment } = await supabase
    .from("teacher_classes")
    .select("class_id, classes(id, name, age_group)")
    .eq("teacher_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!assignment) return null;

  const classId = assignment.class_id as string;
  const klass = assignment.classes as unknown as { id: string; name: string; age_group: string };

  const { data: children } = await supabase
    .from("children")
    .select(
      `id, class_id, full_name, birth_date, avatar_url, is_active,
       daily_reports!left(*),
       attendance!left(*)`
    )
    .eq("class_id", classId)
    .eq("is_active", true)
    .eq("daily_reports.report_date", date)
    .eq("attendance.report_date", date)
    .order("full_name");

  const childIds = (children ?? []).map((c: { id: string }) => c.id);
  const reportIds = (children ?? [])
    .flatMap((c: any) => c.daily_reports ?? [])
    .map((r: any) => r.id);

  const { data: activities } =
    reportIds.length > 0
      ? await supabase.from("daily_activities").select("*").in("daily_report_id", reportIds)
      : { data: [] };

  const merged: ChildWithReport[] = (children ?? []).map((c: any) => {
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
      daily_report: report,
      daily_activities: activity,
      attendance,
    };
  });

  return { classId, className: klass?.name ?? "", ageGroup: klass?.age_group ?? "", children: merged, childIds, date };
}
