"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type SendMessageState = { error: string | null };

export async function sendMessage(
  _prev: SendMessageState,
  formData: FormData
): Promise<SendMessageState> {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Зурвасоо бичнэ үү." };
  if (body.length > 2000) return { error: "Зурвас 2000 тэмдэгтээс бага байх ёстой." };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Хугацаа дууссан. Дахин нэвтэрнэ үү." };

  // 1. Миний хүүхдүүд — parent_children холбоос
  const { data: links } = await supabase
    .from("parent_children")
    .select("child_id")
    .eq("parent_id", user.id);

  const childIds = [...new Set((links ?? []).map((l) => l.child_id))];
  if (childIds.length === 0)
    return { error: "Хүүхдийн бүртгэл олдсонгүй. Админтай холбогдоно уу." };

  // 2. Хүүхдүүдийн бүлгүүд
  const { data: children } = await supabase
    .from("children")
    .select("class_id")
    .in("id", childIds);

  const classIds = [...new Set((children ?? []).map((c) => c.class_id))];
  if (classIds.length === 0)
    return { error: "Хүүхдийн бүлэг олдсонгүй. Админтай холбогдоно уу." };

  // 3. Тийм бүлгүүдийн багш нар — teacher_classes холбоос
  const { data: tcLinks } = await supabase
    .from("teacher_classes")
    .select("teacher_id")
    .in("class_id", classIds);

    let teacherIds = [...new Set((tcLinks ?? []).map((t) => t.teacher_id))];

  // Тайлбар: teacher_classes-д мөр байхгүй бол бүлгийн бүх багш руу илгээнэ
  if (teacherIds.length === 0) {
    const { data: fallback } = await supabase
      .from("teachers")
      .select("id")
      .eq("kindergarten_id", classKindergartenId);
    teacherIds = [...new Set((fallback ?? []).map((t) => t.id))];
  }

  if (teacherIds.length === 0)
    return { error: "Багш олдсонгүй. Админтай холбогдоно уу." };

  // 4. Бүх холбогдох багш руу илгээнэ
  const { error } = await supabase.from("messages").insert(
    teacherIds.map((tid) => ({
      sender_id: user.id,
      recipient_id: tid,
      class_id: classIds[0],
      body,
    }))
  );

  if (error) return { error: "Илгээхэд алдаа гарлаа. Дахин оролдоно уу." };

  revalidatePath("/parent/messages");
  return { error: null };
}
