import { createClient } from "@/lib/supabase/server";
import { InviteForm } from "@/components/admin/invite-form";

export default async function AdminTeachersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: kinder } = await supabase
    .from("kindergartens")
    .select("id")
    .eq("admin_id", user?.id)
    .single();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
    .eq("kindergarten_id", kinder?.id)
    .eq("is_active", true);

  const { data: teachers } = await supabase
    .from("teachers")
    .select("id, profiles(full_name), teacher_classes(classes(name))")
    .eq("kindergarten_id", kinder?.id);

  return (
    <div className="mx-auto max-w-md px-4 pt-5">
      <h1 className="mb-4 text-lg font-semibold text-brand-900">Багш нар</h1>

      <InviteForm role="teacher" classes={classes ?? []} />

      <ul className="mt-5 space-y-2">
        {(teachers ?? []).map((t: any) => (
          <li key={t.id} className="rounded-xl border border-brand-100 bg-white px-4 py-3 shadow-soft">
            <p className="text-sm font-medium text-brand-900">{t.profiles?.full_name}</p>
            <p className="text-xs text-brand-400">
              {t.teacher_classes?.map((tc: any) => tc.classes?.name).join(", ") || "Анги хуваарилагдаагүй"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
