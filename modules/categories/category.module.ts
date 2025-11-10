import { Container } from "inversify";
import { CategoryRepository } from "./domain/repositories/category.repository.interface";
import { SupabaseCategoryRepository } from "./data/repositories/supabase-category.repository";
import { CategoryService } from "./domain/services/category.service";

/**
 * Category Module
 * Registers all category-related dependencies in the Inversify container
 */
export class CategoryModule {
  static register(container: Container): void {
    // Bind repository
    container.bind(CategoryRepository).to(SupabaseCategoryRepository);
    
    // Bind service
    container.bind(CategoryService).toSelf().inSingletonScope();
  }
}







