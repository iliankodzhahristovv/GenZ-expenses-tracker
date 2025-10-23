import { AuthSession, AuthUser } from "../../domain/models/auth-session.model";
import { UserMapper } from "../../../users/data/mappers/user.mapper";
import { UserEntity } from "../../../../types/entity-types";
import type { Session, User } from "@supabase/supabase-js";

/**
 * Auth Mapper
 * 
 * Maps between Supabase auth entities and domain models
 */
export class AuthMapper {
  /**
   * Map Supabase session to domain AuthSession
   */
  static sessionToDomain(entity: Session, userProfile?: UserEntity): AuthSession {
    // If we have a user profile from the database, use it
    // Otherwise, create a basic user from the auth user
    const userModel = userProfile
      ? UserMapper.toDomain(userProfile)
      : UserMapper.toDomain({
          id: entity.user.id,
          email: entity.user.email,
          name: null,
          created_at: entity.user.created_at || new Date().toISOString(),
          updated_at: entity.user.updated_at || new Date().toISOString(),
        } as UserEntity);

    return new AuthSession(
      userModel,
      entity.access_token,
      entity.refresh_token || "",
      new Date((entity.expires_at || 0) * 1000) // Convert from seconds to milliseconds
    );
  }

  /**
   * Map Supabase user to domain AuthUser
   */
  static userToDomain(entity: User): AuthUser {
    return new AuthUser(
      entity.id,
      entity.email || "",
      !!entity.email_confirmed_at,
      entity.last_sign_in_at ? new Date(entity.last_sign_in_at) : undefined,
      entity.created_at ? new Date(entity.created_at) : undefined
    );
  }
}

