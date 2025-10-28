import { Category } from "../../domain/models/category.model";
import { CategoryEntity } from "../entities/category.entity";

/**
 * Mapper between Category domain model and database entity
 */
export class CategoryMapper {
  static toDomain(entity: CategoryEntity): Category {
    return {
      id: entity.id,
      categorySlug: entity.category_slug,
      userId: entity.user_id,
      groupName: entity.group_name,
      icon: entity.icon,
      name: entity.name,
      createdAt: new Date(entity.created_at),
      updatedAt: new Date(entity.updated_at),
    };
  }

  static toEntity(domain: Category): CategoryEntity {
    return {
      id: domain.id,
      category_slug: domain.categorySlug,
      user_id: domain.userId,
      group_name: domain.groupName,
      icon: domain.icon,
      name: domain.name,
      created_at: domain.createdAt.toISOString(),
      updated_at: domain.updatedAt.toISOString(),
    };
  }

  static toDomainArray(entities: CategoryEntity[]): Category[] {
    return entities.map(CategoryMapper.toDomain);
  }
}

