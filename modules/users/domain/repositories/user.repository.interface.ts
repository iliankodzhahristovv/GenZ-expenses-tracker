import { User } from "../models/user.model";

/**
 * Repository interface for User entity
 * Defines the contract for data access operations
 * This interface is part of the domain layer
 */
export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findAll(): Promise<User[]>;
  abstract create(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;
  abstract update(id: string, user: Partial<User>): Promise<User>;
  abstract delete(id: string): Promise<void>;
}

