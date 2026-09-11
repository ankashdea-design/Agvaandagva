"use client";

import { useFormState, useFormStatus } from "react-dom";
import { login, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";

const initialState: LoginState = { error: null };

const DEMO_ACCOUNTS = [
  { label: "Админ", email: "admin@demo.mn" },
  { label: "Багш", email: "teacher@demo.mn" },
  { label: "Эцэг эх", email: "parent@demo.mn" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Нэвтэрч байна..." : "Нэвтрэх"}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-warm-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl text-white shadow-card">
            🌱
          </div>
          <h1 className="text-xl font-semibold text-brand-900">KinderCare MN</h1>
          <p className="mt-1 text-sm text-brand-600">Цэцэрлэгийн өдөр тутмын тайлан</p>
        </div>

        <form action={formAction} className="space-y-3 rounded-2xl bg-white p-6 shadow-card">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-800">Имэйл</label>
            <input
              name="email"
              type="email"
              required
              placeholder="teacher@demo.mn"
              className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-base outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-800">Нууц үг</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-base outline-none focus:border-brand-500"
            />
          </div>

          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
          )}

          <SubmitButton />
        </form>

        <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-white/60 p-4 text-xs text-brand-700">
          <p className="mb-2 font-semibold">Demo нэвтрэх мэдээлэл</p>
          {DEMO_ACCOUNTS.map((a) => (
            <div key={a.email} className="flex justify-between py-0.5">
              <span>{a.label}</span>
              <code className="text-brand-500">{a.email}</code>
            </div>
          ))}
          <p className="mt-2">
            Нууц үг: <code className="text-brand-500">Demo1234!</code>
          </p>
        </div>
      </div>
    </main>
  );
}
