import { GroupedCategories, CategoryItem } from "@/modules/categories";
import { GroupedCategoriesUI, CategoryUI } from "@/models/category-ui.model";

/**
 * Mapper between domain models and UI models for categories
 */
export class CategoryUIMapper {
  /**
   * Convert grouped categories from domain to UI format
   */
  static fromDomain(groupedCategories: GroupedCategories): GroupedCategoriesUI {
    const result: GroupedCategoriesUI = {};
    
    for (const [groupName, categories] of Object.entries(groupedCategories)) {
      result[groupName] = categories.map(cat => ({
        id: cat.id,
        icon: cat.icon,
        name: cat.name,
      }));
    }
    
    return result;
  }

  /**
   * Convert grouped categories from UI to domain format
   */
  static toDomain(groupedCategoriesUI: GroupedCategoriesUI): Record<string, CategoryItem[]> {
    const result: Record<string, CategoryItem[]> = {};
    
    for (const [groupName, categories] of Object.entries(groupedCategoriesUI)) {
      result[groupName] = categories.map(cat => ({
        id: cat.id,
        icon: cat.icon,
        name: cat.name,
      }));
    }
    
    return result;
  }
}


