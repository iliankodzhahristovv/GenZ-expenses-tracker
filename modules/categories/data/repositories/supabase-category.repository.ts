import { injectable } from "inversify";
import { CategoryRepository } from "../../domain/repositories/category.repository.interface";
import { Category } from "../../domain/models/category.model";
import { CategoryMapper } from "../mappers/category.mapper";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase implementation of Category Repository
 */
@injectable()
export class SupabaseCategoryRepository extends CategoryRepository {
  async findByUserId(userId: string): Promise<Category[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("categories")
      .select("id, category_slug, user_id, group_name, icon, name, created_at, updated_at")
      .eq("user_id", userId)
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }

    return CategoryMapper.toDomainArray(data || []);
  }

  async deleteByUserId(userId: string): Promise<void> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting categories:", error);
      throw new Error("Failed to delete categories");
    }
  }

  async createMany(categories: Omit<Category, "id" | "createdAt" | "updatedAt">[]): Promise<void> {
    const supabase = await createClient();
    
    const categoriesToInsert = categories.map((cat) => ({
      category_slug: cat.categorySlug,
      user_id: cat.userId,
      group_name: cat.groupName,
      icon: cat.icon,
      name: cat.name,
    }));

    const { error } = await supabase
      .from("categories")
      .insert(categoriesToInsert);

    if (error) {
      console.error("Error inserting categories:", error);
      throw new Error("Failed to insert categories");
    }
  }

  /**
   * Atomically replace all user categories using a transactional RPC
   * This ensures data integrity - either all categories are saved or none are
   */
  async replaceAllForUser(userId: string, categories: Omit<Category, "id" | "createdAt" | "updatedAt">[]): Promise<void> {
    const supabase = await createClient();
    
    // Prepare categories for the RPC function
    const categoriesJson = categories.map((cat) => ({
      category_slug: cat.categorySlug,
      group_name: cat.groupName,
      icon: cat.icon,
      name: cat.name,
    }));

    // Call the transactional RPC function
    const { error } = await supabase.rpc("save_user_categories_transaction", {
      p_user_id: userId,
      p_categories: categoriesJson,
    });

    if (error) {
      console.error("Error saving categories:", error);
      throw new Error("Failed to save categories");
    }
  }
}

