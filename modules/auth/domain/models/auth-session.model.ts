import { UserModel } from "../../../users/domain/models/user.model";

/**
 * AuthSession Domain Model
 * 
 * Represents an authenticated session with user information and tokens
 */
export class AuthSession {
  constructor(
    public readonly user: UserModel,
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly expiresAt: Date
  ) {}

  /**
   * Check if the session has expired
   */
  get isExpired(): boolean {
    return new Date() >= this.expiresAt;
  }

  /**
   * Check if the session is valid (not expired and has access token)
   */
  get isValid(): boolean {
    return !this.isExpired && !!this.accessToken;
  }
}

/**
 * AuthUser Domain Model
 * 
 * Represents the authentication user (from Supabase auth.users)
 */
export class AuthUser {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly emailConfirmed: boolean,
    public readonly lastSignInAt?: Date,
    public readonly createdAt?: Date
  ) {}
}

