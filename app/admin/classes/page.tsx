import { createClient } from "@/lib/supabase/server";
import { createClass, setClassActive } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AdminClassesPage() {
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
    .select("id, name, age_group, is_active")
    .eq("kindergarten_id", kinder?.id)
    .order("name");

  async function addClass(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const ageGroup = String(formData.get("ageGroup") ?? "").trim();
    if (!name || !kinder?.id) return;
    await createClass({ kindergartenId: kinder.id, name, ageGroup });
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-5">
      <h1 className="mb-4 text-lg font-semibold text-brand-900">Ангиуд</h1>

      <form action={addClass} className="mb-5 space-y-2 rounded-2xl bg-white p-4 shadow-soft">
        <p className="text-sm font-semibold text-brand-800">Шинэ анги нэмэх</p>
        <input
          name="name"
          placeholder="Ангийн нэр (жишээ: Бэлтгэл бүлэг)"
          required
          className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
        />
        <input
          name="ageGroup"
          placeholder="Насны бүлэг (жишээ: 5-6 нас)"
          className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
        />
        <Button type="submit" size="sm" className="w-full">
          Нэмэх
        </Button>
      </form>

      <ul className="space-y-2">
        {(classes ?? []).map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-xl border border-brand-100 bg-white px-4 py-3 shadow-soft"
          >
            <div>
              <p className="text-sm font-medium text-brand-900">{c.name}</p>
              <p className="text-xs text-brand-400">{c.age_group}</p>
            </div>
            <div className="flex items-center gap-2">
              {c.is_active ? <Badge tone="success">Идэвхтэй</Badge> : <Badge tone="neutral">Идэвхгүй</Badge>}
              <form
                action={async () => {
                  "use server";
                  await setClassActive(c.id, !c.is_active);
                }}
              >
                <Button type="submit" size="sm" variant={c.is_active ? "outline" : "secondary"}>
                  {c.is_active ? "Идэвхгүй болгох" : "Идэвхжүүлэх"}
                </Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
