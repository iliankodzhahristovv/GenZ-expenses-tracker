"use client";

import { useUser, useApp, useSidebar } from "@/providers";
import { cn } from "@/lib/utils";

/**
 * Example 5: Combined Provider Usage
 * Shows how to use multiple contexts together
 */
export function CombinedExample() {
  const { currentUser } = useUser();
  const { isCompactMode } = useApp();
  const { isSidebarOpen } = useSidebar();

  return (
    <div className={cn("rounded-lg border p-4", isCompactMode && "p-2")}>
      <h3 className="font-semibold mb-4">Combined State</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>User:</span>
          <span className="font-medium">
            {currentUser ? currentUser.displayName : "Not logged in"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Compact Mode:</span>
          <span className="font-medium">{isCompactMode ? "Yes" : "No"}</span>
        </div>

        <div className="flex justify-between">
          <span>Sidebar:</span>
          <span className="font-medium">{isSidebarOpen ? "Open" : "Closed"}</span>
        </div>
      </div>
    </div>
  );
}

