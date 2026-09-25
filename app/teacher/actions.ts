"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MealStatus, MoodStatus, AttendanceStatus, JuiceStatus, MealIntakeStatus, BowelStatus } from "@/types/database";

type ActivityKey = "drawing" | "music" | "story" | "play" | "physical" | "cognitive";

async function ensureReportId(childId: string, classId: string, date: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("daily_reports")
    .upsert(
      { child_id: childId, class_id: classId, report_date: date, updated_by: user?.id },
      { onConflict: "child_id,report_date", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

/** Inline single-field update (meal, mood, hygiene, notes) — autosave, no Save button. */
export async function updateReportField(input: {
  childId: string;
  classId: string;
  date: string;
  field:
    | "meal"
    | "mood"
    | "hygiene_hands"
    | "hygiene_toilet"
    | "hygiene_teeth"
    | "highlight_note"
    | "extra_note"
    | "juice"
    | "meal1"
    | "meal2"
    | "bowel"
    | "morning_tea"
    | "evening_tea";
  value: MealStatus | MoodStatus | boolean | string | JuiceStatus | MealIntakeStatus | BowelStatus;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const reportId = await ensureReportId(input.childId, input.classId, input.date);
  const { error } = await supabase
    .from("daily_reports")
    .update({ [input.field]: input.value, updated_by: user?.id })
    .eq("id", reportId);

  if (error) throw new Error(error.message);
  revalidatePath("/teacher");
  revalidatePath("/parent");
  return { ok: true };
}

/** Inline activity checklist toggle. */
export async function updateActivity(input: {
  childId: string;
  classId: string;
  date: string;
  key: ActivityKey;
  value: boolean;
}) {
  const reportId = await ensureReportId(input.childId, input.classId, input.date);
  const supabase = createClient();

  const { error } = await supabase
    .from("daily_activities")
    .upsert(
      { daily_report_id: reportId, [input.key]: input.value },
      { onConflict: "daily_report_id" }
    );

  if (error) throw new Error(error.message);
  revalidatePath("/teacher");
  revalidatePath("/parent");
  return { ok: true };
}

export async function updateAttendance(input: {
  childId: string;
  date: string;
  status: AttendanceStatus;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("attendance").upsert(
    {
      child_id: input.childId,
      report_date: input.date,
      status: input.status,
      marked_by: user?.id,
    },
    { onConflict: "child_id,report_date" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/teacher");
  revalidatePath("/parent");
  return { ok: true };
}

/**
 * Bulk action: apply one field to every (present) child in the class in a
 * single batch, not N sequential requests. Used for "Бүгдэд тэмдэглэх".
 */
export async function bulkApplyToClass(input: {
  classId: string;
  date: string;
  childIds: string[];
  kind:
    | { type: "meal"; value: MealStatus }
    | { type: "mood"; value: MoodStatus }
    | { type: "activity"; key: ActivityKey; value: boolean }
    | { type: "hygiene"; key: "hygiene_hands" | "hygiene_toilet" | "hygiene_teeth"; value: boolean };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const reportRows = input.childIds.map((childId) => ({
    child_id: childId,
    class_id: input.classId,
    report_date: input.date,
    updated_by: user?.id,
    ...(input.kind.type === "meal" ? { meal: input.kind.value } : {}),
    ...(input.kind.type === "mood" ? { mood: input.kind.value } : {}),
    ...(input.kind.type === "hygiene" ? { [input.kind.key]: input.kind.value } : {}),
  }));

  const { data: reports, error: upsertErr } = await supabase
    .from("daily_reports")
    .upsert(reportRows, { onConflict: "child_id,report_date" })
    .select("id, child_id");

  if (upsertErr) throw new Error(upsertErr.message);

  if (input.kind.type === "activity" && reports) {
    const activityRows = reports.map((r: { id: string }) => ({
      daily_report_id: r.id,
      [input.kind.type === "activity" ? input.kind.key : ""]: input.kind.value,
    }));
    const { error: actErr } = await supabase
      .from("daily_activities")
      .upsert(activityRows, { onConflict: "daily_report_id" });
    if (actErr) throw new Error(actErr.message);
  }

  revalidatePath("/teacher");
  revalidatePath("/parent");
  return { ok: true };
}
}
