import { UserUI } from "./user-ui.model";

/**
 * Auth Session UI Model
 * 
 * Represents an authenticated session for UI consumption
 */
export interface AuthSessionUI {
  user: UserUI;
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO date string
  isExpired: boolean;
  isValid: boolean;
}

/**
 * Auth User UI Model
 * 
 * Represents an authenticated user for UI consumption
 */
export interface AuthUserUI {
  id: string;
  email: string;
  emailConfirmed: boolean;
  lastSignInAt?: string; // ISO date string
  createdAt?: string; // ISO date string
}

