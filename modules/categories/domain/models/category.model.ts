/**
 * Domain model for Category
 * This represents the core business entity
 */
export interface Category {
  id: string;
  categorySlug: string;
  userId: string;
  groupName: string;
  icon: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Grouped categories structure
 */
export interface GroupedCategories {
  [groupName: string]: CategoryItem[];
}

/**
 * Category item without metadata
 * id field contains the category_slug for stable identification
 */
export interface CategoryItem {
  id: string; // category_slug
  icon: string;
  name: string;
}

