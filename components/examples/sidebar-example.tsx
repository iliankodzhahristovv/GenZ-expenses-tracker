"use client";

import { useSidebar } from "@/providers";
import { cn } from "@/lib/utils";

/**
 * Example 3: Using Sidebar State
 * Shows how to use convenience hooks
 */
export function SidebarExample() {
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Sidebar Control</h3>
        <button
          onClick={toggleSidebar}
          className="rounded border px-3 py-1 text-sm hover:bg-muted"
        >
          Toggle Sidebar
        </button>
      </div>

      <div
        className={cn(
          "rounded border-l-4 p-4 transition-colors",
          isSidebarOpen ? "border-l-green-500 bg-green-50" : "border-l-red-500 bg-red-50"
        )}
      >
        <p className="text-sm">
          Sidebar is currently <strong>{isSidebarOpen ? "open" : "closed"}</strong>
        </p>
      </div>
    </div>
  );
}

