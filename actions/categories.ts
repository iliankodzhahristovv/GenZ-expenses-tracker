"use server";

import { createClient } from "@/lib/supabase/server";
import { ApiResponseBuilder } from "@/types/common.types";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";
import { container } from "@/lib/container-config";
import { CategoryService } from "@/modules/categories";
import { CategoryUIMapper } from "@/mappers/category-ui.mapper";
import { GroupedCategoriesUI } from "@/models/category-ui.model";

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

    // Resolve service from DI container
    const categoryService = container.get(CategoryService);

    // Check if user has categories
    const hasCategories = await categoryService.hasCategories(user.id);

    // If user has no categories, return defaults
    if (!hasCategories) {
      return ApiResponseBuilder.success<GroupedCategoriesUI>(DEFAULT_CATEGORIES);
    }

    // Get user's categories from service
    const groupedCategories = await categoryService.getUserCategories(user.id);

    // Map to UI format
    const categoriesUI = CategoryUIMapper.fromDomain(groupedCategories);

    return ApiResponseBuilder.success<GroupedCategoriesUI>(categoriesUI);
  } catch (error) {
    console.error("Error in getUserCategoriesAction:", error);
    return ApiResponseBuilder.failure("An unexpected error occurred");
  }
}

/**
 * Save user's categories to database
 */
export async function saveUserCategoriesAction(
  categories: GroupedCategoriesUI
) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    // Resolve service from DI container
    const categoryService = container.get(CategoryService);

    // Convert UI model to domain model
    const categoriesDomain = CategoryUIMapper.toDomain(categories);

    // Save categories via service
    await categoryService.saveUserCategories(user.id, categoriesDomain);

    return ApiResponseBuilder.success({ message: "Categories saved successfully" });
  } catch (error) {
    console.error("Error in saveUserCategoriesAction:", error);
    return ApiResponseBuilder.failure("An unexpected error occurred");
  }
}


