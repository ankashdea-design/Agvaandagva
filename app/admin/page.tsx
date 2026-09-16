import { getAdminOverview } from "@/lib/queries/admin";
import { Card } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const overview = await getAdminOverview();

  if (!overview) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-brand-600">
        Танд одоогоор удирдаж буй цэцэрлэг бүртгэгдээгүй байна.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-5">
      <h1 className="mb-1 text-lg font-semibold text-brand-900">{overview.kindergartenName}</h1>
      <p className="mb-4 text-sm text-brand-500">Хянах самбар</p>

      {(overview as any).debugError && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 break-all">
          DEBUG: {(overview as any).debugError}
        </p>
      )}

      <div className="mb-4 grid grid-cols-3 gap-2">
        <Stat label="Нийт хүүхэд" value={overview.childCount} />
        <Stat label="Нийт багш" value={overview.teacherCount} />
        <Stat label="Нийт анги" value={overview.classCount} />
      </div>

      <Card className="mb-4">
        <p className="mb-1 text-sm font-semibold text-brand-800">Өнөөдрийн бөглөлт</p>
        <p className="text-2xl font-bold text-brand-900">
          {overview.todayComplete} / {overview.todayTotal}
        </p>
      </Card>

      <Card>
        <p className="mb-3 text-sm font-semibold text-brand-800">Багшийн бөглөлт</p>
        <ul className="space-y-2">
          {overview.perTeacher.map((t) => {
            const pct = t.total > 0 ? Math.round((t.complete / t.total) * 100) : 0;
            return (
              <li key={t.classId} className="flex items-center justify-between text-sm">
                <span className="text-brand-700">{t.name}</span>
                <span className="font-medium text-brand-900">{pct}%</span>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-soft">
      <p className="text-xl font-bold text-brand-900">{value}</p>
      <p className="text-[11px] text-brand-400">{label}</p>
    </div>
  );
}
