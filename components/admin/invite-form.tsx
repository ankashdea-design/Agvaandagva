"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function InviteForm({
  role,
  classes,
}: {
  role: "teacher" | "parent";
  classes: { id: string; name: string }[];
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, fullName, email, classId: classId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Алдаа гарлаа");
      setMessage("Амжилттай нэмэгдлээ. Хэрэглэгч нууц үгээ 'Нууц үг мартсан' цэснээс тохируулна.");
      setFullName("");
      setEmail("");
      setClassId("");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-2xl bg-white p-4 shadow-soft">
      <p className="text-sm font-semibold text-brand-800">
        {role === "teacher" ? "Шинэ багш нэмэх" : "Шинэ эцэг эх нэмэх"}
      </p>
      <input
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Овог нэр"
        required
        className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Имэйл"
        required
        className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
      />
      {role === "teacher" && (
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none"
        >
          <option value="">Анги сонгох (заавал биш)</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}
      <Button type="submit" size="sm" className="w-full" disabled={loading}>
        {loading ? "Нэмж байна..." : "Нэмэх"}
      </Button>
      {message && <p className="text-xs text-brand-600">{message}</p>}
    </form>
  );
}
