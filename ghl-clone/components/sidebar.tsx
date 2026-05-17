"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, MessageSquare, Calendar, TrendingUp,
  Mail, Zap, Globe, BarChart2, Settings, ChevronRight,
  Megaphone, ClipboardList, FileText, Share2
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    items: [{ href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }]
  },
  {
    label: "CRM",
    items: [
      { href: "/contacts", icon: Users, label: "Contacten" },
      { href: "/conversations", icon: MessageSquare, label: "Gesprekken" },
      { href: "/calendar", icon: Calendar, label: "Kalender" },
    ]
  },
  {
    label: "Sales",
    items: [
      { href: "/pipelines", icon: TrendingUp, label: "Pipelines" },
    ]
  },
  {
    label: "Marketing",
    items: [
      { href: "/marketing/email", icon: Mail, label: "E-mail Campagnes" },
      { href: "/marketing/social", icon: Share2, label: "Social Planner" },
    ]
  },
  {
    label: "Automatisering",
    items: [
      { href: "/automation", icon: Zap, label: "Workflows" },
    ]
  },
  {
    label: "Sites",
    items: [
      { href: "/funnels", icon: TrendingUp, label: "Funnels" },
      { href: "/funnels/websites", icon: Globe, label: "Websites" },
      { href: "/funnels/forms", icon: ClipboardList, label: "Formulieren" },
      { href: "/funnels/surveys", icon: FileText, label: "Enquêtes" },
    ]
  },
  {
    label: "Analyse",
    items: [
      { href: "/reporting", icon: BarChart2, label: "Rapportages" },
    ]
  },
  {
    label: "Instellingen",
    items: [
      { href: "/settings", icon: Settings, label: "Instellingen" },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#1a1d24] flex flex-col z-30 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00b4d8] rounded-lg flex items-center justify-center">
            <Megaphone className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">HighLevel</span>
        </div>
        <p className="text-white/40 text-xs mt-1 ml-10">Little Oummah</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {navItems.map((group) => (
          <div key={group.label}>
            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-3 mb-1">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                        active
                          ? "bg-[#00b4d8]/20 text-[#00b4d8] font-medium"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#00b4d8] flex items-center justify-center text-white text-xs font-bold">LO</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">Little Oummah</p>
            <p className="text-white/40 text-[10px] truncate">admin@littleoummah.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
