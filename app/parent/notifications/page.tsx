import { createClient } from "@/lib/supabase/server";

export default async function ParentNotificationsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-md px-4 pt-5">
      <h1 className="mb-4 text-lg font-semibold text-brand-900">Мэдэгдэл</h1>
      {(!notifications || notifications.length === 0) && (
        <p className="text-sm text-brand-400">Мэдэгдэл алга байна.</p>
      )}
      <ul className="space-y-2">
        {(notifications ?? []).map((n) => (
          <li
            key={n.id}
            className={`rounded-xl border px-4 py-3 shadow-soft ${
              n.is_read ? "border-brand-100 bg-white" : "border-brand-300 bg-brand-50"
            }`}
          >
            <p className="text-sm font-medium text-brand-800">🔔 {n.title}</p>
            {n.body && <p className="mt-0.5 text-xs text-brand-500">{n.body}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
