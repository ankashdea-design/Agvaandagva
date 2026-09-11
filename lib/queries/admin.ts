import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils";

export async function getAdminOverview(date: string = todayISO()) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: kinder } = await supabase
    .from("kindergartens")
    .select("id, name")
    .eq("admin_id", user?.id)
    .single();

  if (!kinder) return null;

  const { count: childCount } = await supabase
    .from("children")
    .select("id, classes!inner(kindergarten_id)", { count: "exact", head: true })
    .eq("classes.kindergarten_id", kinder.id)
    .eq("is_active", true);

  const { count: teacherCount } = await supabase
    .from("teachers")
    .select("id", { count: "exact", head: true })
    .eq("kindergarten_id", kinder.id);

  const { count: classCount } = await supabase
    .from("classes")
    .select("id", { count: "exact", head: true })
    .eq("kindergarten_id", kinder.id)
    .eq("is_active", true);

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, teacher_classes(teacher_id, teachers(profiles(full_name)))")
    .eq("kindergarten_id", kinder.id)
    .eq("is_active", true);

  const perTeacher: { name: string; classId: string; complete: number; total: number }[] = [];

  for (const c of classes ?? []) {
    const { count: total } = await supabase
      .from("children")
      .select("id", { count: "exact", head: true })
      .eq("class_id", c.id)
      .eq("is_active", true);

    const { data: reports } = await supabase
      .from("daily_reports")
      .select("meal, mood")
      .eq("class_id", c.id)
      .eq("report_date", date);

    const complete = (reports ?? []).filter((r) => r.meal && r.mood).length;
    const teacherName =
      (c as any).teacher_classes?.[0]?.teachers?.profiles?.full_name ?? "Хуваарилагдаагүй";

    perTeacher.push({ name: teacherName, classId: c.id, complete, total: total ?? 0 });
  }

  const todayTotal = perTeacher.reduce((s, t) => s + t.total, 0);
  const todayComplete = perTeacher.reduce((s, t) => s + t.complete, 0);

  return {
    kindergartenName: kinder.name,
    childCount: childCount ?? 0,
    teacherCount: teacherCount ?? 0,
    classCount: classCount ?? 0,
    todayComplete,
    todayTotal,
    perTeacher,
  };
}
