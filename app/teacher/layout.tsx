import { BottomNav } from "@/components/nav/bottom-nav";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-warm-50 pb-20">
      {children}
      <BottomNav
        items={[
          { href: "/teacher", label: "Нүүр", icon: "home" },
          { href: "/teacher/children", label: "Хүүхдүүд", icon: "users" },
          { href: "/teacher/history", label: "Түүх", icon: "history" },
          { href: "/teacher/profile", label: "Профайл", icon: "user" },
        ]}
      />
    </div>
  );
}
