"use client";

import { useApp } from "@/providers";
import { cn } from "@/lib/utils";

/**
 * Example 2: Using App Settings
 * Shows how to manage global app settings
 */
export function AppSettingsExample() {
  const { settings, toggleCompactMode, toggleNotifications, resetSettings } = useApp();

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">App Settings</h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Compact Mode</span>
          <button
            onClick={toggleCompactMode}
            className={cn(
              "rounded px-3 py-1 text-sm",
              settings.compactMode ? "bg-green-500 text-white" : "border"
            )}
          >
            {settings.compactMode ? "On" : "Off"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Notifications</span>
          <button
            onClick={toggleNotifications}
            className={cn(
              "rounded px-3 py-1 text-sm",
              settings.notificationsEnabled ? "bg-green-500 text-white" : "border"
            )}
          >
            {settings.notificationsEnabled ? "Enabled" : "Disabled"}
          </button>
        </div>
      </div>

      <button
        onClick={resetSettings}
        className="rounded border px-3 py-1 text-sm hover:bg-muted"
      >
        Reset All Settings
      </button>
    </div>
  );
}

