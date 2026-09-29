import { BottomNav } from "@/components/nav/bottom-nav";
import { AppSidebar } from "@/components/nav/app-sidebar";

const items: { href: string; label: string; icon: "home" | "users" | "history" | "user" }[] = [
  { href: "/teacher", label: "Нүүр", icon: "home" },
  { href: "/teacher/children", label: "Хүүхдүүд", icon: "users" },
  { href: "/teacher/history", label: "Түүх", icon: "history" },
  { href: "/teacher/profile", label: "Профайл", icon: "user" },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Десктоп: зүүн талын шилэн sidebar */}
      <AppSidebar items={items} roleLabel="Багш" />

      {/* Агуулга — десктоп дээр sidebar-аас зай авна */}
      <div className="min-h-screen pb-24 lg:pb-10 lg:pl-72">
        {children}
      </div>

      {/* Утас: доод floating nav — десктоп дээр нуугдана */}
      <div className="lg:hidden">
        <BottomNav items={items} />
      </div>
    </div>
  );
}
