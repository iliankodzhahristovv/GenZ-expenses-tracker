/**
 * UI model for Category
 * Used in the presentation layer
 */
export interface CategoryUI {
  id: string;
  icon: string;
  name: string;
}

/**
 * Grouped categories for UI
 */
export interface GroupedCategoriesUI {
  [groupName: string]: CategoryUI[];
}







