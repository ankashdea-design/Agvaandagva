"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type SendMessageState = { error: string | null };

export async function replyToParent(
  _prev: SendMessageState,
  formData: FormData
): Promise<SendMessageState> {
  const body = String(formData.get("body") ?? "").trim();
  const recipientId = String(formData.get("recipient_id") ?? "");
  const classId = String(formData.get("class_id") ?? "");

  if (!body) return { error: "Хариу бичнэ үү." };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Хугацаа дууссан. Дахин нэвтэрнэ үү." };

  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    recipient_id: recipientId,
    class_id: classId || null,
    body,
  });

  if (error) return { error: "Илгээхэд алдаа гарлаа." };

  revalidatePath("/teacher/messages");
  return { error: null };
}
