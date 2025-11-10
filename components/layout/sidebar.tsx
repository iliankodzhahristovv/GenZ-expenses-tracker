"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES, APP_NAME } from "@/lib/constants";
import { 
  LayoutDashboard, 
  Sparkles, 
  Receipt, 
  TrendingUp,
  Settings
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    title: "Assistant",
    href: ROUTES.CHAT,
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Expenses",
    href: ROUTES.EXPENSES,
    icon: <Receipt className="h-5 w-5" />,
  },
  {
    title: "Income",
    href: ROUTES.INCOME,
    icon: <TrendingUp className="h-5 w-5" />,
  },
];

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn(
      "flex h-screen flex-col border-r border-gray-100 bg-white transition-all duration-300",
      isCollapsed ? "w-16" : "w-56"
    )}>
      {/* Header */}
      <div className={cn(
        "flex h-16 items-center border-b border-gray-100",
        isCollapsed ? "justify-center px-0" : "justify-center px-3"
      )}>
        {isCollapsed ? (
          <div className="text-2xl tracking-tight flex items-center justify-center w-full">🗺️🎒</div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-2xl tracking-tight">🗺️🎒</span>
            <h1 className="text-xl font-semibold text-gray-900">{APP_NAME}</h1>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.title : undefined}
            >
              {item.icon}
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="border-t border-gray-100 p-2">
        <Link
          href={ROUTES.SETTINGS}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === ROUTES.SETTINGS
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="h-5 w-5" />
          {!isCollapsed && <span>Settings</span>}
        </Link>
      </div>
    </div>
  );
}

