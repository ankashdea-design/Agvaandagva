import { BottomNav } from "@/components/nav/bottom-nav";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-warm-50 pb-20">
      {children}
      <BottomNav
        items={[
          { href: "/parent", label: "Нүүр", icon: "home" },
          { href: "/parent/history", label: "Түүх", icon: "history" },
          { href: "/parent/notifications", label: "Мэдэгдэл", icon: "bell" },
          { href: "/parent/profile", label: "Профайл", icon: "user" },
        ]}
      />
    </div>
  );
}
