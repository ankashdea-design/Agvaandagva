"use client";

import { useFormState, useFormStatus } from "react-dom";
import { login, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { LoginFeatures } from "@/components/login-features";

const initialState: LoginState = { error: null };

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
    <div className="flex min-h-dvh flex-col px-4 py-10">
      {/* Нэвтрэх карт — дэлгэцийн голд */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500/90 to-sky-400/90 text-3xl text-white shadow-xl shadow-brand-600/25">
            🌱
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brand-900">
            KinderCare MN
          </h1>
          <p className="mt-1 text-sm text-slate-500">Цэцэрлэгийн өдөр тутмын тайлан</p>
        </div>

        <form action={formAction} className="glass-strong space-y-4 rounded-3xl p-6 sm:p-8">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              Имэйл
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="glass-btn h-11 w-full rounded-xl px-3.5 text-base outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Нууц үг
              </label>
              <a
                href="/forgot-password"
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Нууц үг мартсан?
              </a>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="glass-btn h-11 w-full rounded-xl px-3.5 text-base outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-brand-400"
            />
          </div>

          {state.error && (
            <p className="rounded-xl bg-rose-400/15 px-3 py-2 text-sm font-medium text-rose-700">
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>
      </main>

      {/* Онцлох мэдээллийн картууд */}
      <section className="mx-auto mt-14 w-full max-w-6xl">
        <LoginFeatures />
      </section>

      <footer className="mt-10 pb-2 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} KinderCare MN
      </footer>
    </div>
  );
}
