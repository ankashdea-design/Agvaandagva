"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { sendMessage, type SendMessageState } from "./actions";

const initialState: SendMessageState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="press shrink-0 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/25 disabled:opacity-50"
    >
      {pending ? "Илгээж байна…" : "Илгээх"}
    </button>
  );
}

export function Composer() {
  const [state, formAction] = useFormState(sendMessage, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const lastState = useRef(state);

  useEffect(() => {
    if (lastState.current !== state) {
      lastState.current = state;
      if (state?.error == null) formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-3xl border border-slate-100 bg-white p-3 shadow-[0_10px_36px_rgba(65,81,216,0.08)]"
    >
      <div className="flex items-end gap-2">
        <textarea
          name="body"
          rows={1}
          maxLength={2000}
          required
          placeholder="Багш руу зурвас бичих…"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none placeholder:text-slate-400 focus:border-brand-400"
        />
        <SubmitButton />
      </div>
      {state.error && (
        <p className="mt-2 text-xs font-semibold text-rose-600">{state.error}</p>
      )}
    </form>
  );
}
