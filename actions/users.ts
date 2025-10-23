"use server";

import { container } from "@/lib/container-config";
import { UserService } from "@/modules/users";
import { UserUIMapper, UserUI } from "@/mappers/user-ui.mapper";

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
    const user = await userService.createUser({ email, name });
    
    return UserUIMapper.fromDomain(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

