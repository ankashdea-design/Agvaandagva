"use client";

import { useFormState, useFormStatus } from "react-dom";
import { sendMessage, type SendMessageState } from "./actions";

const initialState: SendMessageState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="press rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/25 disabled:opacity-50"
    >
      {pending ? "Илгээж байна…" : "Илгээх"}
    </button>
  );
}

export function Composer() {
  const [state, formAction] = useFormState(sendMessage, initialState);
  return (
    <form
      action={formAction}
      className="rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_10px_36px_rgba(65,81,216,0.08)]"
    >
      <textarea
        name="body"
        rows={3}
        maxLength={2000}
        required
        placeholder="Багш руу зурвас бичих… (жишээ: Өнөөдөр эрт сэрсэн, юу хийдэг вэ?)"
        className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-brand-400"
      />
      {state.error && (
        <p className="mt-2 text-xs font-semibold text-rose-600">{state.error}</p>
      )}
      <div className="mt-2 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
