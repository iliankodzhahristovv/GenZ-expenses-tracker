import { User } from "../../domain/models/user.model";
import { UserEntity } from "../entities/user.entity";

/**
 * Mapper for converting between User domain model and database entity
 */
export class UserMapper {
  /**
   * Convert database entity to domain model
   */
  static toDomain(entity: UserEntity): User {
    return {
      id: entity.id,
      email: entity.email,
      name: entity.name,
      currency: entity.currency,
      createdAt: new Date(entity.created_at),
      updatedAt: new Date(entity.updated_at),
    };
  }

  /**
   * Convert domain model to database entity
   */
  static toEntity(domain: User): UserEntity {
    return {
      id: domain.id,
      email: domain.email,
      name: domain.name,
      currency: domain.currency,
      created_at: domain.createdAt.toISOString(),
      updated_at: domain.updatedAt.toISOString(),
    };
  }
}

