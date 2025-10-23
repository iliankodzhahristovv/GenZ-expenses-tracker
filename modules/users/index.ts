// Export domain models
export { User } from "./domain/models/user.model";

// Export value objects
export { UserId } from "./domain/value-objects/user-id";

// Export repositories
export { UserRepository } from "./domain/repositories/user.repository.interface";
export { SupabaseUserRepository } from "./data/repositories/supabase-user.repository";

// Export services
export { UserService } from "./domain/services/user.service";

// Export module
export { UserModule } from "./user.module";

