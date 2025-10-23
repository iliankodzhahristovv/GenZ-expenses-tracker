# Providers Guide

Complete guide to using context providers for state management in this template.

## Overview

This template includes three main providers that demonstrate best practices for React context and state management:

1. **ThemeProvider** - Theme management (light/dark mode)
2. **UserProvider** - User authentication and profile state
3. **AppProvider** - Global application settings and UI state

## Provider Architecture

```
┌────────────────────────────────────────┐
│         Providers Wrapper              │
│  (providers/index.tsx)                 │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │      ThemeProvider               │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │      AppProvider           │  │  │
│  │  │  ┌──────────────────────┐  │  │  │
│  │  │  │   UserProvider       │  │  │  │
│  │  │  │                      │  │  │  │
│  │  │  │   {children}         │  │  │  │
│  │  │  └──────────────────────┘  │  │  │
│  │  └────────────────────────────┘  │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

## UserProvider

### Purpose
Manages global user authentication state across the application.

### Features
- ✅ Current user state management
- ✅ Loading and error states
- ✅ LocalStorage persistence
- ✅ User update and logout actions
- ✅ Refresh user data from server

### Usage

```typescript
import { useUser, useIsAuthenticated, useRequireUser } from "@/providers";

function MyComponent() {
  // Basic usage
  const { currentUser, isLoading, error } = useUser();

  // Update user
  const { updateCurrentUser } = useUser();
  updateCurrentUser({ displayName: "New Name" });

  // Logout
  const { clearUser } = useUser();
  clearUser();

  // Refresh user data
  const { refreshUser } = useUser();
  await refreshUser();
}
```

### Convenience Hooks

#### `useIsAuthenticated()`
Returns boolean indicating if user is logged in:

```typescript
function ProtectedPage() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <Dashboard />;
}
```

#### `useRequireUser()`
Returns user or throws error (for protected components):

```typescript
function ProfilePage() {
  const user = useRequireUser(); // Guaranteed non-null
  
  return <div>Welcome, {user.displayName}!</div>;
}
```

### API Reference

```typescript
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
```

## AppProvider

### Purpose
Manages global application settings and UI state.

### Features
- ✅ Sidebar open/closed state
- ✅ Compact mode toggle
- ✅ Notifications enabled/disabled
- ✅ Batch update settings
- ✅ Reset to defaults

### Usage

```typescript
import { useApp, useSidebar } from "@/providers";

function MyComponent() {
  // Full app context
  const { settings, toggleSidebar, toggleCompactMode } = useApp();

  // Just sidebar state (convenience hook)
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  // Update multiple settings
  const { updateSettings } = useApp();
  updateSettings({
    sidebarOpen: false,
    compactMode: true,
  });

  // Reset all settings
  const { resetSettings } = useApp();
  resetSettings();
}
```

### API Reference

```typescript
interface AppContextType {
  // Settings
  settings: AppSettings;

  // UI State (convenience properties)
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
```

## ThemeProvider

### Purpose
Manages dark/light theme across the application.

### Features
- ✅ System theme detection
- ✅ Theme persistence
- ✅ Smooth transitions

### Usage

```typescript
import { useTheme } from "next-themes";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle Theme
    </button>
  );
}
```

## Best Practices

### 1. Provider Order Matters

Always wrap providers in the correct order from most general to most specific:

```typescript
// ✅ Correct order
<ThemeProvider>
  <AppProvider>
    <UserProvider>
      {children}
    </UserProvider>
  </AppProvider>
</ThemeProvider>

// ❌ Wrong order (user depends on app being initialized)
<UserProvider>
  <AppProvider>
    {children}
  </AppProvider>
</UserProvider>
```

### 2. Use Convenience Hooks

Create specific hooks for common patterns:

```typescript
// Instead of this
function Component() {
  const { isSidebarOpen, toggleSidebar } = useApp();
}

