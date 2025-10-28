// Application configuration
export const APP_NAME = "Sidequest";

// Route constants
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  GETTING_STARTED: "/getting-started",
  DASHBOARD: "/dashboard",
  CHAT: "/chat",
  EXPENSES: "/expenses",
  INCOME: "/income",
  SETTINGS: "/settings",
  USERS: "/users",
  
  // Add your app routes here
  // Example: PROJECT_DETAIL: (id: string) => `/projects/${id}`,
} as const;

// SWR cache keys
export const SWR_KEYS = {
  // Auth keys
  SIGN_IN: "sign-in",
  SIGN_UP: "sign-up",
  SIGN_OUT: "sign-out",
  CURRENT_USER: "current-user",
  CURRENT_SESSION: "current-session",
  
  // User keys
  USERS: "users",
  USER: "user",
  
  // Add your SWR keys here
  // Example: USER_PROFILE: "user-profile",
} as const;

// Pagination
export const PAGINATION_OPTIONS = [10, 20, 50, 100] as const;

// UUID validation regex pattern
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// LocalStorage keys
export const LOCAL_STORAGE_KEYS = {
  // Add your local storage keys here
  // Example: USER_PREFERENCES: "user-preferences",
} as const;

