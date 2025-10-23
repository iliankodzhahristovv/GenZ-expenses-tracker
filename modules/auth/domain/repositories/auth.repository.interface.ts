import { AuthSession, AuthUser } from "../models/auth-session.model";
import { UserModel } from "../../../users/domain/models/user.model";

/**
 * Credentials for email/password sign in
 */
export interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * Credentials for sign up
 */
export interface SignUpCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Auth Repository Interface
 * 
 * Defines the contract for authentication operations
 */
export abstract class AuthRepository {
  /**
   * Sign in with email and password
   */
  abstract signInWithPassword(credentials: SignInCredentials): Promise<AuthSession>;

  /**
   * Sign up a new user with email and password
   */
  abstract signUpWithPassword(credentials: SignUpCredentials): Promise<AuthSession>;

  /**
   * Sign out the current user
   */
  abstract signOut(): Promise<void>;

  /**
   * Get the current authenticated user
   */
  abstract getCurrentUser(): Promise<AuthUser | null>;

  /**
   * Get the current session
   */
  abstract getCurrentSession(): Promise<AuthSession | null>;

  /**
   * Get the current user's profile from the database
   */
  abstract getCurrentUserProfile(): Promise<UserModel | null>;

  /**
   * Refresh the current session
   */
  abstract refreshSession(): Promise<AuthSession | null>;
}

