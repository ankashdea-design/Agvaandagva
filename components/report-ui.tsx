import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Хэсэгтийн гарчигттай шилэн карт */
export function ReportSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass rounded-3xl p-5", className)}>
      <h2 className="text-sm font-bold text-slate-700">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** Хоол/цайны мөр — зүүн тайд нэр, баруун тайд статус */
export function MealRow({
  label,
  done,
}: {
  label: string;
  done: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl px-4 py-3",
        done ? "glass-soft" : "bg-white/30 border border-white/50"
      )}
    >
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {done ? (
        <span className="text-xs font-bold text-emerald-700">Идсэн</span>
      ) : (
        <span className="text-xs font-bold text-rose-600">Идсэнгүй</span>
      )}
    </div>
  );
}

/** Ногоон шалгасан пилл — ариун цэвэр, үйл ажиллагаанд */
export function CheckPill({
  label,
  done = true,
  emoji,
}: {
  label: string;
  done?: boolean;
  emoji?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium",
        done
          ? "bg-emerald-400/20 text-emerald-800 border border-emerald-300/50"
          : "bg-white/40 text-slate-400 border border-white/60"
      )}
    >
      {done ? <Check className="size-3.5" /> : <X className="size-3.5" />}
      {emoji && <span>{emoji}</span>}
      {label}
    </span>
  );
}

/** Тойм хоёр том карт (сэтгэл санаа / хоол) */
export function SummaryCard({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: string;
}) {
  return (
    <div className="glass glass-hover rounded-3xl p-5">
      <span className="text-3xl">{emoji}</span>
      <p className="mt-3 text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-base font-extrabold text-slate-800">{value}</p>
    </div>
  );
}
