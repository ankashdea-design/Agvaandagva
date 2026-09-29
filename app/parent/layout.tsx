import { BottomNav, type NavIcon } from "@/components/nav/bottom-nav";
import { AppSidebar } from "@/components/nav/app-sidebar";

const items: { href: string; label: string; icon: NavIcon }[] = [
  { href: "/parent", label: "Нүүр", icon: "home" },
  { href: "/parent/history", label: "Түүх", icon: "history" },
  { href: "/parent/notifications", label: "Мэдэгдэл", icon: "bell" },
  { href: "/parent/profile", label: "Профайл", icon: "user" },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Десктоп: зүүн талын шилэн sidebar */}
      <AppSidebar items={items} roleLabel="Эцэг эх" />

      {/* Агуулга — десктоп дээр sidebar-аас зай авна */}
      <div className="min-h-screen pb-24 lg:pb-10 lg:pl-72">
        {children}
      </div>

      {/* Утас: доод floating нав (десктоп дээр нуугдана) */}
      <div className="lg:hidden">
        <BottomNav items={items} />
      </div>
    </div>
  );
}
