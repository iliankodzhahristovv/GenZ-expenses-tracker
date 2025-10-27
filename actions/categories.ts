"use server";

import { createClient } from "@/lib/supabase/server";
import { ApiResponseBuilder } from "@/types/common.types";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";

interface Category {
  id: string;
  icon: string;
  name: string;
}

/**
 * Get user's categories or return defaults if none exist
 */
export async function getUserCategoriesAction() {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    // Get user's categories from database
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      return ApiResponseBuilder.failure("Failed to fetch categories");
    }

    // If user has no categories, return defaults
    if (!categories || categories.length === 0) {
      return ApiResponseBuilder.success(DEFAULT_CATEGORIES);
    }

    // Group categories by group_name
    const groupedCategories: Record<string, Category[]> = {};
    
    categories.forEach((cat) => {
      if (!groupedCategories[cat.group_name]) {
        groupedCategories[cat.group_name] = [];
      }
      
      groupedCategories[cat.group_name].push({
        id: cat.id,
        icon: cat.icon,
        name: cat.name,
      });
    });

    return ApiResponseBuilder.success(groupedCategories);
  } catch (error) {
    console.error("Error in getUserCategoriesAction:", error);
    return ApiResponseBuilder.failure("An unexpected error occurred");
  }
}

/**
 * Save user's categories to database
 */
export async function saveUserCategoriesAction(
  categories: Record<string, Category[]>
) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    // Delete all existing categories for this user
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting categories:", deleteError);
      return ApiResponseBuilder.failure("Failed to delete existing categories");
    }

    // Insert all new categories
    const categoriesToInsert = [];
    
    for (const [groupName, cats] of Object.entries(categories)) {
      for (const cat of cats) {
        categoriesToInsert.push({
          user_id: user.id,
          group_name: groupName,
          icon: cat.icon,
          name: cat.name,
        });
      }
    }

    if (categoriesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("categories")
        .insert(categoriesToInsert);

      if (insertError) {
        console.error("Error inserting categories:", insertError);
        return ApiResponseBuilder.failure("Failed to save categories");
      }
    }

    return ApiResponseBuilder.success({ message: "Categories saved successfully" });
  } catch (error) {
    console.error("Error in saveUserCategoriesAction:", error);
    return ApiResponseBuilder.failure("An unexpected error occurred");
  }
}


