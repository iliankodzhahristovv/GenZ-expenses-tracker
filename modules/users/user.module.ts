import { Container } from "inversify";
import { UserRepository } from "./domain/repositories/user.repository.interface";
import { SupabaseUserRepository } from "./data/repositories/supabase-user.repository";
import { UserService } from "./domain/services/user.service";

/**
 * User Module
 * Registers all user-related dependencies in the Inversify container
 */
export class UserModule {
  static register(container: Container): void {
    // Bind repository
    container.bind(UserRepository).to(SupabaseUserRepository);
    
    // Bind service
    container.bind(UserService).toSelf().inSingletonScope();
  }
}

