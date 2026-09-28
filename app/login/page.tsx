"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { Eye, EyeOff, Sprout } from "lucide-react";
import { login, signUp, type AuthState } from "./actions";
import { Button } from "@/components/ui/button";

const initialState: AuthState = { error: null, success: null };

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-base outline-none backdrop-blur transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  const [loginState, loginAction] = useFormState(login, initialState);
  const [regState, regAction] = useFormState(signUp, initialState);
  const state = mode === "login" ? loginState : regState;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* Зөөлөн дэвсгэрийн давхаргууд */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-card">
            <Sprout className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-semibold text-brand-900">KinderCare MN</h1>
          <p className="mt-1 text-sm text-brand-600">Цэцэрлэгийн өдөр тутмын тайлан</p>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur-xl">
          {/* Таб: Нэвтрэх / Бүртгүүлэх */}
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-white/60 p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-lg py-2 text-sm font-medium transition ${
                  mode === m
                    ? "bg-brand-600 text-white shadow"
                    : "text-brand-700 hover:bg-white"
                }`}
              >
                {m === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <form action={loginAction} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-800">Имэйл</label>
                <input name="email" type="email" required placeholder="you@example.com" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-800">Нууц үг</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600"
                    aria-label="Нууц үг харах"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <StateMessage state={state} />

              <SubmitButton label="Нэвтрэх" pendingLabel="Нэвтэрч байна..." />

              <div className="text-center">
                <a href="/forgot-password" className="text-sm text-brand-600 hover:underline">
                  Нууц үг мартсан?
                </a>
              </div>
            </form>
          ) : (
            <form action={regAction} className="space-y-3">
              <p className="text-sm text-brand-600">
                Эцэг эхийн бүртгэл үүсгэнэ. Админ хүүхдийг тантай холбох
                хүртэл тайлан харагдахгүй.
              </p>
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-800">Таны нэр</label>
                <input name="name" required placeholder="Д.Дулам" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-800">Имэйл</label>
                <input name="email" type="email" required placeholder="you@example.com" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-800">Нууц үг</label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-800">Нууц үг давтах</label>
                <input
                  name="confirm"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>

              <StateMessage state={state} />

              <SubmitButton label="Бүртгүүлэх" pendingLabel="Бүртгүүлж байна..." />
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-brand-500">
          Асуудал гарвал цэцэрлэгийн админтай холбогдоно уу.
        </p>
      </div>
    </main>
  );
}

function StateMessage({ state }: { state: AuthState }) {
  if (state.error) {
    return (
      <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
    );
  }
  if (state.success) {
    return (
      <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</p>
    );
  }
  return null;
}
