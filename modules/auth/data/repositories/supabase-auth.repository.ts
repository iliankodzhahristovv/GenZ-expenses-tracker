import { injectable } from "inversify";
import { createClient } from "../../../../lib/supabase/server";
import {
  AuthRepository,
  SignInCredentials,
  SignUpCredentials,
} from "../../domain/repositories/auth.repository.interface";
import { AuthSession, AuthUser } from "../../domain/models/auth-session.model";
import { UserModel } from "../../../users/domain/models/user.model";
import { AuthMapper } from "../mappers/auth.mapper";
import { UserMapper } from "../../../users/data/mappers/user.mapper";
import { UserEntity } from "../../../../types/entity-types";
import type { Session, User } from "@supabase/supabase-js";

/**
 * Supabase implementation of Auth Repository
 */
@injectable()
export class SupabaseAuthRepository extends AuthRepository {
  constructor() {
    super();
  }

  async signInWithPassword(credentials: SignInCredentials): Promise<AuthSession> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }

    if (!data.session || !data.user) {
      throw new Error("Authentication failed: No session or user returned");
    }

    // Get user profile for complete information
    const { data: profile } = await supabase.from("users").select("*").eq("id", data.user.id).single();

    return AuthMapper.sessionToDomain(data.session as Session, profile as UserEntity);
  }

  async signUpWithPassword(credentials: SignUpCredentials): Promise<AuthSession> {
    const supabase = await createClient();

    // First, create the auth user
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          first_name: credentials.firstName,
          last_name: credentials.lastName,
        },
      },
    });

    if (error) {
      throw new Error(`Sign up failed: ${error.message}`);
    }

    if (!data.session || !data.user) {
      throw new Error("Sign up failed: No session or user returned");
    }

    // The user profile should be created automatically by a trigger
    // Get the profile
    const { data: profile } = await supabase.from("users").select("*").eq("id", data.user.id).single();

    return AuthMapper.sessionToDomain(data.session as Session, profile as UserEntity);
  }

  async signOut(): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return AuthMapper.userToDomain(user as User);
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    // Get user profile
    const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single();

    return AuthMapper.sessionToDomain(session as Session, profile as UserEntity);
  }

  async getCurrentUserProfile(): Promise<UserModel | null> {
    const supabase = await createClient();

    // Get the current auth user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Get user profile from database
    const { data: profile, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (dbError || !profile) {
      return null;
    }

    return UserMapper.toDomain(profile as UserEntity);
  }

  async refreshSession(): Promise<AuthSession | null> {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession();

    if (error || !session) {
      return null;
    }

    // Get user profile
    const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single();

    return AuthMapper.sessionToDomain(session as Session, profile as UserEntity);
  }
}

