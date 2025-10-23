"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

/**
 * App Settings Interface
 * Define global app settings that can be toggled
 */
interface AppSettings {
  sidebarOpen: boolean;
  compactMode: boolean;
  notificationsEnabled: boolean;
}

/**
 * App Context Type
 * Defines the shape of the app context
 */
interface AppContextType {
  // Settings
  settings: AppSettings;

  // UI State
  isSidebarOpen: boolean;
  isCompactMode: boolean;
  notificationsEnabled: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCompactMode: () => void;
  toggleNotifications: () => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

/**
 * Default settings
 */
const DEFAULT_SETTINGS: AppSettings = {
  sidebarOpen: true,
  compactMode: false,
  notificationsEnabled: true,
};

/**
 * Create the context
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Provider Props
 */
interface AppProviderProps {
  children: React.ReactNode;
  initialSettings?: Partial<AppSettings>;
}

/**
 * App Provider Component
 * Manages global app state and settings
 * 
 * @example
 * ```tsx
 * // In your root layout
 * <AppProvider>
 *   <UserProvider>
 *     {children}
 *   </UserProvider>
 * </AppProvider>
 * ```
 */
export function AppProvider({ children, initialSettings }: AppProviderProps) {
  // Initialize settings with defaults + any initial overrides
  const [settings, setSettings] = useState<AppSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });

  /**
   * Toggle sidebar open/closed
   */
  const toggleSidebar = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      sidebarOpen: !prev.sidebarOpen,
    }));
  }, []);

  /**
   * Set sidebar open state directly
   */
  const setSidebarOpen = useCallback((open: boolean) => {
    setSettings((prev) => ({
      ...prev,
      sidebarOpen: open,
    }));
  }, []);

  /**
   * Toggle compact mode
   */
  const toggleCompactMode = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      compactMode: !prev.compactMode,
    }));
  }, []);

  /**
   * Toggle notifications
   */
  const toggleNotifications = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      notificationsEnabled: !prev.notificationsEnabled,
    }));
  }, []);

  /**
   * Update multiple settings at once
   */
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  /**
   * Reset all settings to defaults
   */
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Context value
  const value: AppContextType = {
    // Settings
    settings,

    // UI State (convenience properties)
    isSidebarOpen: settings.sidebarOpen,
    isCompactMode: settings.compactMode,
    notificationsEnabled: settings.notificationsEnabled,

    // Actions
    toggleSidebar,
    setSidebarOpen,
    toggleCompactMode,
    toggleNotifications,
    updateSettings,
    resetSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Custom hook to use the App Context
 * Must be used within an AppProvider
 * 
 * @throws {Error} If used outside of AppProvider
 * 
 * @example
 * ```tsx
 * function Sidebar() {
 *   const { isSidebarOpen, toggleSidebar } = useApp();
 *   
 *   return (
 *     <aside className={cn("sidebar", { open: isSidebarOpen })}>
 *       <button onClick={toggleSidebar}>Toggle</button>
 *     </aside>
 *   );
 * }
 * ```
 */
export function useApp(): AppContextType {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }

  return context;
}

/**
 * Hook to access only sidebar state
 * Convenience hook for components that only need sidebar state
 * 
 * @example
 * ```tsx
 * function Header() {
 *   const { isSidebarOpen, toggleSidebar } = useSidebar();
 *   
 *   return (
 *     <header>
 *       <button onClick={toggleSidebar}>
 *         {isSidebarOpen ? 'Close' : 'Open'} Menu
 *       </button>
 *     </header>
 *   );
 * }
 * ```
 */
export function useSidebar() {
  const { isSidebarOpen, toggleSidebar, setSidebarOpen } = useApp();

  return {
    isSidebarOpen,
    toggleSidebar,
    setSidebarOpen,
  };
}

