import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils";

export async function getAdminOverview(date: string = todayISO()) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: kinder, error: kinderError } = await supabase
    .from("kindergartens")
    .select("id, name")
    .eq("admin_id", user?.id)
    .single();

  if (!kinder) {
    return {
      kindergartenName: "",
      childCount: 0,
      teacherCount: 0,
      classCount: 0,
      todayComplete: 0,
      todayTotal: 0,
      perTeacher: [],
      debugError: `NO KINDER: user=${user?.id ?? "none"} | error=${kinderError?.message ?? "none"}`,
    };
  }

  const { count: childCount, error: childError } = await supabase
    .from("children")
    .select("id, classes!inner(kindergarten_id)", { count: "exact", head: true })
    .eq("classes.kindergarten_id", kinder.id)
    .eq("is_active", true);

  const { count: teacherCount, error: teacherError } = await supabase
    .from("teachers")
    .select("id", { count: "exact", head: true })
    .eq("kindergarten_id", kinder.id);

  const { count: classCount, error: classError } = await supabase
    .from("classes")
    .select("id", { count: "exact", head: true })
    .eq("kindergarten_id", kinder.id)
    .eq("is_active", true);

  const { data: classes, error: classesListError } = await supabase
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

  const debugParts = [
    childError && `childError=${childError.message}`,
    teacherError && `teacherError=${teacherError.message}`,
    classError && `classError=${classError.message}`,
    classesListError && `classesListError=${classesListError.message}`,
    `kinderId=${kinder.id}`,
    `rawClassCount=${classCount}`,
    `classesArrayLength=${classes?.length ?? "null"}`,
  ].filter(Boolean);

  return {
    kindergartenName: kinder.name,
    childCount: childCount ?? 0,
    teacherCount: teacherCount ?? 0,
    classCount: classCount ?? 0,
    todayComplete,
    todayTotal,
    perTeacher,
    debugError: debugParts.length > 0 ? debugParts.join(" | ") : null,
  };
}
