import { getTeacherClassData } from "@/lib/queries/teacher";
import { TeacherDashboard } from "@/components/teacher/teacher-dashboard";
import { todayISO } from "@/lib/utils";

export default async function TeacherPage() {
  const date = todayISO();
  const data = await getTeacherClassData(date);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-brand-600">
        Танд одоогоор ямар ч анги хуваарилагдаагүй байна. Админтай холбогдоно уу.
      </div>
    );
  }

  return (
    <TeacherDashboard
      classId={data.classId}
      className={data.className}
      date={date}
      initialChildren={data.children}
    />
  );
}
