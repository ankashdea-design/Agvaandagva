"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { replyToParent, type SendMessageState } from "./actions";

const initialState: SendMessageState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="press shrink-0 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/25 disabled:opacity-50"
    >
      {pending ? "…" : "Хариулах"}
    </button>
  );
}

export function TeacherReply({ recipientId, classId }: { recipientId: string; classId: string }) {
  const [state, formAction] = useFormState(replyToParent, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const lastState = useRef(state);

  // Амжилттай илгээгдсэн үед талбарыг цэвэрлэнэ
  useEffect(() => {
    if (lastState.current !== state) {
      lastState.current = state;
      if (state?.error == null) formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-3 flex items-start gap-2">
      <input type="hidden" name="recipient_id" value={recipientId} />
      <input type="hidden" name="class_id" value={classId} />
      <div className="flex-1">
        <input
          name="body"
          maxLength={2000}
          required
          placeholder="Хариу бичих…"
          className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-brand-400"
        />
        {state.error && <p className="mt-1 text-xs font-semibold text-rose-600">{state.error}</p>}
      </div>
      <SubmitButton />
    </form>
  );
}