// Use convenience hook
function Component() {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
}
```

### 3. Error Handling

Always include error checking in your context hooks:

```typescript
export function useUser(): UserContextType {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
```

### 4. Type Safety

Always type your context properly:

```typescript
interface MyContextType {
  value: string;
  setValue: (value: string) => void;
}

const MyContext = createContext<MyContextType | undefined>(undefined);
```

### 5. Memoize Callbacks

Use `useCallback` for action functions to prevent unnecessary re-renders:

```typescript
const updateCurrentUser = useCallback((updates: Partial<UserUI>) => {
  setCurrentUser((prev) => {
    if (!prev) return null;
    return { ...prev, ...updates };
  });
}, []);
```

## Creating a New Provider

Follow this template to create a new provider:

```typescript
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

// 1. Define context type
interface MyContextType {
  value: string;
  setValue: (value: string) => void;
}

// 2. Create context
const MyContext = createContext<MyContextType | undefined>(undefined);

// 3. Create provider component
export function MyProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<string>("");

  const updateValue = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  const contextValue: MyContextType = {
    value,
    setValue: updateValue,
  };

  return <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>;
}

// 4. Create custom hook
export function useMyContext(): MyContextType {
  const context = useContext(MyContext);

  if (context === undefined) {
    throw new Error("useMyContext must be used within a MyProvider");
  }

  return context;
}

// 5. (Optional) Create convenience hooks
export function useMyValue() {
  const { value } = useMyContext();
  return value;
}
```

## Common Patterns

### Loading States

```typescript
function MyComponent() {
  const { data, isLoading, error } = useUser();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return <Content data={data} />;
}
```

### Conditional Rendering

```typescript
function ProtectedContent() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return <SecretContent />;
}
```

### Update on User Action

```typescript
function UpdateProfileButton() {
  const { updateCurrentUser } = useUser();

  const handleUpdate = () => {
    updateCurrentUser({
      displayName: "New Name",
    });
  };

  return <button onClick={handleUpdate}>Update Name</button>;
}
```

### Combine Multiple Contexts

```typescript
function StatusBar() {
  const { currentUser } = useUser();
  const { isCompactMode } = useApp();
  const { isSidebarOpen } = useSidebar();

  return (
    <div className={cn("status-bar", { compact: isCompactMode })}>
      <div>User: {currentUser?.displayName}</div>
      <div>Sidebar: {isSidebarOpen ? "Open" : "Closed"}</div>
    </div>
  );
}
```

## Testing Providers

### Wrap Tests with Provider

```typescript
import { render } from "@testing-library/react";
import { UserProvider } from "@/providers";

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <UserProvider>
      {ui}
    </UserProvider>
  );
}

test("renders user name", () => {
  renderWithProviders(<MyComponent />);
  // ... assertions
});
```

### Mock Provider Values

```typescript
const mockUserContext = {
  currentUser: { id: "1", email: "test@example.com" },
  isLoading: false,
  error: null,
  setCurrentUser: jest.fn(),
  updateCurrentUser: jest.fn(),
  clearUser: jest.fn(),
  refreshUser: jest.fn(),
};

// Use mock in tests
jest.mock("@/providers", () => ({
  useUser: () => mockUserContext,
}));
```

## Performance Considerations

### 1. Split Large Contexts

Instead of one large context with everything, split into smaller focused contexts:

```typescript
// ❌ Bad: One giant context
const AppContext = { user, theme, settings, notifications, ... }

// ✅ Good: Separate concerns
const UserContext = { user, updateUser, ... }
const ThemeContext = { theme, setTheme }
const SettingsContext = { settings, updateSettings }
```

### 2. Memoize Context Values

```typescript
const contextValue = useMemo(
  () => ({
    value,
    setValue,
  }),
  [value]
);
```

### 3. Use Convenience Hooks

Create focused hooks that only return what's needed:

```typescript
// Instead of returning entire context
export function useSidebar() {
  const { isSidebarOpen, toggleSidebar } = useApp();
  return { isSidebarOpen, toggleSidebar };
}
```

## Examples

See working examples at `/examples/providers` in the running application.

## Summary

Providers in this template follow these principles:

- ✅ **Type-safe** with full TypeScript support
- ✅ **Error-safe** with proper error checking
- ✅ **Documented** with JSDoc comments
- ✅ **Tested** patterns that work at scale
- ✅ **Flexible** and easy to extend

Use them as a foundation for managing state in your application!

