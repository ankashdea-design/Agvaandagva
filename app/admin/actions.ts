"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createChild(input: { classId: string; fullName: string; birthDate?: string }) {
  const supabase = createClient();
  const { error } = await supabase.from("children").insert({
    class_id: input.classId,
    full_name: input.fullName,
    birth_date: input.birthDate || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/children");
}

export async function updateChild(input: { id: string; fullName?: string; classId?: string }) {
  const supabase = createClient();
  const patch: Record<string, unknown> = {};
  if (input.fullName) patch.full_name = input.fullName;
  if (input.classId) patch.class_id = input.classId;
  const { error } = await supabase.from("children").update(patch).eq("id", input.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/children");
}

/** Soft delete only — per spec, never hard-delete records. */
export async function setChildActive(id: string, isActive: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("children").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/children");
}

export async function createClass(input: { kindergartenId: string; name: string; ageGroup?: string }) {
  const supabase = createClient();
  const { error } = await supabase.from("classes").insert({
    kindergarten_id: input.kindergartenId,
    name: input.name,
    age_group: input.ageGroup || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/classes");
}

export async function setClassActive(id: string, isActive: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("classes").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/classes");
}
