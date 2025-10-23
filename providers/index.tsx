"use client";

import { ThemeProvider } from "./theme-provider";
import { AppProvider } from "./app-provider";
import { UserProvider } from "./user-provider";

/**
 * Combined Providers Component
 * Wraps all providers in the correct order
 * 
 * Order matters! Providers are composed from outer to inner:
 * 1. ThemeProvider - Outermost, affects entire app styling
 * 2. AppProvider - App-level settings and UI state
 * 3. UserProvider - User-specific state (depends on app being initialized)
 * 
 * @example
 * ```tsx
 * // app/layout.tsx
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="en" suppressHydrationWarning>
 *       <body>
 *         <Providers>
 *           {children}
 *         </Providers>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AppProvider>
        <UserProvider>{children}</UserProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

// Re-export individual providers for flexibility
export { ThemeProvider } from "./theme-provider";
export { AppProvider, useApp, useSidebar } from "./app-provider";
export { UserProvider, useUser, useIsAuthenticated, useRequireUser } from "./user-provider";

