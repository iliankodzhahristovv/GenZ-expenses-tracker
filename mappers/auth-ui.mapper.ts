import { AuthSession, AuthUser } from "@/modules/auth/domain/models/auth-session.model";
import type { AuthSessionUI, AuthUserUI } from "@/models/auth-ui.model";
import { UserUIMapper } from "./user-ui.mapper";

/**
 * Auth UI Mapper
 * 
 * Maps between auth domain models and UI models
 */
export class AuthUIMapper {
  /**
   * Map domain AuthSession to UI AuthSessionUI
   */
  static sessionFromDomain(domainSession: AuthSession): AuthSessionUI {
    return {
      user: UserUIMapper.fromDomain(domainSession.user),
      accessToken: domainSession.accessToken,
      refreshToken: domainSession.refreshToken,
      expiresAt: domainSession.expiresAt.toISOString(),
      isExpired: domainSession.isExpired,
      isValid: domainSession.isValid,
    };
  }

  /**
   * Map domain AuthUser to UI AuthUserUI
   */
  static userFromDomain(domainUser: AuthUser): AuthUserUI {
    return {
      id: domainUser.id,
      email: domainUser.email,
      emailConfirmed: domainUser.emailConfirmed,
      lastSignInAt: domainUser.lastSignInAt?.toISOString(),
      createdAt: domainUser.createdAt?.toISOString(),
    };
  }

  /**
   * Map array of domain AuthSessions to UI
   */
  static sessionFromDomainArray(domainSessions: AuthSession[]): AuthSessionUI[] {
    return domainSessions.map((session) => this.sessionFromDomain(session));
  }

  /**
   * Map array of domain AuthUsers to UI
   */
  static userFromDomainArray(domainUsers: AuthUser[]): AuthUserUI[] {
    return domainUsers.map((user) => this.userFromDomain(user));
  }
}

