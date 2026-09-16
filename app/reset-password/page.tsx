"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      setStatus("error");
      setErrorMsg("Нууц үг 6-с дээш тэмдэгттэй байх ёстой.");
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setErrorMsg("Нууц үг таарахгүй байна.");
      return;
    }

    setStatus("loading");
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("done");
      setTimeout(() => router.push("/login"), 2000);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-warm-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl text-white shadow-card">
            🌱
          </div>
          <h1 className="text-xl font-semibold text-brand-900">Шинэ нууц үг</h1>
        </div>

        {status === "done" ? (
          <div className="rounded-2xl bg-white p-6 text-center shadow-card">
            <p className="text-sm text-brand-700">
              Амжилттай! Нэвтрэх хуудас руу шилжиж байна...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-white p-6 shadow-card">
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-800">Шинэ нууц үг</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-base outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-800">Нууц үг давтах</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-base outline-none focus:border-brand-500"
              />
            </div>

            {status === "error" && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMsg}</p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={status === "loading"}>
              {status === "loading" ? "Хадгалж байна..." : "Хадгалах"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
