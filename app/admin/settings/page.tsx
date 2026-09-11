import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function AdminSettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: kinder } = await supabase
    .from("kindergartens")
    .select("name, address")
    .eq("admin_id", user?.id)
    .single();

  return (
    <div className="mx-auto max-w-md px-4 pt-5">
      <h1 className="mb-4 text-lg font-semibold text-brand-900">Тохиргоо</h1>

      <Card className="mb-4">
        <p className="mb-2 text-sm font-semibold text-brand-800">Цэцэрлэгийн мэдээлэл</p>
        <p className="text-sm text-brand-600">{kinder?.name}</p>
        <p className="text-xs text-brand-400">{kinder?.address}</p>
      </Card>

      <Card className="mb-4">
        <p className="mb-2 text-sm font-semibold text-brand-800">Админ</p>
        <p className="text-sm text-brand-600">{user?.email}</p>
      </Card>

      <form action={logout}>
        <Button variant="outline" className="w-full" type="submit">
          Гарах
        </Button>
      </form>
    </div>
  );
}
