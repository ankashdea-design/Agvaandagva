"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Home, Users, History, User, LayoutDashboard, School,
  FileBarChart, Settings, Bell, LogOut, MessageSquare,
} from "lucide-react";
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

export type SidebarIcon = keyof typeof ICONS;

interface NavItem {
  href: string;
  label: string;
  icon: SidebarIcon;
}

export function AppSidebar({
  items,
  roleLabel,
}: {
  items: NavItem[];
  roleLabel?: string;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth
      .getUser()
      .then(async ({ data }) => {
        const u = data.user;
        if (!u) return;
        let name: string | undefined;
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name,name")
            .eq("id", u.id)
            .single();
          name = profile?.full_name ?? profile?.name ?? undefined;
        } catch {
          /* profile олохгүй бол имэйлээр үлдэнэ */
        }
        setUser({ name, email: u.email ?? "" });
      })
      .catch(() => {});
  }, []);

  const signOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="glass fixed inset-y-4 left-4 z-40 hidden w-64 flex-col rounded-3xl p-5 lg:flex">
      {/* Лого */}
      <Link href={items[0]?.href ?? "/"} className="press flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500/90 to-sky-400/90 shadow-lg shadow-brand-600/25">
          <Image
            src="/illustrations/logo.png"
            alt="KinderCare MN"
            width={44}
            height={44}
            className="size-full object-cover"
            priority
          />
        </div>
        <div>
          <p className="text-sm font-extrabold tracking-tight text-slate-900">KinderCare MN</p>
          <p className="text-xs text-slate-500">{roleLabel ?? "Цэцэрлэгийн систем"}</p>
        </div>
      </Link>

      {/* Цэс */}
      <nav className="mt-8 flex flex-1 flex-col gap-1.5">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "press flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all",
                active
                  ? "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-600/30"
                  : "text-slate-600 hover:bg-white/60"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Чимэглэл — хүүхдүүд наадаж буй (Гарахын дээр) */}
      <div className="mb-4 flex justify-center">
        <Image
          src="/illustrations/1.png"
          alt=""
          width={200}
          height={160}
          className="pointer-events-none w-44 select-none xl:w-52"
        />
      </div>

      {/* Доод хэсэг: хэрэглэгч + Гарах */}
      <div className="flex flex-col gap-2 border-t border-white/60 pt-4">
        <div className="px-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            {user.name ?? "—"}
          </p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="glass-btn press flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-white/75"
        >
          <LogOut size={16} />
          Гарах
        </button>
      </div>
    </aside>
  );
}
