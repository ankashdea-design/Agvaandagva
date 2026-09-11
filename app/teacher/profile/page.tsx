import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export default async function TeacherProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user?.id)
    .single();

  return (
    <div className="mx-auto max-w-md px-4 pt-5">
      <h1 className="mb-4 text-lg font-semibold text-brand-900">Профайл</h1>
      <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
        <p className="text-sm text-brand-500">Нэр</p>
        <p className="mb-3 text-base font-medium text-brand-900">{profile?.full_name}</p>
        <p className="text-sm text-brand-500">Имэйл</p>
        <p className="mb-3 text-base font-medium text-brand-900">{user?.email}</p>
      </div>
      <form action={logout} className="mt-4">
        <Button variant="outline" className="w-full" type="submit">
          Гарах
        </Button>
      </form>
    </div>
  );
}
