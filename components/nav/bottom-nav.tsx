"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, History, User, LayoutDashboard, School, FileBarChart, Settings, Bell, MessageSquare } from "lucide-react";
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
  message: MessageSquare,
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
    <nav className="fixed bottom-3 left-4 right-4 z-40">
      <div className="glass-strong mx-auto flex max-w-md items-stretch justify-around rounded-3xl">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "press flex flex-1 flex-col items-center gap-1 rounded-2xl py-2.5 text-xs touch-target",
                active ? "font-semibold text-brand-700" : "text-slate-400"
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-xl transition-colors",
                  active ? "bg-brand-500/15" : ""
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
