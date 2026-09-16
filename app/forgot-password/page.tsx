"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-warm-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl text-white shadow-card">
            🌱
          </div>
          <h1 className="text-xl font-semibold text-brand-900">Нууц үг сэргээх</h1>
          <p className="mt-1 text-sm text-brand-600">Имэйл хаягаа оруулна уу</p>
        </div>

        {status === "sent" ? (
          <div className="rounded-2xl bg-white p-6 text-center shadow-card">
            <p className="text-sm text-brand-700">
              Имэйл рүү сэргээх холбоос илгээгдлээ. Мэйл хаягаа шалгана уу.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-white p-6 shadow-card">
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-800">Имэйл</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@demo.mn"
                className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-base outline-none focus:border-brand-500"
              />
            </div>

            {status === "error" && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                Алдаа гарлаа. Дахин оролдоно уу.
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={status === "loading"}>
              {status === "loading" ? "Илгээж байна..." : "Холбоос илгээх"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
