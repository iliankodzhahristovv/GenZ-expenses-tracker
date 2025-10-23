"use server";

import { container } from "@/lib/container-config";
import { AuthService, type SignInCredentials, type SignUpCredentials } from "@/modules/auth";
import type { DataResponse } from "@/types/common.types";
import { DataResponseBuilder } from "@/types/common.types";
import { UserUIMapper, AuthUIMapper } from "@/mappers";
import type { UserUI, AuthSessionUI } from "@/models";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * Sign in with email and password
 */
export async function signInWithPasswordAction(
  credentials: SignInCredentials
): Promise<DataResponse<AuthSessionUI>> {
  try {
    const authService = await container.getAsync(AuthService);
    const session = await authService.signInWithPassword(credentials);

    const uiSession = AuthUIMapper.sessionFromDomain(session);
    return DataResponseBuilder.success(uiSession);
  } catch (error) {
    return DataResponseBuilder.failure(error instanceof Error ? error.message : "Sign in failed");
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithPasswordAction(
  credentials: SignUpCredentials
): Promise<DataResponse<AuthSessionUI>> {
  try {
    const authService = await container.getAsync(AuthService);
    const session = await authService.signUpWithPassword(credentials);

    const uiSession = AuthUIMapper.sessionFromDomain(session);
    return DataResponseBuilder.success(uiSession);
  } catch (error) {
    return DataResponseBuilder.failure(error instanceof Error ? error.message : "Sign up failed");
  }
}

/**
 * Sign out the current user
 */
export async function signOutAction(): Promise<void> {
  try {
    const authService = await container.getAsync(AuthService);
    await authService.signOut();
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUserAction(): Promise<DataResponse<UserUI | null>> {
  try {
    const authService = await container.getAsync(AuthService);
    const userProfile = await authService.getCurrentUserProfile();

    if (!userProfile) {
      return DataResponseBuilder.success(null);
    }

    const uiUser = UserUIMapper.fromDomain(userProfile);
    return DataResponseBuilder.success(uiUser);
  } catch (error) {
    console.error("Error getting current user:", error);
    return DataResponseBuilder.failure(error instanceof Error ? error.message : "Failed to get current user");
  }
}

/**
 * Get the current session
 */
export async function getCurrentSessionAction(): Promise<DataResponse<AuthSessionUI | null>> {
  try {
    const authService = await container.getAsync(AuthService);
    const session = await authService.getCurrentSession();

    if (!session) {
      return DataResponseBuilder.success(null);
    }

    const uiSession = AuthUIMapper.sessionFromDomain(session);
    return DataResponseBuilder.success(uiSession);
  } catch (error) {
    console.error("Error getting current session:", error);
    return DataResponseBuilder.failure(error instanceof Error ? error.message : "Failed to get current session");
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuthenticationAction(): Promise<DataResponse<UserUI>> {
  try {
    const authService = await container.getAsync(AuthService);
    await authService.requireAuthentication();

    const userProfile = await authService.getCurrentUserProfile();
    if (!userProfile) {
      redirect(ROUTES.LOGIN);
      return DataResponseBuilder.failure("User profile not found");
    }

    const uiUser = UserUIMapper.fromDomain(userProfile);
    return DataResponseBuilder.success(uiUser);
  } catch (error) {
    console.error("Authentication required:", error);
    redirect(ROUTES.LOGIN);
    return DataResponseBuilder.failure("Authentication required");
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticatedAction(): Promise<DataResponse<boolean>> {
  try {
    const authService = await container.getAsync(AuthService);
    const isAuth = await authService.isAuthenticated();
    return DataResponseBuilder.success(isAuth);
  } catch (error) {
    console.error("Error checking authentication:", error);
    return DataResponseBuilder.failure(error instanceof Error ? error.message : "Failed to check authentication");
  }
}

