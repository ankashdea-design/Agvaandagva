import { createClient } from "@/lib/supabase/server";
import { createChild, setChildActive } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AdminChildrenPage() {
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

  const classIds = (classes ?? []).map((c) => c.id);
  const { data: children } = await supabase
    .from("children")
    .select("id, full_name, class_id, is_active, classes(name)")
    .in("class_id", classIds.length ? classIds : ["00000000-0000-0000-0000-000000000000"])
    .order("full_name");

  async function addChild(formData: FormData) {
    "use server";
    const fullName = String(formData.get("fullName") ?? "").trim();
    const classId = String(formData.get("classId") ?? "");
    if (!fullName || !classId) return;
    await createChild({ classId, fullName });
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-5">
      <h1 className="mb-4 text-lg font-semibold text-brand-900">Хүүхдүүд</h1>

      <form action={addChild} className="mb-5 space-y-2 rounded-2xl bg-white p-4 shadow-soft">
        <p className="text-sm font-semibold text-brand-800">Шинэ хүүхэд нэмэх</p>
        <input
          name="fullName"
          placeholder="Овог нэр"
          required
          className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
        />
        <select
          name="classId"
          required
          className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none"
        >
          <option value="">Анги сонгох</option>
          {(classes ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm" className="w-full">
          Нэмэх
        </Button>
      </form>

      <ul className="space-y-2">
        {(children ?? []).map((c: any) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-xl border border-brand-100 bg-white px-4 py-3 shadow-soft"
          >
            <div>
              <p className="text-sm font-medium text-brand-900">{c.full_name}</p>
              <p className="text-xs text-brand-400">{c.classes?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              {c.is_active ? (
                <Badge tone="success">Идэвхтэй</Badge>
              ) : (
                <Badge tone="neutral">Идэвхгүй</Badge>
              )}
              <form
                action={async () => {
                  "use server";
                  await setChildActive(c.id, !c.is_active);
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
