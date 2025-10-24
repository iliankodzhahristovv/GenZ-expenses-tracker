import { User } from "@/modules/users";
import { UserUI } from "@/models/user-ui.model";

/**
 * Mapper for converting between User domain model and UI model
 */
export class UserUIMapper {
  /**
   * Convert domain model to UI model
   */
  static fromDomain(user: User): UserUI {
    return {
      id: user.id,
      email: user.email,
      displayName: user.name || "Anonymous",
      createdAt: user.createdAt ? user.createdAt.toLocaleDateString() : new Date().toLocaleDateString(),
      updatedAt: user.updatedAt ? user.updatedAt.toLocaleDateString() : new Date().toLocaleDateString(),
    };
  }

  /**
   * Convert UI model to domain model
   */
  static toDomain(userUI: UserUI): User {
    return {
      id: userUI.id,
      email: userUI.email,
      name: userUI.displayName === "Anonymous" ? null : userUI.displayName,
      createdAt: new Date(userUI.createdAt),
      updatedAt: new Date(userUI.updatedAt),
    };
  }
}

