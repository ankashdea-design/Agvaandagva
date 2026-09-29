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

  // ⚠️ Эцэг эх → хүүхэд холбоос багана (parent_id гэж үзлээ, өөр бол соль)
  const { data: child } = await supabase
    .from("children")
    .select("class_id")
    .eq("parent_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!child?.class_id)
    return { error: "Хүүхдийн бүлэг олдсонгүй. Цэцэрлэгийн админтай холбогдоно уу." };

  // ⚠️ Бүлэг → багш холбоос багана (teacher_id гэж үзлээ, өөр бол соль)
  const { data: cls } = await supabase
    .from("classes")
    .select("teacher_id")
    .eq("id", child.class_id)
    .maybeSingle();

  const teacherId = (cls as { teacher_id?: string | string[] } | null)?.teacher_id ?? null;
  const recipients = Array.isArray(teacherId) ? teacherId : teacherId ? [teacherId] : [];

  if (recipients.length === 0)
    return { error: "Багш олдсонгүй. Админтай холбогдоно уу." };

  const { error } = await supabase.from("messages").insert(
    recipients.map((rid) => ({
      sender_id: user.id,
      recipient_id: rid,
      class_id: child.class_id,
      body,
    }))
  );

  if (error) return { error: "Илгээхэд алдаа гарлаа. Дахин оролдоно уу." };

  revalidatePath("/parent/messages");
  return { error: null };
}
