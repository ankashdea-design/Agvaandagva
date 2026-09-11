import { getParentChildren } from "@/lib/queries/parent";
import { ParentDashboard } from "@/components/parent/parent-dashboard";
import { todayISO } from "@/lib/utils";

export default async function ParentPage() {
  const date = todayISO();
  const children = await getParentChildren(date);

  if (children.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-brand-600">
        Танд одоогоор холбогдсон хүүхэд алга байна. Цэцэрлэгийн админтай холбогдоно уу.
      </div>
    );
  }

  return <ParentDashboard date={date} children={children} />;
}
