"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ROUTES, APP_NAME } from "@/lib/constants";

interface HeaderProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const getPageInfo = (pathname: string) => {
  switch (pathname) {
    case ROUTES.DASHBOARD:
      return { title: "Dashboard" };
    case ROUTES.CHAT:
      return { title: "Assistant" };
    case ROUTES.EXPENSES:
      return { title: "Expenses" };
    case ROUTES.INCOME:
      return { title: "Income" };
    case ROUTES.SETTINGS:
      return { title: "Settings" };
    default:
      return { title: APP_NAME };
  }
};

export function Header({ isCollapsed, onToggle }: HeaderProps) {
  const pathname = usePathname();
  const pageInfo = getPageInfo(pathname);

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>
        
        <div className="flex items-center">
          <span className="text-base font-bold text-gray-900">{pageInfo.title}</span>
        </div>
      </div>
    </header>
  );
}

