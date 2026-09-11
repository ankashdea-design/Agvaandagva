"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, History, User, LayoutDashboard, School, FileBarChart, Settings, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  home: Home,
  users: Users,
  history: History,
  user: User,
  dashboard: LayoutDashboard,
  school: School,
  reports: FileBarChart,
  settings: Settings,
  bell: Bell,
} as const;

export type NavIcon = keyof typeof ICONS;

interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
}

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs touch-target",
                active ? "text-brand-700 font-medium" : "text-brand-400"
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
