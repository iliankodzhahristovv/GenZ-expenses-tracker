import { injectable, inject } from "inversify";
import { CategoryRepository } from "../repositories/category.repository.interface";
import { Category, GroupedCategories, CategoryItem } from "../models/category.model";

/**
 * Category Service
 * Contains business logic for category operations
 * Uses repository through dependency injection
 */
@injectable()
export class CategoryService {
  constructor(
    @inject(CategoryRepository) private readonly categoryRepository: CategoryRepository
  ) {}

  /**
   * Get user's categories grouped by group name
   */
  async getUserCategories(userId: string): Promise<GroupedCategories> {
    const categories = await this.categoryRepository.findByUserId(userId);
    
    // Group categories by group_name
    const groupedCategories: GroupedCategories = {};
    
    categories.forEach((cat) => {
      if (!groupedCategories[cat.groupName]) {
        groupedCategories[cat.groupName] = [];
      }
      
      groupedCategories[cat.groupName].push({
        id: cat.categorySlug, // Use categorySlug as the stable identifier
        icon: cat.icon,
        name: cat.name,
      });
    });

    return groupedCategories;
  }

  /**
   * Check if user has any categories
   */
  async hasCategories(userId: string): Promise<boolean> {
    const categories = await this.categoryRepository.findByUserId(userId);
    return categories.length > 0;
  }

  /**
   * Save user's categories (replaces all existing categories)
   * Uses a transactional approach to ensure atomicity
   */
  async saveUserCategories(userId: string, groupedCategories: Record<string, CategoryItem[]>): Promise<void> {
    // Prepare categories to insert
    const categoriesToInsert: Omit<Category, "id" | "createdAt" | "updatedAt">[] = [];
    
    for (const [groupName, cats] of Object.entries(groupedCategories)) {
      for (const cat of cats) {
        categoriesToInsert.push({
          categorySlug: cat.id, // cat.id contains the slug from the UI
          userId,
          groupName,
          icon: cat.icon,
          name: cat.name,
        });
      }
    }

    // Use atomic replace operation - either all categories are saved or none are
    // This prevents data loss if the operation fails midway
    await this.categoryRepository.replaceAllForUser(userId, categoriesToInsert);
  }
}

