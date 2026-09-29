import { createClient } from "@/lib/supabase/server";
import { TeacherReply } from "./reply";
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

export default async function TeacherMessagesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Миний бүлгүүд — teacher_classes холбоос
  const { data: tcLinks } = await supabase
    .from("teacher_classes")
    .select("class_id")
    .eq("teacher_id", user?.id ?? "");

  const classIds = [...new Set((tcLinks ?? []).map((r) => r.class_id))];
  const classId = classIds[0] ?? null;

  const { data: messages } = classIds.length
    ? await supabase
        .from("messages")
        .select("id, body, created_at, sender_id, recipient_id, class_id")
        .in("class_id", classIds)
        .order("created_at", { ascending: true })
        .limit(200)
    : { data: [] };

  // Хэрэглэгч тус бүрээр бүлэглэх (thread маягийн)
  const threads = new Map<string, { id: string; body: string; created_at: string; sender_id: string; recipient_id: string | null; class_id: string | null }[]>();
  for (const m of messages ?? []) {
    const otherId = m.sender_id === user?.id ? (m.recipient_id ?? "") : m.sender_id;
    if (!otherId) continue;
    const list = threads.get(otherId) ?? [];
    list.push(m);
    threads.set(otherId, list);
  }

  const otherIds = [...threads.keys()];
  const { data: profiles } = otherIds.length
    ? await supabase.from("profiles").select("id, full_name, name").in("id", otherIds)
    : { data: [] as { id: string; full_name?: string; name?: string }[] };
  const nameOf = (id: string) => {
    const p = (profiles ?? []).find((r) => r.id === id);
    return p?.full_name ?? p?.name ?? "Эцэг эх";
  };

  return (
    <div className="mx-auto max-w-md px-4 pt-5 sm:max-w-xl lg:max-w-2xl">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-slate-900">Зурвас</h1>
      <p className="mb-4 text-sm text-slate-400">Эцэг эхчүүдийн илгээсэн зурвасууд.</p>

      <ScrollToBottom>
        <div className="space-y-4 pb-24">
          {threads.size === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 py-10 text-center text-sm text-slate-400">
              Одоогоор зурвас байхгүй.
            </div>
          )}
          {[...threads.entries()].map(([parentId, msgs]) => (
            <div
              key={parentId}
              className="rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_10px_36px_rgba(65,81,216,0.08)]"
            >
              <p className="mb-3 text-sm font-extrabold text-slate-800">👨‍👩‍👧 {nameOf(parentId)}</p>
              <div className="space-y-2">
                {msgs.slice(-10).map((m) => {
                  const mine = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                          mine
                            ? "rounded-br-md bg-brand-600 text-white"
                            : "rounded-bl-md bg-slate-50 text-slate-700"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{m.body}</p>
                        <p className={cn("mt-1 text-[10px]", mine ? "text-white/70" : "text-slate-400")}>
                          {timeLabel(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <TeacherReply recipientId={parentId} classId={classId ?? ""} />
            </div>
          ))}
        </div>
      </ScrollToBottom>
    </div>
  );
}
