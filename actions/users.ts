"use server";

import { container } from "@/lib/container-config";
import { UserService } from "@/modules/users";
import { UserUIMapper } from "@/mappers/user-ui.mapper";
import { UserUI } from "@/models/user-ui.model";
import { ApiResponseBuilder } from "@/types/common.types";
import { getCurrentUserAction } from "./auth";
import { isValidCurrency, getSupportedCurrencies } from "@/lib/currency-utils";
import { UpdateUserDTO } from "@/types/user-update.types";

/**
 * Server action to get user by ID
 * Maps domain model to UI model for presentation
 */
export async function getUserById(id: string): Promise<UserUI | null> {
  try {
    const userService = container.get(UserService);
    const user = await userService.getUserById(id);
    
    if (!user) return null;
    
    return UserUIMapper.fromDomain(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

/**
 * Server action to get all users
 */
export async function getAllUsers(): Promise<UserUI[]> {
  try {
    const userService = container.get(UserService);
    const users = await userService.getAllUsers();
    
    return users.map((user) => UserUIMapper.fromDomain(user));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

/**
 * Server action to create a new user
 */
export async function createUser(
  email: string,
  name: string | null
): Promise<UserUI | null> {
  try {
    const userService = container.get(UserService);
    const user = await userService.createUser({ 
      email, 
      name,
      currency: "USD" // Default ISO 4217 currency code for new users
    });
    
    return UserUIMapper.fromDomain(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

/**
 * Server action to update user profile
 */
export async function updateUserProfileAction(data: { displayName?: string; currency?: string }) {
  try {
    const currentUserResponse = await getCurrentUserAction();
    
    if (!currentUserResponse.success || !currentUserResponse.data) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    const userService = container.get(UserService);
    const updateData: UpdateUserDTO = {};
    
    if (data.displayName !== undefined) {
      updateData.name = data.displayName;
    }
    
    if (data.currency !== undefined) {
      // Validate currency before updating
      if (!isValidCurrency(data.currency)) {
        const supportedCurrencies = getSupportedCurrencies().join(", ");
        return ApiResponseBuilder.failure(
          `Invalid currency. Supported currencies are: ${supportedCurrencies}`
        );
      }
      updateData.currency = data.currency;
    }
    
    const updatedUser = await userService.updateUser(
      currentUserResponse.data.id,
      updateData
    );
    
    if (!updatedUser) {
      return ApiResponseBuilder.failure("Failed to update user profile");
    }

    return ApiResponseBuilder.success(UserUIMapper.fromDomain(updatedUser));
  } catch (error) {
    console.error("Error updating user profile:", error);
    return ApiResponseBuilder.failure(
      error instanceof Error ? error.message : "Failed to update profile"
    );
  }
}

