import { createClient } from "@/lib/supabase/server";
import { Composer } from "./composer";
import { ScrollToBottom } from "@/components/messages/scroll-to-bottom";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function timeLabel(iso: string) {
  return new Date(iso).toLocaleString("mn-MN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ulaanbaatar",
  });
}

export default async function ParentMessagesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, body, created_at, sender_id")
    .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
    .order("created_at", { ascending: true })
    .limit(100);

  const senderIds = [...new Set((messages ?? []).map((m) => m.sender_id))];
  const { data: profiles } = senderIds.length
    ? await supabase.from("profiles").select("id, full_name, name").in("id", senderIds)
    : { data: [] as { id: string; full_name?: string; name?: string }[] };

  const nameOf = (id: string) => {
    const p = (profiles ?? []).find((r) => r.id === id);
    return p?.full_name ?? p?.name ?? "Багш";
  };

  return (
    <div className="mx-auto max-w-md px-4 pt-5 sm:max-w-xl lg:max-w-2xl">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-slate-900">Зурвас</h1>
      <p className="mb-4 text-sm text-slate-400">Багштай шууд холбогдоно.</p>

      <Composer />

      <ScrollToBottom>
        <div className="mt-4 space-y-2 pb-24">
          {(messages ?? []).length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 py-10 text-center text-sm text-slate-400">
              Одоогоор зурвас байхгүй.
            </div>
          )}
          {(messages ?? []).map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed",
                    mine
                      ? "rounded-br-md bg-brand-600 text-white shadow-lg shadow-brand-600/20"
                      : "rounded-bl-md border border-slate-100 bg-white text-slate-700 shadow-[0_2px_10px_rgba(65,81,216,0.05)]"
                  )}
                >
                  {!mine && (
                    <p className="mb-1 text-xs font-bold text-slate-500">{nameOf(m.sender_id)}</p>
                  )}
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className={cn("mt-1 text-[10px]", mine ? "text-white/70" : "text-slate-400")}>
                    {timeLabel(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollToBottom>
    </div>
  );
}
