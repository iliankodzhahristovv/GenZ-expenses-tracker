"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserUI } from "@/mappers/user-ui.mapper";

/**
 * User Context Type
 * Defines the shape of the context value
 */
interface UserContextType {
  // State
  currentUser: UserUI | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentUser: (user: UserUI | null) => void;
  updateCurrentUser: (updates: Partial<UserUI>) => void;
  clearUser: () => void;
  refreshUser: () => Promise<void>;
}

/**
 * Create the context with undefined as default
 * This ensures we must use the provider
 */
const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * Provider Props
 */
interface UserProviderProps {
  children: React.ReactNode;
  initialUser?: UserUI | null;
}

/**
 * User Provider Component
 * Manages global user state and provides actions to update it
 * 
 * @example
 * ```tsx
 * // In your root layout
 * <UserProvider initialUser={serverUser}>
 *   {children}
 * </UserProvider>
 * 
 * // In any component
 * function MyComponent() {
 *   const { currentUser, updateCurrentUser } = useUser();
 *   // ...
 * }
 * ```
 */
export function UserProvider({ children, initialUser = null }: UserProviderProps) {
  // State
  const [currentUser, setCurrentUser] = useState<UserUI | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user from localStorage on mount
   * Useful for persisting user across page refreshes
   */
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser && !initialUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (err) {
        console.error("Failed to parse stored user:", err);
        localStorage.removeItem("currentUser");
      }
    }
  }, [initialUser]);

  /**
   * Persist user to localStorage whenever it changes
   */
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  /**
   * Update current user with partial data
   * Useful for updating specific fields without replacing the entire object
   */
  const updateCurrentUser = useCallback((updates: Partial<UserUI>) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  }, []);

  /**
   * Clear user data
   * Useful for logout
   */
  const clearUser = useCallback(() => {
    setCurrentUser(null);
    setError(null);
    localStorage.removeItem("currentUser");
  }, []);

  /**
   * Refresh user data from server
   * Example of how to integrate with server actions
   */
  const refreshUser = useCallback(async () => {
    if (!currentUser?.id) {
      setError("No user to refresh");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Example: Call your server action here
      // const freshUser = await getUserById(currentUser.id);
      // if (freshUser) {
      //   setCurrentUser(freshUser);
      // }
      
      // For now, just simulate a refresh
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("User refreshed");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh user";
      setError(errorMessage);
      console.error("Error refreshing user:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  // Context value
  const value: UserContextType = {
    // State
    currentUser,
    isLoading,
    error,

    // Actions
    setCurrentUser,
    updateCurrentUser,
    clearUser,
    refreshUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * Custom hook to use the User Context
 * Must be used within a UserProvider
 * 
 * @throws {Error} If used outside of UserProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { currentUser, updateCurrentUser, clearUser } = useUser();
 *   
 *   if (!currentUser) {
 *     return <div>Please log in</div>;
 *   }
 *   
 *   return (
 *     <div>
 *       <p>Hello, {currentUser.displayName}!</p>
 *       <button onClick={clearUser}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUser(): UserContextType {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}

/**
 * Hook to check if user is authenticated
 * Convenience hook for common use case
 * 
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const isAuthenticated = useIsAuthenticated();
 *   
 *   if (!isAuthenticated) {
 *     return <LoginForm />;
 *   }
 *   
 *   return <Dashboard />;
 * }
 * ```
 */
export function useIsAuthenticated(): boolean {
  const { currentUser } = useUser();
  return currentUser !== null;
}

/**
 * Hook to get current user or throw
 * Useful for pages/components that require authentication
 * 
 * @throws {Error} If no user is logged in
 * 
 * @example
 * ```tsx
 * function ProfilePage() {
 *   const user = useRequireUser();
 *   // user is guaranteed to be non-null here
 *   
 *   return <div>Welcome, {user.displayName}!</div>;
 * }
 * ```
 */
export function useRequireUser(): UserUI {
  const { currentUser } = useUser();

  if (!currentUser) {
    throw new Error("User is required but not logged in");
  }

  return currentUser;
}

