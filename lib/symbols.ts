// Infrastructure dependency symbols
export const INFRASTRUCTURE_TYPES = {
  SupabaseClient: Symbol.for("SupabaseClient"),
  // Add your infrastructure dependencies here
} as const;

// Application symbols for dependency injection
export const APPLICATION_SYMBOLS = {
  // Add your application-level symbols here
  // Example: UserRepository: Symbol.for("UserRepository"),
} as const;

// Repository symbols
export const REPOSITORY_TYPES = {
  AuthRepository: Symbol.for("AuthRepository"),
  UserRepository: Symbol.for("UserRepository"),
  // Add your repository symbols here
} as const;

// Service symbols
export const SERVICE_TYPES = {
  AuthService: Symbol.for("AuthService"),
  UserService: Symbol.for("UserService"),
  // Add your service symbols here
} as const;

// Combined symbols for easy access
export const SYMBOLS = {
  ...APPLICATION_SYMBOLS,
  ...INFRASTRUCTURE_TYPES,
  ...REPOSITORY_TYPES,
  ...SERVICE_TYPES,
} as const;

