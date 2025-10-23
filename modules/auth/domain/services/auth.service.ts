import { injectable, inject } from "inversify";
import {
  AuthRepository,
  SignInCredentials,
  SignUpCredentials,
} from "../repositories/auth.repository.interface";
import { AuthSession, AuthUser } from "../models/auth-session.model";
import { UserModel } from "../../../users/domain/models/user.model";

/**
 * Auth Service
 * 
 * Contains business logic for authentication operations
 */
@injectable()
export class AuthService {
  constructor(@inject(AuthRepository) private authRepository: AuthRepository) {}

  /**
   * Sign in with email and password
   */
  async signInWithPassword(credentials: SignInCredentials): Promise<AuthSession> {
    return await this.authRepository.signInWithPassword(credentials);
  }

  /**
   * Sign up a new user with email and password
   */
  async signUpWithPassword(credentials: SignUpCredentials): Promise<AuthSession> {
    return await this.authRepository.signUpWithPassword(credentials);
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    return await this.authRepository.signOut();
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    return await this.authRepository.getCurrentUser();
  }

  /**
   * Get the current session
   */
  async getCurrentSession(): Promise<AuthSession | null> {
    return await this.authRepository.getCurrentSession();
  }

  /**
   * Get the current user's profile
   */
  async getCurrentUserProfile(): Promise<UserModel | null> {
    return await this.authRepository.getCurrentUserProfile();
  }

  /**
   * Refresh the current session
   */
  async refreshSession(): Promise<AuthSession | null> {
    return await this.authRepository.refreshSession();
  }

  /**
   * Require authentication - throws error if not authenticated
   */
  async requireAuthentication(): Promise<AuthUser> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error("Authentication required");
    }
    return user;
  }

  /**
   * Check if a user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}

