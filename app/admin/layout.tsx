import { BottomNav } from "@/components/nav/bottom-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20">
      {children}
      <BottomNav
        items={[
          { href: "/admin", label: "Хянах самбар", icon: "dashboard" },
          { href: "/admin/children", label: "Хүүхдүүд", icon: "users" },
          { href: "/admin/teachers", label: "Багш нар", icon: "school" },
          { href: "/admin/classes", label: "Ангиуд", icon: "school" },
          { href: "/admin/reports", label: "Тайлан", icon: "reports" },
          { href: "/admin/settings", label: "Тохиргоо", icon: "settings" },
        ]}
      />
    </div>
  );
}
