/**
 * Database entity for Category
 * Represents the structure in Supabase
 */
export interface CategoryEntity {
  id: string;
  category_slug: string;
  user_id: string;
  group_name: string;
  icon: string;
  name: string;
  created_at: string;
  updated_at: string;
}

