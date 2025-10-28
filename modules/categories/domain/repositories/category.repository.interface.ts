import { Category } from "../models/category.model";

/**
 * Category Repository Interface
 * Defines the contract for category data access
 */
export abstract class CategoryRepository {
  abstract findByUserId(userId: string): Promise<Category[]>;
  abstract deleteByUserId(userId: string): Promise<void>;
  abstract createMany(categories: Omit<Category, "id" | "createdAt" | "updatedAt">[]): Promise<void>;
  abstract replaceAllForUser(userId: string, categories: Omit<Category, "id" | "createdAt" | "updatedAt">[]): Promise<void>;
}

